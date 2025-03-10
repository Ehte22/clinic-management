import mongoose, { Model, Schema } from "mongoose";

export interface IClinic {
    name: string;
    city: string;
    state: string;
    street: string;
    country: string;
    contactInfo: number;
    alternateContactInfo?: number;
    email: string;
    plan?: string
    startDate: Date;
    endDate: Date;
    amount: Number;
    registerByAdmin: boolean;
    freeSubEndDate?: Date;
    logo?: string;
    status?: string;
    deletedAt?: Date | null
}

const clinicSchema = new Schema<IClinic>({
    name: { type: String, required: true, trim: true },
    contactInfo: { type: Number, required: true, trim: true },
    startDate: { type: Date, required: true, trim: true },
    endDate: { type: Date, required: true, trim: true },
    amount: { type: Number, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    street: { type: String, required: true, trim: true },
    registerByAdmin: { type: Boolean, default: false },
    alternateContactInfo: { type: Number, trim: true },
    email: { type: String, trim: true },
    logo: { type: String, trim: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    deletedAt: { type: Date, default: null }
}, { timestamps: true });

export const Clinic: Model<IClinic> = mongoose.model<IClinic>("Clinic", clinicSchema);
