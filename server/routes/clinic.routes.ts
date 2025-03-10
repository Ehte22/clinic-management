import express from "express"
import * as clinicController from "../controllers/clinic.controller"
import multerMiddleware from "../utils/upload"
import { protectedRoute, restrict } from "../utils/protected"

const clinicRouter = express.Router()

const upload = multerMiddleware()

clinicRouter
    .get("/", protectedRoute, clinicController.getClinics)
    .get("/get-clinic/:id", protectedRoute, clinicController.getClinicById)
    .post("/create-clinic", protectedRoute, restrict(["Super Admin"]), upload.single("logo"), clinicController.createClinic)
    .put("/update-clinic/:id", protectedRoute, restrict(["Super Admin"]), upload.single("logo"), clinicController.updateClinic)
    .put("/delete-clinic/:id", protectedRoute, restrict(["Super Admin"]), clinicController.deleteClinic)
    .put("/update-status/:id", protectedRoute, restrict(["Super Admin"]), clinicController.updateClinicStatus)
    .post("/register-clinic", upload.single("logo"), clinicController.registerClinic)

export default clinicRouter