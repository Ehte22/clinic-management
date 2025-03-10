import { Request, Response, NextFunction, json } from "express"
import { customValidator } from "../utils/validator"
import { Receptionist } from "../models/Receptionist"
import expressAsyncHandler from "express-async-handler"
import mongoose, { ClientSession } from "mongoose"
import redisClient from "../services/redisClient"
import cloudinary from "../utils/uploadConfig"
import { IUserProtected } from "../utils/protected"
import { IUser, User } from "../models/User"
import { generatePassword } from "../utils/generatePassword"
import bcrypt from 'bcryptjs'
import { invalidateCache } from "../utils/redisMiddleware"

interface IReceptionistUpdates {
    firstName: string;
    lastName: string;
    email: string;
    mobile: string;
    status?: "active" | "inactive";
    working_hours?: Array<{
        day: string;
        from: string;
        to: string;
    }>
}


export const addReceptionist = expressAsyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { firstName, lastName, email, mobile, status, working_hours } = req.body;
    const { clinicId: clinic } = req.user as IUserProtected;

    const processedBody = {
        firstName, lastName, email, mobile, status: status || "active", working_hours: working_hours || []
    }
    const receptionistValidationRules = {
        firstName: { required: true },
        lastName: { required: true },
        email: { required: true },
        mobile: { required: true },
        status: { required: true, enum: ["active", "inactive"] },
        working_hours: [
            {
                day: { required: true },
                from: { required: true },
                to: { required: true },
            },
        ],
    };

    const validationResult = customValidator(processedBody, receptionistValidationRules);
    if (validationResult.isError) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: validationResult.error,
        });
    }

    const existingReceptionist = await User.findOne({ email });
    if (existingReceptionist) {
        return res.status(400).json({
            success: false,
            message: "Receptionist with this email already exists",
            errors: "Duplicate email found",
        });
    }

    const session: ClientSession = await mongoose.startSession();
    session.startTransaction();

    let profile = "";
    if (req.file) {
        const { secure_url } = await cloudinary.uploader.upload(req.file.path);
        profile = secure_url;
    }

    try {
        const generatedPassword = generatePassword(12);
        const hashPass = await bcrypt.hash(generatedPassword, 10);

        const userUpdates = {
            firstName,
            lastName,
            email,
            phone: mobile,
            profile,
            clinicId: clinic,
            role: "Receptionist",
            password: hashPass,
        };

        const updatedUser = await User.create([userUpdates], { session });
        if (!updatedUser) {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: "User creation failed." });
        }

        const updatedReceptionist = await Receptionist.create(
            [{ clinic, working_hours, user: updatedUser[0]._id }],
            { session }
        );
        if (!updatedReceptionist) {
            await session.abortTransaction();
            await User.findByIdAndDelete(updatedUser[0]._id); // Cleanup the user record
            return res.status(400).json({ success: false, message: "Receptionist creation failed." });
        }

        await session.commitTransaction()
        const data = { ...updatedReceptionist[0].toObject(), ...updatedUser[0].toObject() }

        invalidateCache("receptionists:*")
        invalidateCache("users:*")
        res.status(201).json({
            success: true,
            message: "Receptionist created successfully",
            data,
        });
    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
            await User.deleteOne({ email }); // Ensure cleanup only if transaction was not committed
        }
        return res.status(500).json({
            success: false,
            message: "Server Error",
            error: error instanceof Error ? error.message : "",
        });
    } finally {
        session.endSession();
    }
})

