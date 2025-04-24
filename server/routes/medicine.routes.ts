import express from "express"
import * as MedicineController from "../controllers/medicine.controller"
import { cacheMiddleware } from "../utils/redisMiddleware"

const medicineRouter = express.Router()

medicineRouter
     .get("/", cacheMiddleware, MedicineController.getAllMedicines)
     .get("/:id", cacheMiddleware, MedicineController.getMedicineById)
     .post("/add", MedicineController.addMedicine)
     .put("/update/:id", MedicineController.updateMedicine)
     .put("/status/:id", MedicineController.updateMedicineStatus)
     .put("/delete/:id", MedicineController.deleteMedicine)

export default medicineRouter     