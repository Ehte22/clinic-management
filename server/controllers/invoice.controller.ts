import { Request, Response, NextFunction } from "express"
import { customValidator, validationRulesSchema } from "../utils/validator"
import { Invoice } from "../models/Invoice"
import { parseISO } from 'date-fns'
import expressAsyncHandler from "express-async-handler"
import redisClient from "../services/redisClient"
import PDFDocument from "pdfkit"
import fs from "fs";

import { IUserProtected } from "../utils/protected"
import { invalidateCache } from "../utils/redisMiddleware"


interface IClinic {
    logo: string;
    name: string;
    street: string;
    city: string;
    state: string;
    country: string;
    contactInfo: string;
}

interface ITimeSlot {
    from: string;
    to: string;
}

interface IAppointment {
    patient: string;
    date: string;
    timeSlot: ITimeSlot;
    reason: string;
    status: string;
}

interface IItem {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

interface IInvoice {
    invoiceNumber: string;
    issueDate: string;
    dueDate: string;
    paymentStatus: string;
    paymentMethod: string;
    notes: string;
    clinic: IClinic;
    appointmentId: IAppointment;
    items: IItem[];
    tax: number;
    discount: number;
    totalAmount: number;
}

export const addInvoice = expressAsyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { appointmentId, issueDate, dueDate, paymentMethod, notes, } = req.body
    const { clinicId: clinic } = req.user as IUserProtected
    const processedBody = {
        ...req.body,
        tax: req.body.tax ? req.body.tax : undefined,
        discount: req.body.discount ? req.body.discount : undefined,
        totalAmount: req.body.totalAmount,
        items: req.body.items.map((item: any) => ({
            ...item,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
        })),
    };

    const invoiceValidationRules: validationRulesSchema = {
        appointmentId: { required: true, type: "string" },
        issueDate: { required: true, type: "string" },
        dueDate: { required: true, type: "string" },
        items: [
            {
                description: { required: true, type: "string" },
                quantity: { required: true, type: "number" },
                unitPrice: { required: true, min: 0, type: "number" },
                total: { required: true, min: 0, type: "number" },
            },
        ],
        tax: { required: true, min: 0, type: "number" },
        discount: { required: true, min: 0, type: "number" },
        totalAmount: { required: true, min: 0, type: "number" },
        paymentMethod: { required: true, pattern: /^(cash|card|online)$/ },
        notes: { required: true, max: 500, type: "string" },
    };

    const validationResult = customValidator(processedBody, invoiceValidationRules);

    if (validationResult.isError) {
        return res.status(400).json({ success: false, message: "Validation failed", errors: validationResult.error });
    }
    try {
        const randomId = Math.floor(1000 + Math.random() * 9000);
        const invoiceNumber = `INV-${randomId}`
        const invoice = new Invoice({
            invoiceNumber, appointmentId,
            issueDate, dueDate, items: processedBody.items,
            tax: processedBody.tax, discount: processedBody.discount, totalAmount: processedBody.totalAmount,
            paymentMethod, notes, clinic,
        })
        const savedInvoice = await Invoice.create(invoice)
        const pdfData: any = await Invoice.findById(savedInvoice._id).populate("appointmentId").populate("clinic")
        generateInvoicePDF(pdfData, `./invoices/${invoiceNumber}.pdf`)

        invalidateCache("invoices:*")
        return res.status(201).json({
            success: true,
            message: "Invoice created successfully",
            data: savedInvoice,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error", error: error })
    }
})
export const updateInvoice = expressAsyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { updateId } = req.params
    const { issueDate, dueDate, } = req.body

