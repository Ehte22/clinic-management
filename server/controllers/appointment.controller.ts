import { Request, Response } from "express";
import mongoose from "mongoose";
import asyncHandler from "express-async-handler";
import { Appointment } from "../models/Appointment";
import { customValidator, ValidationRules, validationRulesSchema } from "../utils/validator";
import redisClient from "../services/redisClient";
import { invalidateCache } from "../utils/redisMiddleware";
import { Clinic } from "../models/Clinic";
import { Doctor } from "../models/Doctor";
import { Patient } from "../models/Patient";
import { User } from "../models/User";
import { IUserProtected } from "../utils/protected";

export const createAppointment = asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const { patient, doctor, date, timeSlot, reason, payment, notes, label } = req.body;

    const rules: validationRulesSchema = {
        patient: { required: true },
        doctor: { required: true },
        reason: { required: false },
        date: { required: true },
        status: { required: false },
        notes: { required: false },
        label: { required: false },
        timeSlot: {
            object: true,
            from: { required: true },
            to: { required: true }
        }
        ,
        payment: {
            object: true,
            patientType: { required: false },
            amount: { required: false },
            method: { required: false },
            status: { required: false }
        }
    };

    const { isError, error } = customValidator(req.body, rules);

    if (isError) {
        return res.status(400).json({ message: "Validation errors", error });
    }
    const result = await Appointment.create({
        patient,
        doctor,
        clinic: (req.user as any)?.clinicId,
        date,
        label,
        timeSlot,
        reason,
        payment,
        notes,
    });

    invalidateCache("appointments:*")

    res.status(201).json({ mesage: "Appointments Create Success", result });
});

export const getAppointments = asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const { clinicId, role } = req.user as IUserProtected

    const sortedQuery = JSON.stringify(Object.fromEntries(Object.entries(req.query).sort()))
    const cacheKey = `appointments:${clinicId || "all"}:${sortedQuery}`
    const cachedData = await redisClient.get(cacheKey)

    if (cachedData) {
        return res.status(200).json(JSON.parse(cachedData))
    }

    let result: any = []
    if (role === "Super Admin") {
        result = await Appointment.find({ isDeleted: false })
            .populate("patient")
            .populate("doctor")
            .populate("clinic");
    } else {
        result = await Appointment.find({ clinic: new mongoose.Types.ObjectId(clinicId), isDeleted: false })
            .populate("patient")
            .populate("doctor")
            .populate("clinic");
    }

    redisClient.setex(cacheKey, 3600, JSON.stringify({ message: "Fetch All Appointments Success ", result }))

    res.status(200).json({ message: "Fetch All Appointments Success ", result });
});

export const getAppointmentById = asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params;

    const cacheKey = `appointment:${id}`
    const cachedData = await redisClient.get(cacheKey)

    if (cachedData) {
        return res.status(200).json(JSON.parse(cachedData))
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid appointment ID." });
    }

    const result = await Appointment.findById(id).populate("patient")
        .populate({
            path: 'doctor',
            populate: { path: 'doctor' },
        })
        .populate("clinic");

    if (!result) {
        return res.status(404).json({ message: "Appointment not found." });
    }
    redisClient.setex(cacheKey, 3600, JSON.stringify({ message: "Appointment Fetch byId Success ", result }))

    res.status(200).json({ message: "Appointment Fetch byId Success ", result });
});

export const updateAppointment = asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params;
    const { patient, doctor, clinic, date, timeSlot, reason, payment, notes, label } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid appointment ID." });
    }
    const rules: validationRulesSchema = {
        doctor: { required: true },
        reason: { required: false },
        label: { required: false },
        date: { required: false },
        status: { required: false },
        notes: { required: false },
        timeSlot: {
            object: true,
            from: { required: false },
            to: { required: false }
        },
        payment: {
            object: true,
            patientType: { required: false },
            amount: { required: false, },
            method: { required: false },
            status: { required: false }
        }
    }
    const { isError, error } = customValidator(req.body, rules);

    if (isError) {
        return res.status(400).json({ message: "Validation errors", error });
    }

    const result = await Appointment.findByIdAndUpdate(id, {
        patient,
        doctor,
        clinic: (req.user as any)?.clinicId,
        date,
        timeSlot,
        reason,
        label,
        payment,
        notes,
    }, {
        new: true,
        runValidators: true,
    });

    if (!result) {
        return res.status(404).json({ message: "Appointment not found." });
    }

    invalidateCache(`appointment:${id}`)
    invalidateCache("appointments:*")

    res.status(200).json({ message: "Appointment Update Success", result });
});

export const deleteAppointment = asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid appointment ID." });
    }

    const result = await Appointment.findByIdAndUpdate(id, { isDeleted: true });

    if (!result) {
        return res.status(404).json({ message: "Appointment not found." });
    }

    invalidateCache(`appointment:${id}`)
    invalidateCache("appointments:*")
    res.status(200).json({ message: "Appointment deleted successfully." });
});

