import mongoose, { Model, Schema } from "mongoose";

interface IUser {
    _id?: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: number
}


export interface IDoctor {

    doctor: IUser;
    clinic: mongoose.Schema.Types.ObjectId;
    specialization: string;
    schedule: { day: string, from: string, to: string }[];
    qualifications?: string[];
    experience_years?: String;
    bio?: string;
    label?: string;
    isDeleted?: boolean;
    emergency_contact?: String;
}


const doctorSchema = new Schema<IDoctor>({
    doctor: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'User',

    },
    clinic: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'Clinic',
    },
    specialization: {
        type: String,
    },
    schedule: [
        {
            day: { type: String, },
            from: { type: String, },
            to: { type: String, }
        }
    ],
    qualifications: {
        type: String,

    },
    experience_years: {
        type: String,

    },
    bio: {
        type: String,

    },
    label: {
        type: String,

    },
    emergency_contact: {
        type: String,

    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });


export const Doctor: Model<IDoctor> = mongoose.model<IDoctor>("Doctor", doctorSchema);