    const processedBody = {
        ...req.body,
        issueDate,
        dueDate,
        items: req.body.items.map((item: any) => ({
            ...item,
            quantity: item.quantity >= 1 ? item.quantity : 1,
            unitPrice: item.unitPrice,
            total: item.total,
        })),
    }
    try {
        const updatedInvoice = await Invoice.findByIdAndUpdate(updateId, {
            ...processedBody,
            issueDate: parseISO(issueDate),
            dueDate: parseISO(dueDate),
        })
        if (!updatedInvoice) {
            return res.status(404).json({ success: false, message: "Invoice not found" })
        }

        invalidateCache(`invoice:${updateId}`)
        invalidateCache("invoices:*")
        return res.status(200).json({
            success: true,
            message: "Invoice updated successfully",
            data: updatedInvoice,
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ success: false, message: "Server Error", error: error })
    }
})
export const getAllInvoices = expressAsyncHandler(async (req: Request, res: Response): Promise<any> => {
    try {
        const { clinicId: clinic, role } = req.user as IUserProtected
        const sortedQuery = JSON.stringify(Object.fromEntries(Object.entries(req.query).sort()))
        const cacheKey = `invoices:${clinic || "all"}:${sortedQuery}`
        const cacheData = await redisClient.get(cacheKey)

        if (cacheData) {
            return res.status(200).json(JSON.parse(cacheData))
        }

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;
        const filter = req.query.filter || '';

        let filterQuery: any = {
            isDelete: false,
            ...(filter && {
                $or: [{ label: { $regex: filter, $options: "i" } },
                { invoiceNumber: { $regex: filter, $options: "i" } }]
            })
        }

        if (role !== "Super Admin") {
            filterQuery.clinic = clinic;
        } else {
            if (req.query.selectedClinicId) {
                filterQuery.clinic = req.query.selectedClinicId;
            }
        }

        const invoices = await Invoice.find(filterQuery)
            .populate('appointmentId')
            .skip(skip)
            .limit(limit)
            .exec();
        const totalInvoices = await Invoice.countDocuments(filterQuery);

        await redisClient.setex(
            cacheKey,
            3600,
            JSON.stringify({
                page: page,
                limit: limit,
                success: true,
                message: 'Invoices fetched successfully',
                total: totalInvoices,
                totalPages: Math.ceil(totalInvoices / limit),
                data: invoices,
            })
        )
        return res.status(200).json({
            page: page,
            limit: limit,
            success: true,
            message: 'Invoices fetched successfully',
            total: totalInvoices,
            totalPages: Math.ceil(totalInvoices / limit),
            data: invoices,
        });
    } catch (error: unknown) {
        console.error(error);
        if (error instanceof Error) {
            return res.status(500).json({
                success: false,
                message: 'Server error while fetching invoices',
                error: error.message,
            });
        } else {
            return res.status(500).json({
                success: false,
                message: 'Server error while fetching invoices',
                error: 'An unknown error occurred',
            });
        }
    }
})
export const deleteInvoice = expressAsyncHandler(async (req: Request, res: Response): Promise<any> => {
    const { invoiceId } = req.params
    try {
        if (!invoiceId) {
            return res.status(400).json({ success: false, message: 'Invoice not found' })
        }
        const updatedInvoice = await Invoice.findByIdAndUpdate(invoiceId, { isDelete: true })

        invalidateCache(`invoice:${invoiceId}`)
        invalidateCache("invoices:*")
        return res.status(200).json({
            success: true,
            message: 'Invoice deleted successfully',
            data: updatedInvoice,
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success: false, message: 'Server error while deleting invoice',
            error: error instanceof Error ? error.message : 'An unknown error occurred',
        })
    }
})
export const restoreInvoice = expressAsyncHandler(async (req: Request, res: Response): Promise<any> => {
    const { invoiceId } = req.params
    try {
        if (!invoiceId) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found',
            })
        }
        const updatedInvoice = await Invoice.findByIdAndUpdate(invoiceId, { isDelete: false })

        invalidateCache(`invoice:${invoiceId}`)
        invalidateCache("invoices:*")
        return res.status(200).json({
            success: true,
            message: 'Invoice Restore successfully',
            data: updatedInvoice,
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success: false, message: 'Server error while deleting invoice',
            error: error instanceof Error ? error.message : 'An unknown error occurred',
        })
    }
})
export const getInvoiceById = expressAsyncHandler(async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params

        const cacheKey = `invoice:${id}`
        const cacheData = await redisClient.get(cacheKey)

        if (cacheData) {
            return res.status(200).json(JSON.stringify(cacheData))
        }

        if (!id) {
            return res.status(400).json({ success: false, message: "Invoice ID is required." })
        }
        const invoice = await Invoice.findById(id)
            .populate("appointmentId")

        if (!invoice) {
            return res.status(404).json({ success: false, message: "Invoice not found." })
        }

        await redisClient.setex(
            cacheKey,
            3600,
            JSON.stringify({ success: true, message: "Invoice Fetch  SuccessFully", data: invoice })
        )
        res.status(200).json({ success: true, message: "Invoice Fetch  SuccessFully", data: invoice })
    } catch (error) {
        console.error("Error fetching invoice:", error);
        res.status(500).json({ success: false, message: "Server error. Please try again later." })
    }
})
export const generateInvoicePDF = (invoice: IInvoice, outputPath: string): void => {
    const doc = new PDFDocument({ margin: 40 });
    const drawLine = (topMargin: number = 10) => {
        doc.y += topMargin;
        doc.moveTo(40, doc.y).lineTo(570, doc.y).stroke();
    };

    const writeLine = (text: string, options = {}) => {
        doc.text(text, options);
    };

    // Pipe to file
    doc.pipe(fs.createWriteStream(outputPath));

    // Clinic Details Section
    doc.image("./assets/logo.png", 40, 40, { width: 80 });
    doc.fontSize(16).font("Helvetica-Bold").text(invoice.clinic.name, 130, 40);
    doc.fontSize(10).font("Helvetica").text(`${invoice.clinic.street}, ${invoice.clinic.city}, ${invoice.clinic.state}, ${invoice.clinic.country}`, 130, 60);
    doc.text(`Contact: ${invoice.clinic.contactInfo}`, 130, 75);

    doc.moveDown(2);
    doc.fontSize(14).font("Helvetica-Bold").text("Invoice Details:");
    drawLine(15);
    doc.fontSize(10).font("Helvetica");
    writeLine(`Invoice Number: ${invoice.invoiceNumber}`);
    writeLine(`Issue Date: ${new Date(invoice.issueDate).toDateString()}`);
    writeLine(`Due Date: ${new Date(invoice.dueDate).toDateString()}`);
    writeLine(`Payment Status: ${invoice.paymentStatus}`);
    writeLine(`Payment Method: ${invoice.paymentMethod}`);
    writeLine(`Notes: ${invoice.notes}`);

    doc.moveDown(1);
    doc.fontSize(14).font("Helvetica-Bold").text("Patient and Appointment Details:");
    drawLine()
    doc.fontSize(10).font("Helvetica");
    writeLine(`Patient Name: ${invoice.appointmentId.patient}`);
    writeLine(`Appointment Date: ${new Date(invoice.appointmentId.date).toDateString()}`);
    writeLine(`Time: ${invoice.appointmentId.timeSlot.from} - ${invoice.appointmentId.timeSlot.to}`);
    writeLine(`Reason: ${invoice.appointmentId.reason}`);
    writeLine(`Status: ${invoice.appointmentId.status}`);

    doc.moveDown(1);
    doc.fontSize(14).font("Helvetica-Bold").text("Items Details:");
    drawLine();
    doc.fontSize(10).text("Description", 40, doc.y, { width: 200, continued: true });
    doc.text("Quantity", 250, doc.y, { width: 100, continued: true });
    doc.text("Unit Price", 350, doc.y, { width: 100, continued: true });
    doc.text("Total", 450, doc.y);
    drawLine();

    invoice.items.forEach((item) => {
        doc.text(item.description, 40, doc.y, { width: 200, continued: true });
        doc.text(item.quantity.toString(), 250, doc.y, { width: 100, continued: true });
        doc.text(`₹${item.unitPrice.toFixed(2)}`, 350, doc.y, { width: 100, continued: true });
        doc.text(`₹${item.total.toFixed(2)}`, 450, doc.y);
    });

    doc.moveDown(1);
    drawLine();
    doc.fontSize(10).font("Helvetica-Bold");
    writeLine(`Tax: ₹${invoice.tax.toFixed(2)}`);
    writeLine(`Discount: ₹${invoice.discount.toFixed(2)}`);
    writeLine(`Total Amount: ₹${invoice.totalAmount.toFixed(2)}`);

    doc.moveDown(2);
    doc.fontSize(12).font("Helvetica-Bold").text("Thank you for your business!", { align: "center" });

    doc.end();
}

export const ChangePaymentStatus = expressAsyncHandler(async (req: Request, res: Response): Promise<any> => {
    const { invoiceId } = req.params
    const { paymentStatus } = req.body

    const result = await Invoice.findByIdAndUpdate(invoiceId, { paymentStatus })

    invalidateCache(`invoice:${invoiceId}`)
    invalidateCache("invoices:*")
    res.status(200).json({ message: "Payment Status Changed.!", result })
})
