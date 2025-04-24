import { NextFunction, Request, Response } from "express"
import asyncHandler from "express-async-handler"
import { customValidator } from "../utils/validator"
import { IUserProtected } from "../utils/protected"
import Medicine from "../models/Medicine"
import { medicineRules } from "../rules/medicine.rules"

// Get All
export const getAllMedicines = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { page = 1, limit = 10, searchQuery = "", isFetchAll = false, selectedClinic = "" } = req.query

    const { clinicId, role } = req.user as IUserProtected

    const currentPage: number = parseInt(page as string)
    const pageLimit: number = parseInt(limit as string)
    const skip: number = (currentPage - 1) * pageLimit

    const query: any = {
        $and: [
            role !== "Super Admin" ? { clinic: clinicId } : selectedClinic ? { clinicId: selectedClinic } : {},
            { deletedAt: null },
            searchQuery
                ? {
                    $or: [
                        { medicineName: { $regex: searchQuery, $options: "i" } },
                        { category: { $regex: searchQuery, $options: "i" } },
                        {
                            $expr: {
                                $regexMatch: {
                                    input: { $toString: "$price" },
                                    regex: searchQuery,
                                    options: "i",
                                },
                            },
                        },
                        {
                            $expr: {
                                $regexMatch: {
                                    input: { $toString: "$mg" },
                                    regex: searchQuery,
                                    options: "i",
                                },
                            },
                        },
                    ]
                }
                : {}
        ]
    }

    const totalEntries = await Medicine.countDocuments(query)
    const totalPages = Math.ceil(totalEntries / pageLimit)

    let result = []
    if (isFetchAll) {
        result = await Medicine.find(query).sort({ createdAt: -1 }).lean()
    } else {
        result = await Medicine.find(query).sort({ createdAt: -1 }).skip(skip).limit(pageLimit).sort({ createdAt: -1 }).lean()
    }

    const pagination = {
        page: currentPage,
        limit: pageLimit,
        totalEntries,
        totalPages: totalPages
    }

    res.status(200).json({ message: "Medicines Fetch Successfully", result, pagination })
})

// Get By ID
export const getMedicineById = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params

    const result = await Medicine.findById(id).lean()

    if (!result) {
        return res.status(400).json({ message: "Medicine Not Found" })
    }

    res.status(200).json({ message: "Medicine Fetch Successfully", result })
})

// Add
export const addMedicine = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { medicineName } = req.body

    const { clinicId } = req.user as IUserProtected

    const medicine = await Medicine.findOne({ clinic: clinicId, medicineName, deletedAt: null }).lean()
    if (medicine) {
        return res.status(400).json({ message: "Medicine Already Exist" })
    }

    const data = { ...req.body, clinic: clinicId }

    const { isError, error } = customValidator(data, medicineRules)

    if (isError) {
        return res.status(422).json({ message: "Validation Error", error })
    }

    const result = await Medicine.create(data)

    res.status(200).json({ message: "Medicine Add Successfully", result })
})

// Update
export const updateMedicine = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params

    const medicine = await Medicine.findById(id).lean()
    if (!medicine) {
        return res.status(400).json({ message: "Medicine Not Found" })
    }

    await Medicine.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    res.status(200).json({ message: "Medicine Update Successfully" })
})

// Update Status
export const updateMedicineStatus = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params
    const { status } = req.body

    const medicine = await Medicine.findById(id).lean()
    if (!medicine) {
        return res.status(400).json({ message: "Medicine Not Found" })
    }

    await Medicine.findByIdAndUpdate(id, { isActive: status }, { new: true, runValidators: true })
    res.status(200).json({ message: "Medicine Status Update Successfully" })
})

// Delete
export const deleteMedicine = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params

    const medicine = await Medicine.findById(id)

    if (!medicine) {
        return res.status(400).json({ message: "Medicine Not Found" })
    }

    await Medicine.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true, runValidators: true })

    res.status(200).json({ message: "Medicine Delete Successfully" })
})