

import mongoose, { Schema, Document, Model } from 'mongoose';

interface IMedicalStock extends Document {
    clinic: mongoose.Schema.Types.ObjectId;
    medicineName: string;
    expiryDate: Date;
    price: number;
    category?: string;
    label?: string;
    mg: number;
    stock: number;
    isActive?: boolean
    medicineType: string;
    deletedAt?: Date | null
    supplier: mongoose.Schema.Types.ObjectId;
    patient: mongoose.Schema.Types.ObjectId;

}

const medicineSchema: Schema<IMedicalStock> = new mongoose.Schema<IMedicalStock>({
    clinic: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", required: true },
    medicineName: { type: String, required: true },
    expiryDate: { type: Date, required: true },
    stock: { type: Number, required: true },
    label: { type: String, required: true },
    category: { type: String, required: true },
    mg: { type: Number, required: true },
    price: { type: Number, required: true },
    medicineType: { type: String, required: true },
    deletedAt: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
}, { timestamps: true })
const Medicine: Model<IMedicalStock> = mongoose.model<IMedicalStock>('MedicalStock', medicineSchema);

export default Medicine;


