import mongoose, { Model, Schema } from "mongoose";

export interface IPatient {
    name: string;
    dateOfBirth: Date;
    gender: 'male' | 'female' | 'other';
    contactInfo: string;
    email?: string;
    isDeleted?: Boolean,
    age?: number,
    weight?: number,
    address: {
        city: string;
        state: string;
        country: string;
        street: string;
        zipCode: string;
    };
    clinic: mongoose.Schema.Types.ObjectId;

    emergencyContact: {
        name: string;
        relationship: string;
        contactNumber: string;
    };
    visitDate: Date;
    status: 'active' | 'inactive';
}

const patientSchema = new Schema<IPatient>(
    {
        clinic: { type: mongoose.Types.ObjectId, ref: 'Clinic', required: true },
        name: { type: String, required: true },
        dateOfBirth: { type: Date, required: true },
        gender: { type: String, enum: ['male', 'female', 'other'], required: true },
        contactInfo: { type: String, required: true, },
        email: { type: String },
        age: { type: Number, required: true },
        weight: { type: Number, required: true },
        address: {
            city: { type: String, required: true },
            state: { type: String },
            country: { type: String },
            street: { type: String },
            zipCode: { type: String },
        },
        emergencyContact: {
            name: { type: String },
            relationship: { type: String },
            contactNumber: { type: String, required: true, },
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

export const Patient: Model<IPatient> = mongoose.model<IPatient>("Patient", patientSchema);


