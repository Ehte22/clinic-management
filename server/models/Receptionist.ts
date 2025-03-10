import mongoose, { Model, Schema } from "mongoose";
import { Types } from "mongoose";

// export interface IReceptionist {
//     // firstName: string;
//     // lastName: string;
//     // email: string;
//     // mobile: number;
//     // profile: string;
//     user: mongoose.Schema.Types.ObjectId;
//     clinic: mongoose.Schema.Types.ObjectId;
//     doctor: mongoose.Schema.Types.ObjectId;
//     isDelete: boolean;
//     status: 'active' | 'inactive';
//     working_hours: { day: string, from: string, to: string }[];
// }



interface IUser extends Document {
    _id: Types.ObjectId;
    status: string;
}


interface IReceptionist extends Document {
    _id: Types.ObjectId;
    clinic?: Types.ObjectId;
    user: IUser;
    isDelete: boolean;
    status: 'active' | 'inactive';
    working_hours: { day: string, from: string, to: string }[];
}

const receptionistSchema = new Schema<IReceptionist>({
    // firstName: { type: String, required: true },
    // lastName: { type: String, required: true },
    // email: { type: String, required: true },
    // mobile: { type: Number, required: true },
    // profile: { type: String },
    user: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    clinic: { type: mongoose.Types.ObjectId, ref: 'Clinic', required: true },
    status: { type: String, enum: ['active', 'inactive'], default: "active" },
    working_hours: [
        {
            day: { type: String, required: true },
            from: { type: String, required: true },
            to: { type: String, required: true }
        }
    ],
    isDelete: { type: Boolean, default: false }
}, { timestamps: true })

export const Receptionist: Model<IReceptionist> = mongoose.model<IReceptionist>("Receptionist", receptionistSchema);
