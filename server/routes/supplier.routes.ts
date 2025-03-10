import express from "express"
import * as supplierController from "../controllers/supplier.controller"
import { cacheMiddleware } from "../utils/redisMiddleware"

const supplierRouter = express.Router()

supplierRouter
    .get("/", cacheMiddleware, supplierController.getSuppliers)
    .get("/get-supplier/:id", cacheMiddleware, supplierController.getSupplierById)
    .post("/create-supplier", supplierController.addSupplier)
    .put("/update-supplier/:id", supplierController.updateSupplier)
    .put("/delete-supplier/:id", supplierController.deleteSupplier)

export default supplierRouter