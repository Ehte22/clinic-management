import { Request, Response } from "express"
import asyncHandler from "express-async-handler"
import razorpay from "razorpay"
import { v4 as uuid } from "uuid"
import crypto from "crypto"
import dotenv from "dotenv"

dotenv.config()

export const initiatePayment = asyncHandler(async (req: Request, res): Promise<any> => {
    const { amount } = req.body
    const instance = new razorpay({
        key_id: process.env.RAZORPAY_API_KEY,
        key_secret: process.env.RAZORPAY_SECRET_KEY
    })

    instance.orders.create({
        amount: amount * 100,
        currency: "INR",
        receipt: uuid()
    }, (err: any, order) => {
        if (err) {
            return res.status(500).json({ message: err.message || "Unable to process request" })
        }
        res.status(200).json({ message: "initiate success", orderId: order.id, amount })

    })
})

export const verifyPayment = asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET_KEY as string);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature === razorpay_signature) {
        res.json({ success: true, message: "Payment successful" });
    } else {
        res.status(400).json({ success: false, message: "Payment verification failed" });
    }
});
