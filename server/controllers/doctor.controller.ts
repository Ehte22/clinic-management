import mongoose from "mongoose";
import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { Doctor } from "../models/Doctor";
import { customValidator, validationRulesSchema } from "../utils/validator";
import redisClient from "../services/redisClient";
import { invalidateCache } from "../utils/redisMiddleware";
import { User } from "../models/User";
import { Clinic } from "../models/Clinic";
import { IUserProtected } from "../utils/protected";


export const createDoctor = asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const {
        doctor,
        clinic,
        specialization,
        schedule,
        label,
        qualifications,
        experience_years,
        bio,
        emergency_contact,
    } = req.body;

    const rules: validationRulesSchema = {
        doctor: { required: true },
        clinic: { required: true },
        specialization: { required: false },
        label: { required: false },
        bio: { required: false, },
        emergency_contact: { required: false, },
    };

    const { isError, error } = customValidator(req.body, rules);

    if (isError) {
        return res.status(400).json({ message: "Validation errors", error });
    }

    const result = await Doctor.create({
        doctor,
        clinic,
        label,
        specialization,
        schedule,
        qualifications,
        experience_years,
        bio,
        emergency_contact,
    });
    invalidateCache("doctors:*")
    invalidateCache("users:*")

    res.status(201).json(result);
});

export const getDoctors = asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const result = await User.find({ role: "Doctor" })
    redisClient.setex(req.originalUrl, 3600, JSON.stringify({ message: "Doctor Fetch success", result }))
    res.status(200).json({ message: "Doctor Fetch success", result });
});
export const getClinicDoctors = asyncHandler(async (req: Request, res: Response): Promise<any> => {
    // const { clinicId: clinic }: any = req.user    // Use This For Dynamic Id's
    const result = await Doctor.find()
        .populate("clinic")
        .populate("doctor")

    redisClient.setex(req.originalUrl, 3600, JSON.stringify({ message: "Clinic Doctor Fetch success", result }))
    res.status(200).json({ message: "Doctor Fetch success", result });
});
export const getDoctorById = asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params;

    const cacheKey = `doctor:${id}`
    const cachedData = await redisClient.get(cacheKey)

    if (cachedData) {
        return res.status(200).json(JSON.parse(cachedData))
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid doctor ID." });
    }

    const result = await Doctor.findById(id)
        .populate("clinic")
        .populate("doctor");

    if (!result) {
        return res.status(404).json({ message: "Doctor not found." });
    }

    await redisClient.setex(cacheKey, 3600, JSON.stringify({ messsage: "Get Doctors by Id", result }))

    res.status(200).json({ messsage: "Get Doctors by Id", result });
});


export const updateDoctor = asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params;
    const {
        firstName,
        lastName,
        email,
        phone,
        specialization,
        schedule,
        qualifications,
        experience_years,
        bio,
        emergency_contact,
        label
    } = req.body;

    const rules: validationRulesSchema = {
        firstName: { required: false },
        lastName: { required: false },
        phone: { required: false },
        email: { required: false },
        specialization: { required: false },
        status: { required: false },
        label: { required: false },
        profile: { required: false },
        qualifications: { required: false },
        experience_years: { required: false, },
        bio: { required: false },
        emergency_contact: { required: false },
    };

    const { isError, error } = customValidator(req.body, rules);

    if (isError) {
        return res.status(400).json({ message: "Validation errors", error });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid doctor ID." });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const result = await Doctor.findById(id).populate("doctor").session(session);

        if (!result) {
            await session.abortTransaction();
            return res.status(404).json({ message: "Doctor not found." });
        }

        const updateUser = await User.findByIdAndUpdate(result?.doctor._id, { firstName, lastName, email, phone }, { new: true, session });
        if (!updateUser) {
            await session.abortTransaction();
            return res.status(404).json({ message: "User not found." });
        }

        const updatedDoctor = await Doctor.findByIdAndUpdate(result, {
            specialization,
            schedule,
            qualifications,
            experience_years,
            bio,
            emergency_contact,
            label
        }, { new: true, session });

        if (!updatedDoctor) {
            await session.abortTransaction();
            return res.status(404).json({ message: "Doctor not found." });
        }

        await session.commitTransaction();

        invalidateCache("doctors:*")
        invalidateCache(`doctor:${id}`)
        invalidateCache("users:*")
        res.status(200).json(updatedDoctor);

    } catch (error) {
        await session.abortTransaction();
        console.error(error);
        res.status(500).json({ message: "An error occurred while updating the doctor." });
    } finally {
        session.endSession();
    }
});

export const deleteDoctor = asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid doctor ID." });
    }

    const deletedDoctor = await Doctor.findByIdAndUpdate(id, { isDeleted: true });

    if (!deletedDoctor) {
        return res.status(404).json({ message: "Doctor not found." });
    }
    invalidateCache("doctors:*")
    invalidateCache(`doctor:${id}`)
    invalidateCache("users:*")
    res.status(200).json({ message: "Doctor deleted successfully." });
});