export const restoreAppointment = asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid appointment ID." });
    }

    const result = await Appointment.findByIdAndUpdate(id, { isDeleted: false });

    if (!result) {
        return res.status(404).json({ message: "Appointment not found." });
    }


    invalidateCache(`appointment:${id}`)
    invalidateCache("appointments:*")
    res.status(200).json({ message: "Appointment Restore successfully." });
});

export const changeAppointmentStatus = asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params;
    const { status } = req.body;

    const rules: validationRulesSchema = {
        status: { required: true },

    }
    const { isError, error } = customValidator(req.body, rules);

    if (isError) {
        return res.status(400).json({ message: "Validation errors", error });
    }
    const result = await Appointment.findByIdAndUpdate(id, { status }, { new: true });

    if (!result) {
        res.status(404).json({ message: "Appointment not found" });
        return;
    }

    invalidateCache(`appointment:${id}`)
    invalidateCache("appointments:*")

    res.status(200).json({ messsage: "appointment status change Success", result });
});

export const getAppointmentsByPatient = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { patient } = req.params;
    const result = await Appointment.find({ patient })
        .populate("doctor", "name specialization")
    res.status(200).json({ message: "Appointments fetch By Patient success", result });
});

export const getAppointmentsByDoctor = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { doctor } = req.params;
    const result = await Appointment.find({ doctor })
    res.status(200).json({ message: "Fetch Appointments by Doctor success", result });
});

export const getAppointmentsByClinic = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { clinic } = req.params;
    const result = await Appointment.find({ clinic })
        .populate("doctor", "name specialization");
    res.status(200).json({ message: "Fetch Appointments By Clinic", result });
});

export const filterAppointmentsByDate = asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const { startDate, endDate } = req.body;
    const rules: validationRulesSchema = {
        startDate: { required: true },
        endDate: { required: true },
    }
    const { isError, error } = customValidator(req.body, rules);

    if (isError) {
        return res.status(400).json({ message: "Validation errors", error });
    }

    const result = await Appointment.find({
        date: { $gte: new Date(startDate), $lte: new Date(endDate) },
    }).populate("doctor", "name specialization")
        .populate("clinic", "name location");

    invalidateCache("appointments:*")
    res.status(200).json({ message: "Appointments Fetch by Dates success", result });
});

export const markPaymentAsPaid = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const result = await Appointment.findByIdAndUpdate(
        id,
        { "payment.status": "paid" },
        { new: true }
    );

    if (!result) {
        res.status(404).json({ message: "Appointment not found" });
        return;
    }

    await invalidateCache("/api/v1/appointment/list")

    invalidateCache(`appointment:${id}`)
    invalidateCache("appointments:*")

    res.status(200).json({ message: "Mark Payment Paid Success", result });
});

export const updateTimeSlot = asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const { appointmentId } = req.params;
    const { from, to } = req.body.timeSlot;

    const rules: validationRulesSchema = {
        timeSlot: {
            object: true,
            from: { required: true },
            to: { required: true }
        }

    }
    const { isError, error } = customValidator(req.body, rules);

    if (isError) {
        return res.status(400).json({ message: "Validation errors", error });
    }
    if (!from || !to) {
        return res.status(400).json({ message: "Both 'from' and 'to' times must be provided." });
    }
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
        return res.status(404).json({ message: "Appointment not found." });
    }

    if (appointment.status === 'canceled' || appointment.status === 'completed') {
        return res.status(400).json({ message: "Cannot update timeSlot for appointments with 'canceled' or 'completed' status." });
    }
    appointment.timeSlot = { from, to };

    const result = await appointment.save();
    invalidateCache("appointments:*")

    res.status(200).json({ message: "Update TimeSlot Success", result });
});

export const getPastAppointments = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await Appointment.find({
        date: { $lt: new Date() },
    });
    // redisClient.setex(req.originalUrl, 3600, JSON.stringify(result))
    res.status(200).json({ message: "Fetch Past Appointments Success", result });
});

export const cancelAppointment = asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid appointment ID." });
    }
    const result = await Appointment.findByIdAndUpdate(id, { status: "canceled" }, { new: true });

    if (!result) {
        return res.status(404).json({ message: "Appointment not found." });
    }

    invalidateCache(`appointment:${id}`)
    invalidateCache("appointments:*")

    res.status(200).json({ message: "Appointment canceled successfully.", result });
});

export const getAppointmentStats = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const totalAppointments = await Appointment.countDocuments();
    const completedAppointments = await Appointment.countDocuments({ status: "completed" });
    const canceledAppointments = await Appointment.countDocuments({ status: "canceled" });


    res.status(200).json({
        totalAppointments,
        completedAppointments,
        canceledAppointments,
    });
});

