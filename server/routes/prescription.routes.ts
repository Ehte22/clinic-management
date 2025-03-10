import express from 'express';
import {
    createPrescription, deletePrescription, getAllPrescriptions, getPrescriptionById,
    getPrescriptionsByClinic,
    getPrescriptionsByDoctor, getPrescriptionsByPatient,
    updatePrescription
} from '../controllers/prescription.controller';
import { restrict } from '../utils/protected';


const priscriptionRouter = express.Router();


priscriptionRouter
    .post('/create', restrict(["Super Admin", "Clinic Admin", "Doctor"]), createPrescription)
    .get('/all', getAllPrescriptions)
    .get('/patient/:patientId', getPrescriptionsByPatient)
    .get('/doctor/:doctorId', getPrescriptionsByDoctor)
    .get('/prescription/:prescriptionId', getPrescriptionById)
    .put('/update/:prescriptionId', updatePrescription)
    .delete('/delete/:deleteprescriptionId', deletePrescription)
    .get('/clinic/:clinicId', getPrescriptionsByClinic)

export default priscriptionRouter
    ;