export const restoreDoctor = asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid appointment ID." });
    }

    const deletedAppointment = await Doctor.findByIdAndUpdate(id, { isDeleted: false });

    if (!deletedAppointment) {
        return res.status(404).json({ message: "Appointment not found." });
    }
    invalidateCache("doctors:*")
    invalidateCache(`doctor:${id}`)
    invalidateCache("users:*")
    res.status(200).json({ message: "Appointment Restore successfully." });
});

export const getDoctorsByClinic = asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const { clinic } = req.params;

    if (!mongoose.Types.ObjectId.isValid(clinic)) {
        return res.status(400).json({ message: "Invalid clinic ID." });
    }

    const result = await Doctor.find({ clinic }).populate("clinic")
        .populate("doctor");

    redisClient.setex(req.originalUrl, 3600, JSON.stringify({ message: "get Doctors By Clinic ", result }))

    res.status(200).json({ message: "get Doctors By Clinic ", result });
});

export const searchDoctorsBySpecialization = asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const { specialization } = req.params;

    if (!specialization) {
        return res.status(400).json({ message: "Specialization is required." });
    }

    const result = await Doctor.find({ specialization: new RegExp(specialization as string, "i") }).populate("clinic")
        .populate("doctor");
    redisClient.setex(req.originalUrl, 3600, JSON.stringify({ message: "search Doctors By Specialization  Success", result }))
    res.status(200).json({ message: "search Doctors By Specialization  Success", result });
});

export const getActiveDoctors = asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const result = await Doctor.find({ status: "active" });
    redisClient.setex(req.originalUrl, 3600, JSON.stringify({ message: "active Doctors Featch success", result }))
    res.status(200).json({ message: "active Doctors Featch success", result });
});

export const getDoctorSchedule = asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid doctor ID." });
    }

    const result = await Doctor.findById(id, "schedule");

    if (!result) {
        return res.status(404).json({ message: "Doctor not found." });
    }
    redisClient.setex(req.originalUrl, 3600, JSON.stringify({ message: "get Doctor by Schedule ", result }))

    res.status(200).json({ message: "get Doctor by Schedule ", result });
});

export const updateDoctorStatus = asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid doctor ID." });
    }

    if (!["active", "inactive"].includes(status)) {
        return res.status(400).json({ message: "Invalid status value." });
    }

    const doctor = await Doctor.findByIdAndUpdate(id, { status }, { new: true });

    if (!doctor) {
        return res.status(404).json({ message: "Doctor not found." });
    }

    invalidateCache("doctors:*")
    invalidateCache(`doctor:${id}`)
    invalidateCache("users:*")

    res.status(200).json(doctor);
});

export const searchDoctors = asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const { query, page, limit, selectedClinicId }: any = req.query;
    const { clinicId, role } = req.user as IUserProtected

    const sortedQuery = JSON.stringify(Object.fromEntries(Object.entries(req.query).sort()))
    const cacheKey = `doctors:${clinicId || "all"}:${sortedQuery}`
    const cachedData = await redisClient.get(cacheKey)

    if (cachedData) {
        return res.status(200).json(JSON.parse(cachedData))
    }

    const currentPage = parseInt(page) || 1;
    const currentLimit = parseInt(limit) || 10;
    const skip = (currentPage - 1) * currentLimit;


    const searchedData: any = await User.find({
        $or: [
            { "firstName": { $regex: query, $options: "i" } },
            { "lastName": { $regex: query, $options: "i" } },
            { "email": { $regex: query, $options: "i" } },
            { "role": { $regex: query, $options: "i" } },
        ],
    });

    const clinicData: any = await Clinic.find({
        $or: [
            { "address.city": { $regex: query, $options: "i" } },
            { "name": { $regex: query, $options: "i" } },
            { "email": { $regex: query, $options: "i" } },
        ]
    });

    const userIds = searchedData.map((user: any) => user._id);
    const clinicIds = clinicData.map((clinic: any) => clinic._id);

    const searchQuery: any = {
        isDeleted: false,
        ...(query && {
            $or: [
                { "specialization": { $regex: query, $options: "i" } },
                { "emergency_contact": { $regex: query, $options: "i" } },
                ...(userIds.length ? [{ doctor: { $in: userIds } }] : []),
                ...(clinicIds.length ? [{ clinic: { $in: clinicIds } }] : []),
            ]
        })
    }

    if (role !== "Super Admin") {
        searchQuery.clinic = clinicId;
    } else {
        if (req.query.selectedClinicId) {
            searchQuery.clinic = req.query.selectedClinicId;
        }
    }


    const result = await Doctor.find(searchQuery).populate("doctor")
        .populate("clinic")
        .skip(skip)
        .limit(currentLimit)


    await redisClient.setex(cacheKey, 3600, JSON.stringify({
        message: "Fetch Doctors success", result, pagination: {
            totalPages: Math.ceil(result.length / currentLimit)
        }
    }));
    res.status(200).json({
        message: "Fetch Doctors success", result,
        pagination: {
            totalPages: Math.ceil(result.length / currentLimit)
        }
    });
})