export const getAllReceptionists = expressAsyncHandler(async (req: Request, res: Response): Promise<any> => {

    try {


        const { clinicId: clinic, role } = req.user as IUserProtected;

        const sortedQuery = JSON.stringify(Object.fromEntries(Object.entries(req.query).sort()))
        const cacheKey = `receptionists:${clinic || "all"}:${sortedQuery}`
        const cachedData = await redisClient.get(cacheKey)

        if (cachedData) {
            return res.status(200).json(JSON.parse(cachedData))
        }


        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;
        const filter = req.query.filter || '';

        const searchedData = await User.find({
            $or: [
                { "firstName": { $regex: filter, $options: "i" } },
                { "lastName": { $regex: filter, $options: "i" } },
                { "email": { $regex: filter, $options: "i" } },
                { "role": { $regex: filter, $options: "i" } },
            ]
        })

        const userIds = searchedData.map(item => item._id)

        let filterQuery: any = {
            isDelete: false,
            ...(filter && {
                $or: [
                    { status: { $regex: filter, $options: "i" } },
                    ...(userIds.length ? [{ user: { $in: userIds } }] : []),
                ]
            })
        }

        if (role !== "Super Admin") {
            filterQuery.clinic = clinic;
        } else {
            if (req.query.selectedClinicId) {
                filterQuery.clinic = req.query.selectedClinicId;
            }
        }

        const totalReceptionists = await Receptionist.countDocuments(filterQuery);
        const receptionists = await Receptionist.find(filterQuery)
            .populate("user")
            .skip(skip)
            .limit(limit)
            .exec();


        redisClient.setex(
            cacheKey,
            3600,
            JSON.stringify({
                success: true,
                message: "Receptionists fetched successfully from database",
                total: totalReceptionists,
                page,
                limit,
                totalPages: Math.ceil(totalReceptionists / limit),
                data: receptionists
            })
        )

        res.status(200).json({
            success: true,
            message: "Receptionists fetched successfully from database",
            total: totalReceptionists,
            page,
            limit,
            totalPages: Math.ceil(totalReceptionists / limit),
            data: receptionists
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
})

export const getReceptionistById = expressAsyncHandler(async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params;
    try {

        const cacheKey = `receptionist:${id}`
        const cachedData = await redisClient.get(cacheKey)

        if (cachedData) {
            return res.status(200).json(JSON.parse(cachedData))
        }

        const receptionist = await Receptionist.findById(id).populate("user clinic");
        if (!receptionist) {
            return res.status(404).json({ success: false, message: "Receptionist not found" });
        }

        redisClient.setex(
            cacheKey,
            3600,
            JSON.stringify({ success: true, message: "Receptionist retrieved successfully from database", data: receptionist })
        )
        res.status(200).json({ success: true, message: "Receptionist retrieved successfully from database", data: receptionist });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
})

export const changeReceptionistStatus = expressAsyncHandler(async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const receptionist = await Receptionist.findById(id).populate("clinic user");
        if (!receptionist) {
            return res.status(404).json({ success: false, message: "Receptionist not found" });
        }
        const updateId = receptionist?.user?._id
        const update = await User.findByIdAndUpdate(updateId, { status })
        const data = { ...update, ...receptionist }

        invalidateCache(`receptionist:${id}`)
        invalidateCache("receptionists:*")
        invalidateCache("users:*")
        res.status(200).json({ success: true, message: "Status updated successfully", data })
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error instanceof Error ? error.message : "Unknown error" });
    }
})

export const getReceptionistsByClinic = expressAsyncHandler(async (req: Request, res: Response): Promise<any> => {
    const { clinic } = req.params;

    try {

        const receptionists = await Receptionist.find({ clinic }).populate("user clinic");

        redisClient.setex(
            req.originalUrl,
            3600,
            JSON.stringify({ success: true, message: "Receptionists retrieved successfully from database", data: receptionists })
        )
        res.status(200).json({ success: true, message: "Receptionists retrieved successfully from database", data: receptionists });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error instanceof Error ? error.message : "Unknown error" });
    }
})

export const updateReceptionist = expressAsyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params;
    const { firstName, lastName, email, mobile, status, working_hours } = req.body;

    const receptionistUpdates: IReceptionistUpdates = {
        firstName, lastName, email, mobile, status: status || "active", working_hours: working_hours || []
    };

    const receptionistValidationRules = {
        firstName: { required: true },
        lastName: { required: true },
        email: { required: true },
        mobile: { required: true },
        status: { required: true, enum: ["active", "inactive"] },
        working_hours: [
            {
                day: { required: true },
                from: { required: true },
                to: { required: true },
            },
        ],
    };

    const validationResult = customValidator(receptionistUpdates, receptionistValidationRules);
    if (validationResult.isError) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: validationResult.error,
        });
    }

    const session: ClientSession = await mongoose.startSession();
    session.startTransaction();

    let updatedProfile = "";
    if (req.file) {
        const { secure_url } = await cloudinary.uploader.upload(req.file.path);
        updatedProfile = secure_url;
    }

    try {
        const existingReceptionist = await Receptionist.findById(id).populate("user");
        if (!existingReceptionist) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: "Receptionist not found" });
        }
        const user = existingReceptionist.user as unknown as IUser;
        const userUpdates = {
            firstName: receptionistUpdates.firstName,
            lastName: receptionistUpdates.lastName,
            email: receptionistUpdates.email,
            phone: receptionistUpdates.mobile,
            profile: updatedProfile || user.profile,
        };

        const updatedUser = await User.findByIdAndUpdate(user?._id, userUpdates, { new: true, session });
        if (!updatedUser) {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: "User update failed." });
        }

        const updatedReceptionist = await Receptionist.findByIdAndUpdate(
            id,
            { status: receptionistUpdates.status, working_hours: receptionistUpdates.working_hours, user: updatedUser._id },
            { new: true, session }
        );

        if (!updatedReceptionist) {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: "Receptionist update failed." });
        }

        await session.commitTransaction();

        invalidateCache(`receptionist:${id}`)
        invalidateCache("receptionists:*")
        invalidateCache("users:*")
        res.status(200).json({
            success: true,
            message: "Receptionist and user data updated successfully",
            data: { receptionist: updatedReceptionist, user: updatedUser },
        });

    } catch (error) {
        await session.abortTransaction();
        res.status(500).json({ success: false, message: "Server error", error: error instanceof Error ? error.message : "Unknown error" });
    } finally {
        session.endSession();
    }
});



