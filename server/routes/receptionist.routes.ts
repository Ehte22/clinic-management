import { Router } from 'express'
import * as ReceptionistController from '../controllers/receptionist.controller'
import multerMiddleware from '../utils/upload'
import { restrict } from '../utils/protected'
import { cacheMiddleware } from '../utils/redisMiddleware'

const ReceptionistRouter = Router()
const upload = multerMiddleware()

ReceptionistRouter
    .post('/add-receptionist', restrict(["Super Admin", "Clinic Admin"]), upload.single('profile'), ReceptionistController.addReceptionist)     // Use  After Connected Auth
    .get("/receptionists", cacheMiddleware, ReceptionistController.getAllReceptionists)
    .get("/receptionists/:id", cacheMiddleware, ReceptionistController.getReceptionistById)
    .put("/update-receptionists/:id", restrict(["Super Admin", "Clinic Admin"]), upload.single('profile'), ReceptionistController.updateReceptionist)
    .delete("/receptionists/:id", restrict(["Super Admin", "Clinic Admin"]), ReceptionistController.deleteReceptionist)
    .put("/receptionists/:id/status", restrict(["Super Admin", "Clinic Admin"]), ReceptionistController.changeReceptionistStatus)
    .get("/receptionists/clinic/:clinic", cacheMiddleware, ReceptionistController.getReceptionistsByClinic)


export default ReceptionistRouter