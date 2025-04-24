import express from "express"
import * as clinicController from "../controllers/clinic.controller"
import multerMiddleware from "../utils/upload"
import { protectedRoute, restrict } from "../utils/protected"

const clinicRouter = express.Router()

const upload = multerMiddleware()

clinicRouter
    .get("/", protectedRoute, clinicController.getClinics)
    .get("/:id", protectedRoute, clinicController.getClinicById)
    .post("/add", protectedRoute, restrict(["Super Admin"]), upload.single("logo"), clinicController.createClinic)
    .put("/update/:id", protectedRoute, restrict(["Super Admin"]), upload.single("logo"), clinicController.updateClinic)
    .put("/status/:id", protectedRoute, restrict(["Super Admin"]), clinicController.updateClinicStatus)
    .put("/delete/:id", protectedRoute, restrict(["Super Admin"]), clinicController.deleteClinic)
    .post("/register-clinic", upload.single("logo"), clinicController.registerClinic)

export default clinicRouter