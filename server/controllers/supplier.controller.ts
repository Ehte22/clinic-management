import { Request, Response } from "express"
import asyncHandler from "express-async-handler"
import { Supplier } from "../models/Supplier"
import { IUserProtected } from "../utils/protected"
import { customValidator } from "../utils/validator"
import { supplierRules } from "../rules/supplier.rules"
import redisClient from "../services/redisClient"
import { invalidateCache } from "../utils/redisMiddleware"

export const getSuppliers = asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const { page = 1, limit = 1, searchQuery = "", isFetchAll = false, selectedClinicId } = req.query

    const { clinicId, role } = req.user as IUserProtected

    const sortedQuery = JSON.stringify(Object.fromEntries(Object.entries(req.query).sort()))
    const cacheKey = `suppliers:${clinicId || "all"}:${sortedQuery}`
    const cachedData = await redisClient.get(cacheKey)

    if (cachedData) {
        return res.status(200).json(JSON.parse(cachedData))
    }

    const currentPage: number = parseInt((page as string))
    const pageLimit: number = parseInt((limit as string))
    const skip: number = (currentPage - 1) * pageLimit

    const query: any = {
        $and: [
            role !== "Super Admin" ? { clinic: clinicId } : selectedClinicId ? { clinic: selectedClinicId } : {},
            { deletedAt: null },
            searchQuery
                ? {
                    $or: [
                        { name: { $regex: searchQuery, $options: "i" } },
                        { "address.city": { $regex: searchQuery, $options: "i" } }
                    ]
                }
                : {}
        ]
    }

    const totalSuppliers = await Supplier.countDocuments(query)
    const totalPages = Math.ceil(totalSuppliers / pageLimit)

    let result = []
    if (isFetchAll) {
        if (role === "Super Admin") {
            result = await Supplier.find().lean()
        } else {
            result = await Supplier.find({ clinic: clinicId }).lean()
        }
    } else {
        result = await Supplier.find(query).skip(skip).limit(pageLimit).lean()
    }

    await redisClient.setex(
        cacheKey,
        3600,
        JSON.stringify({ message: "Suppliers fetch successfully", result, totalPages, totalSuppliers })
    )
    res.status(200).json({ message: "Suppliers fetch successfully", result, totalPages, totalSuppliers })
})

export const getSupplierById = asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params

    const cacheKey = `supplier:${id}`
    const cachedData = await redisClient.get(cacheKey)

    if (cachedData) {
        return res.status(200).json(JSON.parse(cachedData))
    }

    const result = await Supplier.findById(id).lean()

    if (!result) {
        return res.status(404).json({ message: "Supplier not found" })
    }

    await redisClient.setex(cacheKey, 3600, JSON.stringify({ message: "Supplier fetch successfully", result }))
    res.status(200).json({ message: "Supplier fetch successfully", result })
})

export const addSupplier = asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const { phone } = req.body
    const { clinicId } = req.user as IUserProtected
    const data = { clinic: clinicId, ...req.body }

    const { isError, error } = customValidator(data, supplierRules)

    if (isError) {
        return res.status(422).json({ message: "Validation errors", error })
    }

    const supplier = await Supplier.findOne({ phone })
    if (supplier) {
        return res.status(400).json({ message: `Supplier with phone number ${phone} already exist` })
    }

    const result = await Supplier.create(data)

    invalidateCache("suppliers:*")
    res.status(200).json({ message: "Supplier add successfully", result })
})

export const updateSupplier = asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params

    const supplier = await Supplier.findById(id)
    if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" })
    }

    await Supplier.findByIdAndUpdate(id, req.body, { new: true, runValidators: true })

    invalidateCache(`supplier:${id}`)
    invalidateCache("suppliers:*")

    res.status(200).json({ message: "Supplier update successfully" })
})

export const deleteSupplier = asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params

    const supplier = await Supplier.findById(id)
    if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" })
    }

    await Supplier.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true, runValidators: true })

    invalidateCache(`supplier:${id}`)
    invalidateCache("suppliers:*")

    res.status(200).json({ message: "Supplier delete successfully" })
})