export const checkAppointmentAvailability = asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const { doctor, date, timeSlot } = req.body;

    const rules: validationRulesSchema = {
        doctor: { required: true },
        date: { required: true },
        timeSlot: {
            object: true,
            from: { required: true },
            to: { required: true }
        },

    }
    const { isError, error } = customValidator(req.body, rules);

    if (isError) {
        return res.status(400).json({ message: "Validation errors", error });
    }
    const isAvailable = await Appointment.findOne({
        doctor,
        date,
        "timeSlot.from": { $lte: timeSlot.from },
        "timeSlot.to": { $gte: timeSlot.to },
    });

    // redisClient.setex(req.originalUrl, 3600, JSON.stringify(!isAvailable))
    res.status(200).json({ isAvailable: !isAvailable });
});

export const rescheduleAppointment = asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params;
    const { date, timeSlot } = req.body;

    const rules: validationRulesSchema = {
        date: { required: true },
        timeSlot: {
            object: true,
            from: { required: true },
            to: { required: true }
        },
    }
    const { isError, error } = customValidator(req.body, rules);

    if (isError) {
        return res.status(400).json({ message: "Validation errors", error });
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid appointment ID." });
    }

    const appointment = await Appointment.findById(id);

    if (!appointment) {
        return res.status(404).json({ message: "Appointment not found." });
    }

    if (appointment.status === 'canceled' || appointment.status === 'completed') {
        return res.status(400).json({ message: "Cannot reschedule a canceled or completed appointment." });
    }

    appointment.date = date || appointment.date;
    appointment.timeSlot = timeSlot || appointment.timeSlot;

    const result = await appointment.save();

    invalidateCache(`appointment:${id}`)
    invalidateCache("appointments:*")

    res.status(200).json({ message: "Appointment rescheduled successfully.", result });
});

export const searchAppointments = asyncHandler(async (req: Request, res: Response): Promise<any> => {
    try {
        const { query, page, limit }: any = req.query;

        const { clinicId, role } = req.user as IUserProtected

        const sortedQuery = JSON.stringify(Object.fromEntries(Object.entries(req.query).sort()))
        const cacheKey = `appointments:${clinicId || "all"}:${sortedQuery}`
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


        const patientData: any = await Patient.find({
            $or: [
                { "name": { $regex: query, $options: "i" } },
                { "email": { $regex: query, $options: "i" } },
                { "contactInfo": { $regex: query, $options: "i" } }
            ]
        });

        const doctorData: any = await Doctor.find({
            $or: [
                { "name": { $regex: query, $options: "i" } },
                { "specialization": { $regex: query, $options: "i" } },
                { "email": { $regex: query, $options: "i" } },
                { "emergency_contact": { $regex: query, $options: "i" } }
            ]
        }).populate("doctor");

        const clinicData: any = await Clinic.find({
            $or: [
                { "name": { $regex: query, $options: "i" } },
                { "address.city": { $regex: query, $options: "i" } },
                { "email": { $regex: query, $options: "i" } }
            ]
        });

        const patientIds = patientData.map((patient: any) => patient._id);
        const doctorIds = doctorData.map((doctor: any) => doctor._id);
        const clinicIds = clinicData.map((clinic: any) => clinic._id);
        const userIds = searchedData.map((user: any) => user._id);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const searchQuery: any = {
            isDeleted: false,
            ...(query && {
                $or: [
                    { "reason": { $regex: query, $options: "i" } },
                    { "status": { $regex: query, $options: "i" } },
                    { "payment.method": { $regex: query, $options: "i" } },
                    { "payment.status": { $regex: query, $options: "i" } },
                    { "notes": { $regex: query, $options: "i" } },
                    { "label": { $regex: query, $options: "i" } },
                    { "patient": { $in: patientIds } },
                    { "doctor": { $in: doctorIds } },
                    { "clinic": { $in: clinicIds } },
                    { "doctor.doctor": { $in: userIds } },
                ]
            }),
            date: {
                $gte: today, $lt: tomorrow
            }
        }

        if (role !== "Super Admin") {
            searchQuery.clinic = clinicId;
        } else {
            if (req.query.selectedClinicId) {
                searchQuery.clinic = req.query.selectedClinicId;
            }
        }

        const totalAppointment = await Appointment.countDocuments(searchQuery)

        const result = await Appointment.find(searchQuery)
            .populate("patient")
            .populate("clinic")
            .populate({
                path: 'doctor',
                populate: { path: 'doctor' },
            })
            .skip(skip)
            .limit(limit)




        redisClient.setex(cacheKey, 3600, JSON.stringify({
            message: "Fetch Appointments success", result, pagination: {
                totalPages: Math.ceil(totalAppointment / currentLimit)
            }
        }));


        res.status(200).json({
            message: "Fetch Appointments",
            result,
            pagination: {
                totalPages: Math.ceil(totalAppointment / currentLimit)
            },

        });
    } catch (error) {
        console.error("Error fetching appointments:", error);
        res.status(500).json({ message: "Internal Server Error", error });
    }
});
