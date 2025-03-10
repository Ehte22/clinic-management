import { Request, Response } from "express";
import asyncHandler from "express-async-handler"
import { customValidator, validationRulesSchema } from "../utils/validator";
import { Patient } from "../models/Patient";
import { IUserProtected } from "../utils/protected";
import { io } from "../utils/socket";
import { invalidateCache } from "../utils/redisMiddleware";
import redisClient from "../services/redisClient";


export const createPatient = asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const {
        name,
        dateOfBirth,
        gender,
        contactInfo,
        email,
        address,
        // clinic,
        currentMedications,
        emergencyContact,
        weight,
        age

    } = req.body;
    const rules: validationRulesSchema = {
        name: { required: true },
        dateOfBirth: { required: true },
        gender: { required: true },
        contactInfo: { required: true },
        email: { required: false, email: true },
        age: { required: true },
        weight: { required: true },
        address: {
            object: true,
            city: { required: true },
            state: { required: false },
            country: { required: false },
            street: { required: false },
            zipCode: { required: false },
        },


        emergencyContact: {
            object: true,
            name: { required: true },
            relationship: { required: true },
            contactNumber: { required: true },
        },
    };

    const { isError, error } = customValidator(req.body, rules);

    const clinic = (req as any).user.clinicId
    if (isError) {
        return res.status(532).json({ message: "validation error", error });
    }

    const result = await Patient.create({
        name,
        dateOfBirth,
        gender,
        contactInfo,
        email,
        weight,
        age,
        address,
        clinic,
        currentMedications,
        emergencyContact,

    });

    io.emit("update-patients", result)

    invalidateCache("patients:*")
    return res.status(200).json({ message: "patient added successfully", result });
});

export const getAllAllPatient = asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const { search, page, limit, isFetchAll = false, selectedClinicId = "" }: any = req.query;

    const { clinicId, role } = req.user as IUserProtected

    const sortedQuery = JSON.stringify(Object.fromEntries(Object.entries(req.query).sort()))
    const cacheKey = `patients:${clinicId || "all"}:${sortedQuery}`
    const cachedData = await redisClient.get(cacheKey)

    if (cachedData) {
        return res.status(200).json(JSON.parse(cachedData))
    }

    const currentPage = parseInt(page) || 1
    const currentLimit = parseInt(limit) || 10
    const skip = (currentPage - 1) * currentLimit
    const currentsearch = search || ""


    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999))

    let query: any = {
        isDeleted: false,
        createdAt: { $gte: startOfDay, $lte: endOfDay },
        ...(currentsearch && {
            $or: [
                { name: { $regex: search, $options: 'i' } },
                { contactInfo: { $regex: search, $options: 'i' } },
            ], isDeleted: false
        })
    }

    if (role !== "Super Admin") {
        query.clinic = clinicId
    } else {
        if (selectedClinicId) {
            query.clinic = selectedClinicId
        }
    }

    const totalPatient = await Patient.countDocuments(query)
    let result

    if (isFetchAll) {
        if (role === "Super Admin") {
            result = await Patient.find().populate('clinic')
        } else {
            result = await Patient.find({ clinic: clinicId, createdAt: { $gte: startOfDay, $lte: endOfDay }, isDeleted: false }).populate('clinic')
        }
    } else {
        result = await Patient.find(query).populate('clinic').skip(skip).limit(currentLimit);
    }

    await redisClient.setex(
        cacheKey,
        3600,
        JSON.stringify({
            message: 'patient all get successfully', result,
            pagination: {
                total: result.length,
                page: Number(currentPage),
                limit: Number(currentLimit),
                totalPages: Math.ceil(totalPatient / currentLimit)
            }
        })
    )
    return res.status(200).json({
        message: 'patient all get successfully', result,
        pagination: {
            total: result.length,
            page: Number(currentPage),
            limit: Number(currentLimit),
            totalPages: Math.ceil(totalPatient / currentLimit)
        }
    });
});

export const getAllPatients = asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const { clinic } = req.params;

    const rules: validationRulesSchema = {
        clinicId: { required: true, },
    };

    const { isError, error } = customValidator({ clinic }, rules);

    if (isError) {
        return res.status(532).json({ message: "Validation Error", error });
    }

    const result = await Patient.find({ clinic }).populate('clinic');

    res.json({ message: "all patients fetch success", result });
});

export const getPatientById = asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const { patientbyid } = req.params;

    const cacheKey = `patient:${patientbyid}`
    const cachedData = await redisClient.get(cacheKey)

    if (cachedData) {
        return res.status(200).json(JSON.parse(cachedData))
    }

    const rules: validationRulesSchema = {
        patientbyid: { required: true, type: "string" },
    };

    const { isError, error } = customValidator({ patientbyid }, rules);

    if (isError) {
        return res.status(532).json({ message: "validation Error", error });
    }
    const result = await Patient.findById(patientbyid)
    if (!result) {
        return res.status(404).json({ message: "patient not found" });
    }

    await redisClient.setex(
        cacheKey,
        3600,
        JSON.stringify({ message: "get patient by id success", result })
    )
    // Success response
    res.status(200).json({ message: "get patient by id success", result });
});

export const updatePatient = asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const { updatepatient } = req.params

    if (!updatepatient) {
        return res.status(532).json({ message: "Delete id Patient Error" });
    }
    const result = await Patient.findByIdAndUpdate(updatepatient, req.body, { new: true });
    if (!result) {
        return res.status(400).json({ message: 'Patient not found' });
    }

    invalidateCache("patients:*")
    invalidateCache(`patient:${updatepatient}`)
    return res.status(200).json({ message: 'patient updated successfully', result });

});
export const deletePatient = asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params;

    const rules: validationRulesSchema = {
        id: { required: true, },
    };
    const { isError, error } = customValidator({ id }, rules);
    if (isError) {
        return res.status(532).json({ message: "Validation Error", error });
    }
    const result = await Patient.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    if (!result) {
        return res.status(400).json({ message: "Patient not found" });
    }

    invalidateCache("patients:*")
    invalidateCache(`patient:${id}`)
    return res.status(200).json({ message: "Patient marked as deleted successfully", result });
});

// export const searchPatientsByName = asyncHandler(async (req: Request, res: Response): Promise<any> => {
//     const { search } = req.query;

//     const rules: validationRulesSchema = {
//         search: { required: false, type: 'string', maxLength: 100 },
//     };

//     const { isError, error } = customValidator({ search }, rules);

//     if (isError) {
//         return res.status(400).json({ message: "validation error", error });
//     }

//     const query = search
//         ? {
//             $or: [
//                 { firstName: { $regex: search, $options: 'i' } },
//                 { lastName: { $regex: search, $options: 'i' } },
//                 { mobile: { $regex: search, $options: 'i' } },
//             ],
//         }
//         : {};

//     const result = await Patient.find(query).populate('clinic');



//     return res.status(200).json({ message: "patients fetched successfully", result });
// });

export const getPatientsForTable = asyncHandler(async (req: Request, res: Response): Promise<any> => {
    let page: number = Number(req.query.page) || 1;
    let limit: number = Number(req.query.limit) || 10;
    if (isNaN(page) || page < 1) {
        return res.status(400).json({ message: "'page' must be a positive number" });
    }
    if (isNaN(limit) || limit < 1) {
        return res.status(400).json({ message: "'limit' must be a positive number" });
    }
    const skip = (page - 1) * limit;
    const patients = await Patient.find()
        .populate('clinic')
        .skip(skip)
        .limit(limit);
    const total = await Patient.countDocuments();
    return res.status(200).json({
        patients,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    });
});






