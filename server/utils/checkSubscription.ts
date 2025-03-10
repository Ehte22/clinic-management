import { NextFunction, Request, Response } from "express";
import { IUserProtected } from "./protected";
import { Clinic } from "../models/Clinic";
import { User } from "../models/User";
import { sendEmail } from "./email";
import mongoose from "mongoose";
import { subscriptionReminderTemplate } from "../templates/subscriptionReminderTemplate";
import { invalidateCache } from "./redisMiddleware";

export const checkSubscription = async (req: Request, res: Response, next: NextFunction): Promise<any> => {

    const { clinicId, role } = req.user as IUserProtected

    if (role === "Super Admin") {
        return next();
    }

    if (!clinicId) {
        return res.status(400).json({ message: "Clinic ID is required." });
    }

    const clinic = await Clinic.findById({ _id: clinicId });

    if (!clinic) {
        return res.status(404).json({ message: "Clinic not found" });
    }

    if (clinic.status === "inactive") {
        return res.status(403).json({ message: "Subscription expired. Please renew your plan." });
    }

    next();
};


export const checkAndDeactivateExpiredClinics = async () => {
    const today = new Date();
    const session = await mongoose.startSession(); // Start a session for atomic operations

    try {
        session.startTransaction(); // Begin the transaction

        // Update clinics to inactive where expiryDate is before today
        const updatedClinics = await Clinic.updateMany(
            { endDate: { $lt: today }, status: "active" },
            { $set: { status: "inactive" } },
            { session } // Ensure the operation is part of the transaction
        );

        if (updatedClinics.modifiedCount > 0) {
            // Fetch the clinic IDs that were updated (inactive status)
            const clinicIds = await Clinic.find(
                { endDate: { $lt: today }, status: "inactive" },
                { _id: 1 },
                { session } // Ensure the query is part of the transaction
            );

            const clinicIdList = clinicIds.map(clinic => clinic._id);

            // Update users linked to these clinics
            await User.updateMany(
                { clinicId: { $in: clinicIdList }, role: { $in: ["Clinic Admin", "Doctor", "Receptionist"] } },
                { $set: { status: "inactive" } },
                { session } // Include in the same transaction
            );

            invalidateCache("clinics:*")
            invalidateCache("users:*")
            // console.log(`Deactivated ${updatedClinics.modifiedCount} expired clinics and their associated users.`);
        }

        await session.commitTransaction(); // Commit the transaction if everything went well
    } catch (error) {
        await session.abortTransaction(); // Rollback transaction in case of error
        // console.error("Error deactivating expired clinics and users:", error);
    } finally {
        session.endSession(); // End the session
    }
};

export const sendSubscriptionReminders = async () => {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0); // Reset time to midnight

    // Check for clinics expiring in 30, 15, and 5 days
    const daysBeforeExpiry = [30, 15, 5];

    for (const days of daysBeforeExpiry) {
        const reminderDate = new Date(today);
        reminderDate.setDate(today.getDate() + days);
        reminderDate.setUTCHours(0, 0, 0, 0); // Ensure time is set to midnight

        // Create start and end range for the entire day
        const startOfDay = new Date(reminderDate);
        const endOfDay = new Date(reminderDate);
        endOfDay.setUTCHours(23, 59, 59, 999); // End of day

        // console.log(`Checking for clinics expiring on: ${reminderDate.toISOString()}`);

        // Query clinics expiring exactly on that day
        const expiringClinics = await Clinic.find({
            endDate: { $gte: startOfDay, $lte: endOfDay },
            status: "active"
        });

        // console.log(`Found ${expiringClinics.length} clinics expiring in ${days} days:`, expiringClinics);

        for (const clinic of expiringClinics) {
            const clinicAdmin = await User.findOne({ clinicId: clinic._id, role: "Clinic Admin" });

            if (clinicAdmin) {
                const subject = `Subscription Expiry Reminder: ${days} days left`;

                const reminderTemplate = subscriptionReminderTemplate({ firstName: clinicAdmin.firstName, lastName: clinicAdmin.lastName, days })

                await sendEmail({
                    to: clinicAdmin.email,
                    subject,
                    text: reminderTemplate
                });
            }
        }
    }
};

