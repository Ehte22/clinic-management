import mongoose, { Schema, Document } from "mongoose";

export interface IBuyMedicine extends Document {
  patient: { type: mongoose.Schema.Types.ObjectId},
  medicines: {
    _id: mongoose.Schema.Types.ObjectId;
    mId: string;
    price: number;
    qty: number;
  }[];
  total: number;
  purchaseDate: Date;
}

const BuyMedicineSchema: Schema = new Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  // mobile: { type: String, required: true },
  medicines: [
    {
      _id: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine", required: true },
      mId: { type: String, required: true },
      price: { type: Number, required: true },
      qty: { type: Number, required: true },
    },
  ],
  total: { type: Number, required: true },
  // purchaseDate: { type: Date, default: Date.now },
});

const BuyedMedicine = mongoose.model<IBuyMedicine>("SellMedicine", BuyMedicineSchema);
 export default BuyedMedicine
