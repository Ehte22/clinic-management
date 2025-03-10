import express from "express"
import * as paymentController from "../controllers/payment.controller"

const paymentRouter = express.Router()

paymentRouter
    .post("/initiate-payment", paymentController.initiatePayment)
    .post("/verify-payment", paymentController.verifyPayment)


export default paymentRouter