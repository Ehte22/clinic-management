import { Router } from "express";
import {
    createPatient, deletePatient, getAllAllPatient, getAllPatients, getPatientById,
    getPatientsForTable,
    updatePatient

} from "../controllers/patient.controller";


const patientRouter = Router();

patientRouter
    .post("/patient-create", createPatient)
    .get("/patient-all", getAllAllPatient)
    .get("/patient-list/:clinic", getAllPatients)
    .get("/patient-view/:patientbyid", getPatientById)
    .put("/patient-update/:updatepatient", updatePatient)
    .delete("/patient-delete/:id", deletePatient)
    .get("/patient-table", getPatientsForTable)


export default patientRouter;
