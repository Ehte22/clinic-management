import express from "express"
import * as dashboardController from "../controllers/dashboard.controller"
import { restrict } from "../utils/protected"

const dashboardRouter = express.Router()

dashboardRouter
    .get("/clinic-dashboard", restrict(["Super Admin", "Clinic Admin"]), dashboardController.clinicAdminDashboard)
    .get("/dashboard", restrict(["Super Admin"]), dashboardController.dashboard)

export default dashboardRouter