export const deleteReceptionist = expressAsyncHandler(async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params;
    const session: ClientSession = await mongoose.startSession();
    session.startTransaction();

    try {
        const deletedReceptionist = await Receptionist.findByIdAndUpdate(id, { isDelete: true }, { session });
        if (!deletedReceptionist) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: "Receptionist not found" });
        }
        await session.commitTransaction()
        invalidateCache(`receptionist:${id}`)
        invalidateCache("receptionists:*")
        invalidateCache("users:*")
        res.status(200).json({ success: true, message: "Receptionist deleted successfully" });
    } catch (error) {
        await session.abortTransaction();
        res.status(500).json({ success: false, message: "Server error", error: error instanceof Error ? error.message : "Unknown error" });
    } finally {
        session.endSession();
    }
});














// export const getAllReceptionists = expressAsyncHandler(async (req: Request, res: Response): Promise<any> => {
//     const redisKey = req.originalUrl
//     try {
//         const cachedData = await redisClient.get(redisKey)
//         if (cachedData) {
//             const parsedData = JSON.parse(cachedData)
//             return res.status(200).json({ message: "Receptionists Fetch successfully from cache", ...parsedData, })
//         }

//         const page = parseInt(req.query.page as string) || 1;
//         const limit = parseInt(req.query.limit as string) || 10;
//         const skip = (page - 1) * limit;
//         const filter = req.query.filter || '';
//         const filterQuery: any = filter ? {
//             $or: [
//                 { label: { $regex: filter, $options: "i" } },
//                 { status: { $regex: filter, $options: "i" } },
//                 { _id: filter, }
//             ]
//         } : {};
//         const totalReceptionist = await Receptionist.countDocuments({ isDelete: false, ...filterQuery });
//         const receptionists = await Receptionist.find({ isDelete: false, ...filterQuery })
//             .populate("clinic doctor")
//             .skip(skip)
//             .limit(limit)
//             .exec()
//         await redisClient.set(redisKey, JSON.stringify({
//             success: true,
//             total: totalReceptionist,
//             page: page,
//             limit: limit,
//             totalPages: Math.ceil(totalReceptionist / limit),
//             data: receptionists,
//         }), "EX", 3600)

//         res.status(200).json({
//             success: true,
//             message: "Receptionists Fetch successfully from database",
//             total: totalReceptionist,
//             page: page,
//             limit: limit,
//             totalPages: Math.ceil(totalReceptionist / limit),
//             data: receptionists,
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: "Server error",
//             error: error instanceof Error ? error.message : "Unknown error",
//         })
//     }
// })
// export const getReceptionistById = expressAsyncHandler(async (req: Request, res: Response): Promise<any> => {
//     const { id } = req.params
//     const redisKey = getReceptionistById:${id}
//     try {
//         // const cachedData = await redisClient.get(redisKey)
//         // if (cachedData) {
//         //     return res.status(200).json({
//         //         success: true,
//         //         message: "Receptionist fetched successfully from cache",
//         //         data: JSON.parse(cachedData)
//         //     })
//         // }

//         const receptionist = await Receptionist.findById(id).populate("clinic doctor")
//         if (!receptionist) {
//             return res.status(404).json({ success: false, message: "Receptionist not found" })
//         }

