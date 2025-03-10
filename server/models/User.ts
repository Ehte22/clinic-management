import mongoose, { Model, Schema } from "mongoose";

export interface IUser extends Document {
    clinicId?: mongoose.Schema.Types.ObjectId
    _id?: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: number
    confirmPassword?: string
    profile?: string
    role: 'Super Admin' | 'Clinic Admin' | 'Doctor' | 'Receptionist';
    status: 'active' | 'inactive';
    sessionToken: string | null
}

export interface IOTP extends Document {
    username: string
    otp: string
    expiry: Date
}

const userSchema = new Schema<IUser>({
    clinicId: { type: mongoose.Schema.Types.ObjectId, ref: "Clinic", required: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    phone: { type: Number, required: true, unique: true, trim: true },
    password: { type: String, required: true, trim: true },
    profile: { type: String, trim: true },
    role: {
        type: String,
        enum: ['Super Admin', 'Clinic Admin', 'Doctor', 'Receptionist'],
        default: "Receptionist",
        required: true
    },
    status: { type: String, default: "active", enum: ['active', 'inactive'] },
    sessionToken: { type: String, default: null },
}, { timestamps: true });

const OTPSchema = new Schema<IOTP>({
    username: { type: String },
    otp: { type: String, required: true },
    expiry: { type: Date, required: true }
}, { timestamps: true })

export const User = mongoose.model<IUser>("User", userSchema);
export const OTP = mongoose.model<IOTP>("Otp", OTPSchema)

