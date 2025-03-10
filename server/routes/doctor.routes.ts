import express from "express";
import {
    createDoctor,
    deleteDoctor,
    getActiveDoctors,
    getClinicDoctors,
    getDoctorById,
    getDoctors,
    getDoctorsByClinic,
    getDoctorSchedule,
    restoreDoctor,
    searchDoctors,
    searchDoctorsBySpecialization,
    updateDoctor,
    updateDoctorStatus,
} from "../controllers/doctor.controller";
import { cacheMiddleware } from "../utils/redisMiddleware";
import { restrict } from "../utils/protected";

const doctorRouter = express.Router();

doctorRouter
    .post("/create", restrict(["Super Admin"]), createDoctor)
    .get("/get-doctors", getDoctors)
    .get("/get-doctor/:id", getDoctorById)
    .put("/update-doctors/:id", restrict(["Super Admin", "Clinic Admin"]), updateDoctor)
    .put("/delete-doctors/:id", restrict(["Super Admin"]), deleteDoctor)
    .put("/restore-doctors/:id", restrict(["Super Admin"]), restoreDoctor)

    .get("/doctors/clinic/:clinic", getDoctorsByClinic)
    .get("/search/doctors", searchDoctors)
    .get("/doctors/active", getActiveDoctors)
    .get("/doctors/schedule/:id", getDoctorSchedule)
    .get("/doctors/search/:specialization", cacheMiddleware, searchDoctorsBySpecialization)
    .put("/doctors/updatestatus/:id", restrict(["Super Admin"]), updateDoctorStatus)



    .get('/get-clinic-doctors', getClinicDoctors)                  // Remove After Connected Auth 
// .get('/get-clinic-doctors', protectedRoute, getClinicDoctors)   // use After Connected Auth
export default doctorRouter;