//         await redisClient.set(redisKey, JSON.stringify(receptionist), "EX", 3600)
//         res.status(200).json({
//             success: true,
//             message: "Receptionist retrieved successfully from database",
//             data: receptionist,
//         })
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: "Server error",
//             error: error instanceof Error ? error.message : "Unknown error",
//         })
//     }
// })
// export const changeReceptionistStatus = expressAsyncHandler(async (req: Request, res: Response): Promise<any> => {
//     const { id } = req.params
//     const { status } = req.body
//     try {
//         const receptionist = await Receptionist.findById(id)
//         if (!receptionist) {
//             return res.status(404).json({ success: false, message: "Receptionist not found", })
//         }
//         receptionist.status = status
//         const updatedReceptionist = await receptionist.save()
//         res.status(200).json({ success: true, message: "Status updated successfully", data: updatedReceptionist, })
//     } catch (error) {
//         res.status(500).json({
//             success: false, message: "Server error",
//             error: error instanceof Error ? error.message : "Unknown error"
//         })
//     }
// }
// )
// export const getReceptionistsByClinic = expressAsyncHandler(async (req: Request, res: Response): Promise<any> => {
//     const { clinic } = req.params
//     const redisKey = getReceptionistsByClinic:${clinic}
//     try {
//         const cachedData = await redisClient.get(redisKey)
//         if (cachedData) {
//             return res.status(200).json({
//                 success: true,
//                 message: "Receptionists fetched successfully from cache",
//                 data: JSON.parse(cachedData)
//             });
//         }
//         const receptionists = await Receptionist.find({ clinic }).populate("user doctor")
//         await redisClient.set(redisKey, JSON.stringify(receptionists), "EX", 3600)
//         res.status(200).json({
//             success: true,
//             message: "Receptionists retrieved successfully from database",
//             data: receptionists,
//         })
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: "Server error",
//             error: error instanceof Error ? error.message : "Unknown error",
//         })
//     }
// })
// export const updateReceptionist = expressAsyncHandler(async (req: Request, res: Response): Promise<any> => {
//     const { id } = req.params
//     console.log(id)

//     const { user, ...receptionistUpdates } = req.body
//     const receptionistValidationRules = {
//         user: { required: true },
//         firstName: { required: true, min: 2, max: 50 },
//         lastName: { required: true, min: 2, max: 50 },
//         email: { required: true, email: true },
//         phone: { required: true, pattern: /^[0-9]{10}$/ },
//         status: { required: true, enum: ["active", "inactive"] },
//         working_hours: [
//             {
//                 day: { required: true },
//                 from: { required: true },
//                 to: { required: true },
//             },
//         ],
//     };

//     const { isError, error } = customValidator(req.body, receptionistValidationRules);
//     if (isError) {
//         return res.status(400).json({
//             success: false,
//             message: "Validation failed",
//             errors: error,
//         });
//     }
//     const processedBody = {
//         ...receptionistUpdates,
//         status: req.body.status || "active",
//         working_hours: req.body.working_hours || [],
//     };

//     const session: ClientSession = await mongoose.startSession()
//     session.startTransaction()
//     try {
//         const updatedReceptionist = await Receptionist.findByIdAndUpdate(
//             id,
//             { ...processedBody },
//             { new: true, session }
//         );

//         if (!updatedReceptionist) {
//             await session.abortTransaction()
//             return res.status(400).json({ success: false, message: "Receptionist Not Found Receptionist Cannot Be Updated." })
//         }
//         const userUpdates = {
//             firstName: req.body.firstName,
//             lastName: req.body.lastName,
//             email: req.body.email,
//             phone: req.body.phone,
//         }
//         console.log(userUpdates, user)
//         const updatedUser = await User.findByIdAndUpdate(user, { ...userUpdates })
//         if (!updatedUser) {
//             await session.abortTransaction()
//             return res.status(400).json({ success: false, message: "User Not Found User Cannot Be Updated." });
//         }
//         await session.commitTransaction()
//         res.status(200).json({
//             success: true,
//             message: "Receptionist and user updated successfully",
//             updatedReceptionist,
//             updatedUser,
//         })
//     } catch (error) {
//         await session.abortTransaction()
//         res.status(500).json({
//             success: false,
//             message: "Server error",
//             error: error instanceof Error ? error.message : "Unknown error",
//         })
//     } finally {
//         session.endSession()
//     }
// })
// export const deleteReceptionist = expressAsyncHandler(async (req: Request, res: Response): Promise<any> => {
//     const { id } = req.params
//     const session: ClientSession = await mongoose.startSession()
//     session.startTransaction()
//     try {
//         const deletedReceptionist = await Receptionist.findByIdAndUpdate(id, { isDelete: true }, { session })
//         if (!deletedReceptionist) {
//             await session.abortTransaction()
//             return res.status(404).json({ success: false, message: "Receptionist not found" })
//         }
//         await session.commitTransaction()
//         redisClient.flushdb((err, success) => {
//             if (err) {
//                 console.log(err)
//             } else {
//                 console.log("Redis DB Cleared")
//             }
//         })
//         res.status(200).json({ success: true, message: "Receptionist deleted successfully" })
//     } catch (error) {
//         await session.abortTransaction()
//         res.status(500).json({
//             success: false,
//             message: "Server error",
//             error: error instanceof Error ? error.message : "Unknown error",
//         });
//     } finally {
//         session.endSession()
//     }
// })
// export const getReceptionistByUser = expressAsyncHandler(async (req: Request, res: Response): Promise<any> => {
//     // const { clinicId }: any = req.user   // use This After Connect Auth
//     const clinicId = '679106751ce2a295c7e63954'
//     const result = await User.find({ role: "Receptionist", clinicId })
//     res.json({ message: "User Find Success", data: result })
// })