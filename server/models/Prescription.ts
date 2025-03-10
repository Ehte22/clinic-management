import mongoose, { Schema, Document, Model } from "mongoose";

interface Medicine {
    name: string;
    dosage: string;
    frequency: string;
    instructions?: string;
    select?: boolean;
}

interface ITest {
    name: string;
}

export interface IPrescription extends Document {
    patient: mongoose.Schema.Types.ObjectId;
    medical: {
        array: true,
        medicine: string;
        dosage: string;
        duration: number;
        instructions: "Before Meal" | "After Meal" | "Without Meal";
        frequency: string;
        tests?: ITest[];
    }[];
    prescriptionNumber: string;

    pulse?: number;
    quantity: number;
    // frequency: number;
    frequency: " Daily Morning" | " Daily Afternoon" | " Daily Evening" | " Daily Night" | "1" | "2" | "4" | "5";
    note?: string;
    temp?: string;
    isDeleted?: boolean;
    cvs?: string;
    createdAt?: Date;
    updatedAt?: Date;

    weight?: string;
    age?: string;
    bp?: string;
    pa?: string;
    rs?: number;
    complete?: boolean;


    diagnost?: string;
    visitDate: Date;
}

const prescriptionSchema = new mongoose.Schema<IPrescription>(
    {
        patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
        medical: [
            {
                medicine: { type: String, required: true },
                dosage: { type: String, required: true },
                duration: { type: Number, required: true },

                frequency: {
                    type: [String],
                    required: true
                },

                quantity: { type: Number, required: true },
                tests: { type: String, },
                instructions: {
                    type: String,
                    enum: ["Before Meal", "After Meal", "Without Meal"],
                    required: true
                },
            },
        ],
        note: { type: String, },

        age: { type: Number },
        weight: { type: Number },
        complete: { type: String },
        diagnost: { type: String },

        // visitDate: { type: Date, default: Date.now },
        prescriptionNumber: { type: String, unique: true, },
        isDeleted: { type: Boolean, default: false },

        temp: { type: String },
        bp: { type: String },
        pulse: { type: String },
        pa: { type: String },
        rs: { type: String },
        cvs: { type: String },


    },

    { timestamps: true }
);

export const Prescription: Model<IPrescription> = mongoose.model<IPrescription>(
    "Prescription",
    prescriptionSchema
);



