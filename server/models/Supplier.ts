import mongoose, { Model, Schema } from "mongoose";

export interface ISupplier {
    clinic: mongoose.Schema.Types.ObjectId
    name: string;
    phone: number;
    email: string;
    address: {
        city: string;
        state: string;
        street: string;
        country: string;
    }
    deletedAt: Date | null
}

const supplierSchema = new Schema<ISupplier>({
    clinic: { type: mongoose.Schema.Types.ObjectId, required: true },
    name: { type: String, required: true, trim: true },
    phone: { type: Number, required: true, unique: true, trim: true },
    email: { type: String, trim: true },
    address: {
        city: { type: String, required: true, trim: true },
        state: { type: String, required: true, trim: true },
        country: { type: String, required: true, trim: true },
        street: { type: String, required: true, trim: true },
    },
    deletedAt: { type: Date, default: null }
}, { timestamps: true });

export const Supplier: Model<ISupplier> = mongoose.model<ISupplier>("Supplier", supplierSchema);
