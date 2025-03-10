
import express from "express";
import {
    createAppointment,
    getAppointments,
    getAppointmentById,
    updateAppointment,
    deleteAppointment,
    restoreAppointment,
    changeAppointmentStatus,
    getAppointmentsByPatient,
    getAppointmentsByDoctor,
    getAppointmentsByClinic,
    filterAppointmentsByDate,
    markPaymentAsPaid,
    updateTimeSlot,
    getPastAppointments,
    cancelAppointment,
    getAppointmentStats,
    checkAppointmentAvailability,
    searchAppointments,
    rescheduleAppointment,
} from "../controllers/appointment.controller";
import { cacheMiddleware } from "../utils/redisMiddleware";
import { protectedRoute } from "../utils/protected";

const appointmentRouter = express.Router();

appointmentRouter
    .post("/create", protectedRoute, createAppointment)
    .get("/list", cacheMiddleware, getAppointments)
    .get("/detail/:id", getAppointmentById)
    .put("/update/:id", protectedRoute, updateAppointment)
    .put("/delete/:id", deleteAppointment)
    .put("/restore/:id", restoreAppointment)
    .put("/status/:id", changeAppointmentStatus)
    .get("/patient/:patient", cacheMiddleware, getAppointmentsByPatient)
    .get("/doctor/:doctor", cacheMiddleware, getAppointmentsByDoctor)
    .get("/clinic/:clinic", cacheMiddleware, getAppointmentsByClinic)
    .post("/filter", cacheMiddleware, filterAppointmentsByDate)
    .put("/payment/:id", markPaymentAsPaid)
    .put("/update/timeslot/:appointmentId", updateTimeSlot)
    .get("/get/past-apointments", cacheMiddleware, getPastAppointments)
    .put("/cancle-apointments/:id", cancelAppointment)
    .get("/get-AppointmentStats", cacheMiddleware, getAppointmentStats)
    .get("/check-appointmen-availability", cacheMiddleware, checkAppointmentAvailability)
    .get("/search/appointments", protectedRoute, searchAppointments)
    .put("/reschedule/appointment/:id", rescheduleAppointment);

export default appointmentRouter;
