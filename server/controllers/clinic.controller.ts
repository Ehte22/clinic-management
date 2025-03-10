import { NextFunction, Request, Response } from "express"
import asyncHandler from "express-async-handler"
import { customValidator } from "../utils/validator"
import { createClinicRules } from "../rules/clinic.rules"
import { Clinic, IClinic } from "../models/Clinic"
import cloudinary from "../utils/uploadConfig"
import redisClient from "../services/redisClient"
import { invalidateCache } from "../utils/redisMiddleware"

// Get All Clinics
export const getClinics = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { page = 1, limit = 10, searchQuery = "", isFetchAll = false } = req.query

    const sortedQuery = JSON.stringify(Object.fromEntries(Object.entries(req.query).sort()))
    const cacheKey = `clinics:${sortedQuery}`
    const cachedData = await redisClient.get(cacheKey)

    if (cachedData) {
        return res.status(200).json(JSON.parse(cachedData))
    }

    const currentPage = parseInt(page as string)
    const pageLimit = parseInt(limit as string)
    const skip: number = (currentPage - 1) * pageLimit

    const query = searchQuery
        ? {
            $or: [
                { name: { $regex: searchQuery, $options: "i" } },
                { city: { $regex: searchQuery, $options: "i" } }
            ]
        }
        : {}

    const totalClinics = await Clinic.countDocuments(query)
    const totalPages = Math.ceil(totalClinics / pageLimit)

    let result = []
    if (isFetchAll) {
        result = await Clinic.find().lean()
    } else {
        result = await Clinic.find(query).skip(skip).limit(pageLimit).lean()
    }

    await redisClient.setex(
        cacheKey,
        3600,
        JSON.stringify({ message: "Clinics fetch successfully", result, totalPages, totalClinics })
    )
    res.status(200).json({ message: "Clinics fetch successfully", result, totalPages, totalClinics })
})

// Get Clinic By Id
export const getClinicById = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params

    const cacheKey = `clinic:${id}`
    const cachedData = await redisClient.get(cacheKey)

    if (cachedData) {
        return res.status(200).json(JSON.parse(cachedData))
    }

    const result = await Clinic.findById(id).lean()

    if (!result) {
        return res.status(404).json({ message: `Clinic with ID: ${id} not found` })
    }

    await redisClient.setex(cacheKey, 3600, JSON.stringify({ message: "Clinic fetch successfully", result }))
    res.status(200).json({ message: "Clinic fetch successfully", result })
})

// Create Clinic
export const createClinic = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { name }: IClinic = req.body

    let logo = ""
    if (req.file) {
        const { secure_url } = await cloudinary.uploader.upload(req.file.path)
        logo = secure_url
    }

    const data = { ...req.body, logo }

    const { isError, error } = customValidator(data, createClinicRules)

    if (isError) {
        return res.status(422).json({ message: "Validation error", error })
    }

    const clinic = await Clinic.findOne({ name }).lean()

    if (clinic) {
        return res.status(400).json({ message: `Clinic with name ${name} already exist` })
    }

    const result = await Clinic.create({ ...data, registerByAdmin: true })

    invalidateCache("clinics:*")
    res.status(200).json({ message: "Clinic create successfully", result })

})

// Update Clinic
export const updateClinic = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params

    const clinic = await Clinic.findById(id)

    if (!clinic) {
        return res.status(404).json({ message: "Clinic not found" })
    }

    let logoUrl
    if (req.file) {
        try {
            const publicId = clinic.logo?.split("/").pop()?.split(".")[0]
            publicId && await cloudinary.uploader.destroy(publicId)

            const { secure_url } = await cloudinary.uploader.upload(req.file.path)
            logoUrl = secure_url
        } catch (error: any) {
            return res.status(500).json({ message: 'Failed to upload new image', error: error?.message });
        }
    }

    await Clinic.findByIdAndUpdate(id, { ...req.body, logo: logoUrl }, { new: true, runValidators: true })

    invalidateCache(`clinic:${id}`)
    invalidateCache("clinics:*")
    res.status(200).json({ message: "Clinic update successfully" })
})

// Delete Clinic
export const deleteClinic = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params

    const clinic = await Clinic.findById(id)

    if (!clinic) {
        return res.status(400).json({ message: "Clinic not found" })
    }

    await Clinic.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true, runValidators: true })

    invalidateCache(`clinic:${id}`)
    invalidateCache("clinics:*")
    res.status(200).json({ message: "Clinic delete successfully" })
})

// Update clinic status
export const updateClinicStatus = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { status } = req.body
    const { id } = req.params

    const clinic = await Clinic.findById(id)

    if (!clinic) {
        return res.status(400).json({ message: "Clinic not found" })
    }

    await Clinic.findByIdAndUpdate(id, { status })

    invalidateCache(`clinic:${id}`)
    invalidateCache("clinics:*")
    res.status(200).json({ message: "Clinic status update successfully" })
})

// Register Clinic
export const registerClinic = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { name, plan }: IClinic = req.body

    let amount
    let startDate = new Date()
    let endDate = new Date()
    if (plan === "monthly") {
        amount = 1000
        endDate.setDate(endDate.getDate() + 30)
    } else if (plan === "yearly") {
        amount = 10000
        endDate.setDate(endDate.getDate() + 365)
    }

    let logo = ""
    if (req.file) {
        const { secure_url } = await cloudinary.uploader.upload(req.file.path)
        logo = secure_url
    }

    const data = { ...req.body, amount, startDate: startDate.toString(), endDate: endDate.toString(), logo }

    const { isError, error } = customValidator(data, createClinicRules)

    if (isError) {
        return res.status(422).json({ message: "Validation error", error })
    }

    const clinic = await Clinic.findOne({ name }).lean()

    if (clinic) {
        return res.status(400).json({ message: `Clinic with name ${name} already exist` })
    }

    const result = await Clinic.create(data)

    invalidateCache("clinics:*")
    res.status(200).json({ message: "Clinic create successfully", result })
})