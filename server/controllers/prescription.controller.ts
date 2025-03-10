import asyncHandler from 'express-async-handler';
import mongoose, { Request, Response } from 'express';
import { customValidator, validationRulesSchema } from "../utils/validator";
import { Prescription } from '../models/Prescription';
import { array, object } from 'zod';
import { IUserProtected } from '../utils/protected';



export const createPrescription = asyncHandler(async (req: Request, res: Response): Promise<any> => {

    const rules: validationRulesSchema = {
        patient: { required: true },
        doctor: { required: true },
        medical: [

            {
                medicine: { required: true },
                dosage: { required: true },
                // duration: { required: true, checkbox: true },
                duration: { required: true, },

                // frequency: { required: true },
                frequency: { required: true, checkbox: true },
                quantity: { required: true },
                tests: { required: false },
                instructions: { required: true, select: true, },

            }
        ],

        pulse: { required: false },
        note: { required: false },
        isDeleted: { required: false },
        cvs: { required: false },
        bp: { required: false },
        rs: { required: false },
        pa: { required: false },
        temp: { required: false },
        complete: { required: false },
        diagnost: { required: false },
    };

    const { userId } = req.user as IUserProtected
    const data = { ...req.body, doctor: userId }

    const { isError, error } = customValidator(data, rules);
    if (isError) {
        return res.status(513).json({ message: "Validation error", error });
    }

    try {
        const lastPrescription = await Prescription.findOne({}, { prescriptionNumber: 1 })
            .sort({ createdAt: -1 })
            .lean();

        let newNumber = 1001;

        if (lastPrescription?.prescriptionNumber) {
            const lastNumber = parseInt(lastPrescription.prescriptionNumber.split("-")[1], 10);
            newNumber = lastNumber + 1;
        }

        const prescriptionNumber = `PRES-${newNumber}`;
        const newPrescription = new Prescription({
            ...data,
            prescriptionNumber,
        });

        await newPrescription.save();

        const prescriptionResponse = await Prescription.findById(newPrescription._id)
            .select('-medical._id -tests._id');

        return res.status(201).json({
            message: "Prescription created successfully",
            prescription: prescriptionResponse,
        });
    } catch (error: any) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "prescription number already exists", error });
        }
        console.error("error creating prescription:", error);
        return res.status(500).json({ message: "failed to create prescription", error });
    }
});

export const getAllPrescriptions = asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const result = await Prescription.find().populate("patient")
    return res.status(200).json({ message: 'prescription all get successfully', result });
});

export const getPrescriptionsByPatient = asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const { patientId } = req.params;

    const rules: validationRulesSchema = {
        patient: { required: true, },
    };
    const { isError, error } = customValidator({ patient: patientId }, rules);

    if (isError) {
        return res.status(400).json({ message: "validation error", error });
    }
    const result = await Prescription.find({ patient: patientId })
        .populate('doctor')
        .populate('medical.medicine');

    if (!result || result.length === 0) {
        return res.status(400).json({ message: 'no prescriptions found for this patient' });
    }

    return res.status(200).json({ message: "all prescriptions fetched successfully", result });
});

export const getPrescriptionsByDoctor = asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const { doctorId } = req.params;
    const rules: validationRulesSchema = {
        doctor: { required: true }
    };
    const { isError, error } = customValidator({ doctor: doctorId }, rules);

    if (isError) {
        return res.status(532).json({ message: "validation error", error, });
    }

    const result = await Prescription.find({ doctor: doctorId })
        .populate("patient")
        .populate("medical.medicine");

    if (!result || result.length === 0) {
        return res.status(400).json({ message: 'no prescriptions found for this doctor' });
    }

    return res.status(200).json({ message: 'successfully fetched prescriptions for the patient', result });
});

export const getPrescriptionById = asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const { prescriptionId } = req.params;
    const rules: validationRulesSchema = {
        prescriptionId: { required: true }
    };
    const { isError, error } = customValidator({ prescriptionId }, rules);

    if (isError) {
        return res.status(532).json({ message: "validation Error", error, })
    }

    const result = await Prescription.findById(prescriptionId)
        .populate("patient")
        .populate("doctor");

    if (!result) {
        return res.status(400).json({ message: "prescription not found", });
    }

    return res.status(200).json({ message: "successfully fetched prescription", result, });
}
);

export const updatePrescription = asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const { prescriptionId } = req.params;
    if (!prescriptionId) {
        return res.status(400).json({ message: "invalid prescription id" });
    }
    const result = await Prescription.findByIdAndUpdate(prescriptionId, req.body, { new: true, runValidators: true })
    return res.status(200).json({ message: 'prescription updated successfully', result });
});


export const deletePrescription = asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const { deleteprescriptionId } = req.params;

    if (!deleteprescriptionId) {
        return res.status(400).json({ message: "prescription id deletet is required" });
    }
    const result = await Prescription.findByIdAndUpdate(deleteprescriptionId, { isDeleted: true }, { new: true });
    if (!result) {
        return res.status(400).json({ message: "prescription delete  not found" });
    }

    return res.status(200).json({ message: "prescription marked as deleted successfully", result });
});

export const getPrescriptionsByClinic = asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const { clinicId } = req.params;
    const rules: validationRulesSchema = {
        clinicId: { required: true },
    };
    const { isError, error } = customValidator({ clinicId }, rules);

    if (isError) {
        return res.status(532).json({ message: "validation error", error });
    }
    const result = await Prescription.find({ clinic: clinicId })
        .populate('patient')
        .populate('doctor');

    if (!result || result.length === 0) {
        return res.status(400).json({ message: "no prescriptions found for this clinic" });
    }

    return res.status(200).json({ message: "prescriptions BY successfully Clinic", result });
});










