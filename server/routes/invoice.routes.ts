import express from "express";
import * as invoiceController from "../controllers/invoice.controller";
import { cacheMiddleware } from "../utils/redisMiddleware";

const router = express.Router();

router
    .get("/fetch-all-invoice", cacheMiddleware, invoiceController.getAllInvoices)
    .post("/add-invoice", invoiceController.addInvoice)
    .delete("/delete-invoice/:invoiceId", invoiceController.deleteInvoice)
    .put("/restore-invoice/:invoiceId", invoiceController.restoreInvoice)
    .put("/update-invoice/:updateId", invoiceController.updateInvoice)
    .get("/get-invoice/:id", cacheMiddleware, invoiceController.getInvoiceById)
    .put("/change-payment-status/:invoiceId", invoiceController.ChangePaymentStatus)

export default router
