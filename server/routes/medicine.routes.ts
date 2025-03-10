import express from "express"
import * as MedicineController from "../controllers/medical.store.controller"
import { cacheMiddleware } from "../utils/redisMiddleware"

const medicineRouter = express.Router()

medicineRouter
     .post("/add-medicine", MedicineController.addMedicine)
     .post("/sell-medicine", MedicineController.sellMultipleMedicines)
     .get("/get-medicine", cacheMiddleware, MedicineController.getMedicines)
     .get("/get-single-medicine/:mId", cacheMiddleware, MedicineController.medicineGetById)
     .put("/update-medicine/:mId", MedicineController.updateMedicine)
     .delete("/delete-medicine/:mId", MedicineController.deleteMedicine)


export default medicineRouter     