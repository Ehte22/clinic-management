import mongoose, { Model, Schema } from "mongoose";

export interface IInvoice {
    invoiceNumber: string;
    appointmentId: mongoose.Schema.Types.ObjectId
    patientId: mongoose.Schema.Types.ObjectId;
    doctorId: mongoose.Schema.Types.ObjectId;
    clinic: mongoose.Schema.Types.ObjectId;
    issueDate: Date;
    dueDate?: Date;
    label: string;
    items: {
        description: string;
        quantity: number;
        unitPrice: number;
        total: number;
    }[];
    subtotal: number;
    tax?: number;
    discount?: number;
    totalAmount: number;
    paymentStatus: 'paid' | 'unpaid' | 'pending';
    paymentMethod?: 'cash' | 'card' | 'online';
    notes?: string;
    isDelete: boolean;
}

const invoiceSchema = new Schema<IInvoice>(
    {

        invoiceNumber: { type: String, required: true, unique: true },
        label: { type: String, },
        appointmentId: { type: mongoose.Types.ObjectId, ref: 'Appointment', required: true },
        clinic: { type: mongoose.Types.ObjectId, ref: "Clinic", required: true },
        issueDate: { type: Date, default: Date.now, required: true },
        dueDate: { type: Date },
        items: [
            {
                description: { type: String, required: true },
                quantity: { type: Number, required: true },
                unitPrice: { type: Number, required: true },
                total: { type: Number, required: true },
            },
        ],
        tax: { type: Number, default: 0 },
        discount: { type: Number, default: 0 },
        totalAmount: { type: Number, required: true },
        paymentStatus: { type: String, enum: ['paid', 'unpaid', 'pending'], default: 'pending' },
        paymentMethod: { type: String, enum: ['cash', 'card', 'online'] },
        notes: { type: String },
        isDelete: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export const Invoice: Model<IInvoice> = mongoose.model<IInvoice>("Invoice", invoiceSchema);
