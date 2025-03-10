

import mongoose, { Schema, Document, Model } from 'mongoose';

interface IMedicalStock extends Document {
    clinic: mongoose.Schema.Types.ObjectId;
    medicineName: string;
    expiryDate: Date;
    price: number;
    category?: string;
    label?: string;
    // quantity: number;
    mg: number;
    stock: number;
    medicineType: string;
    isDeleted: boolean
    supplier: mongoose.Schema.Types.ObjectId;
    patient: mongoose.Schema.Types.ObjectId;
    // medicalStoreId: mongoose.Schema.Types.ObjectId;
    // manufacturer: string;
    // lastPurchasedDate: Date;
    // lastSoldDate: Date;

}

const medicineSchema: Schema<IMedicalStock> = new mongoose.Schema<IMedicalStock>({
    clinic: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },

    medicineName: { type: String, required: true },
    expiryDate: { type: Date, required: true },
    stock: { type: Number, required: true },
    label: { type: String, required: true },
    category: { type: String, required: true },
    mg: { type: Number, required: true },
    price: { type: Number, required: true },
    // quantity: { type: Number, required: true },
    medicineType: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
    // batchNumber: { type: String, required: true },
    // discount: { type: Number, default: 0 },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", required: true },
    // purchasedPrice: { type: Number, required: true },
    // lastPurchasedDate: { type: Date },


})
const Medicine: Model<IMedicalStock> = mongoose.model<IMedicalStock>('MedicalStock', medicineSchema);

export default Medicine;


