import express, { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import cron from "node-cron";
import redisClient from "./services/redisClient";
import medicineRouter from "./routes/medicine.routes";
import authRouter from "./routes/auth.routes";
import passport from "./services/passport"
import invoiceRouter from './routes/invoice.routes'
import ReceptionistRouter from './routes/receptionist.routes'
import doctorRouter from "./routes/doctor.routes";
import patientRouter from "./routes/patient.routes";
import appointmentRouter from "./routes/appointment.routes";
import priscriptionRouter from "./routes/prescription.routes";
import clinicRouter from "./routes/clinic.routes";
import userRouter from "./routes/user.routes";
import dashboardRouter from "./routes/dashBoard.routes";
import supplierRouter from "./routes/supplier.routes";
import { protectedRoute } from "./utils/protected";
import { checkAndDeactivateExpiredClinics, checkSubscription, sendSubscriptionReminders } from "./utils/checkSubscription";
import { app, server } from "./utils/socket";
import paymentRouter from "./routes/payment.routes";
import rateLimit from "express-rate-limit";

dotenv.config()
app.use(express.json())
app.use(express.static("invoices"))
app.use(morgan("dev"))

app.use(rateLimit({
    windowMs: 1000 * 60 * 15,
    max: 50,
    message: "We have received to many request from this IP. Please try after 15 minutes."
}))

app.use(express.urlencoded({ extended: true }))
app.use(cors({
    origin: true,
    credentials: true
}))

app.use(passport.initialize())

app.use("/api/v1/auth", authRouter)
app.use("/api/v1/user", userRouter)
app.use("/api/v1/clinic", clinicRouter)
app.use("/api/v1/appointment", protectedRoute, checkSubscription, appointmentRouter)
app.use("/api/v1/patient", protectedRoute, checkSubscription, patientRouter);
app.use("/api/v1/prescription", protectedRoute, checkSubscription, priscriptionRouter)
app.use("/api/v1/medicine", protectedRoute, checkSubscription, medicineRouter)
app.use("/api/v1/doctor", protectedRoute, checkSubscription, doctorRouter)
app.use("/api/v1/invoice", protectedRoute, checkSubscription, invoiceRouter)
app.use("/api/v1/receptionist", protectedRoute, checkSubscription, ReceptionistRouter)
app.use("/api/v1/admin", protectedRoute, checkSubscription, dashboardRouter)
app.use("/api/v1/supplier", protectedRoute, checkSubscription, supplierRouter)
app.use("/api/v1/payment", paymentRouter)

redisClient.on("connect", () => {
    console.log('Connected to Redis');
})

app.use((req: Request, res: Response, next: NextFunction) => {
    res.status(404).json({ message: "Resource not found", });
})

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    res.status(500).json({ message: "Something went wrong", error: err.message });
})

mongoose.connect(process.env.MONGO_URL || "").catch((err) => {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
});

cron.schedule("0 0 * * *", async () => {
    await sendSubscriptionReminders()
    await checkAndDeactivateExpiredClinics();
});

// Start the Server
const PORT = process.env.PORT || 5000
mongoose.connection.once("open", async () => {
    console.log("MongoDb Connected")
    server.listen(PORT, () => {
        console.log(`Server is running on ${PORT}`)
    });
});

