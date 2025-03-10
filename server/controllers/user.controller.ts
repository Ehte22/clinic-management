import { NextFunction, Request, Response } from "express"
import asyncHandler from "express-async-handler"
import { IUser, User } from "../models/User"
import { generatePassword } from "../utils/generatePassword"
import { registerRules } from "../rules/auth.rules"
import { customValidator } from "../utils/validator"
import bcryptjs from "bcryptjs"
import { sendEmail } from "../utils/email"
import cloudinary from "../utils/uploadConfig"
import { IUserProtected } from "../utils/protected"
import { welcomeTemplate } from "../templates/welcomeTemplate"
import { Doctor } from "../models/Doctor"
import redisClient from "../services/redisClient"
import { invalidateCache } from "../utils/redisMiddleware"
import { Clinic } from "../models/Clinic"

// Get All Users
export const getAllUsers = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { page = 1, limit = 10, searchQuery = "", isFetchAll = false, selectedClinicId = "" } = req.query

    const sortedQuery = JSON.stringify(Object.fromEntries(Object.entries(req.query).sort()))
    const cacheKey = `users:${sortedQuery}`
    const cachedData = await redisClient.get(cacheKey)

    if (cachedData) {
        return res.status(200).json(JSON.parse(cachedData))
    }

    const currentPage = parseInt(page as string)
    const pageLimit = parseInt(limit as string)
    const skip: number = (currentPage - 1) * pageLimit

    const query: any = {
        role: { $ne: "Super Admin" },
    }

    if (searchQuery) {
        query.$or = [
            { firstName: { $regex: searchQuery, $options: "i" } },
            { lastName: { $regex: searchQuery, $options: "i" } },
            { email: { $regex: searchQuery, $options: "i" } }
        ]
    }

    if (selectedClinicId) {
        query.clinicId = selectedClinicId
    }

    const totalUsers = await User.countDocuments(query)
    const totalPages = Math.ceil(totalUsers / pageLimit)

    let result = []
    if (isFetchAll) {
        result = await User.find().select("-password -__v").lean()
    } else {
        result = await User.find(query).select("-password -__v").skip(skip).limit(pageLimit).lean()
    }

    await redisClient.setex(
        cacheKey,
        3600,
        JSON.stringify({ message: "Users Fetch successfully", result, totalPages, totalUsers })
    )
    res.status(200).json({ message: "Users Fetch successfully", result, totalPages, totalUsers })
})

// Get Clinic By Id
export const getUserById = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params

    const cacheKey = `user:${id}`
    const cacheData = await redisClient.get(cacheKey)

    if (cacheData) {
        return res.status(200).json(JSON.parse(cacheData))
    }

    const result = await User.findById(id).select("-password -__v").lean()

    if (!result) {
        return res.status(404).json({ message: `User with ID: ${id} not found` })
    }

    await redisClient.setex(cacheKey, 3600, JSON.stringify({ message: "User fetch successfully", result }))
    res.status(200).json({ message: "User fetch successfully", result })
})

// Create User
export const createUser = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { clinicId, firstName, lastName, email, phone, role, password }: IUser = req.body

    const user = await User.findOne({ $or: [{ email }, { phone }] })

    if (user) {
        if (user.email == email) {
            return res.status(409).json({ message: "Email already exist" })
        }
        if (user.phone == phone) {
            return res.status(409).json({ message: "Phone number already exist" })
        }
    }

    let profile = ""
    if (req.file) {
        const { secure_url } = await cloudinary.uploader.upload(req.file.path)
        profile = secure_url
    }

    if (role === "Clinic Admin" || role === "Doctor" || role === "Receptionist") {
        const generatedPassword = generatePassword(12)

        const x = req.user as IUserProtected

        let data

        role === "Receptionist"
            ? data = { ...req.body, clinicId: x.clinicId, password: generatedPassword, profile }
            : data = { ...req.body, password: generatedPassword, profile }

        const { isError, error } = customValidator(data, registerRules)

        if (isError) {
            return res.status(422).json({ message: "Validation errors", error });
        }
        const hashPassword = await bcryptjs.hash(generatedPassword, 10)

        const result = await User.create({ ...data, password: hashPassword })

        if (result && result.role === "Clinic Admin") {
            await Doctor.create({ clinic: clinicId, doctor: result._id })
        }

        const welcomeTemp = welcomeTemplate({ firstName, lastName, email, password: generatedPassword })

        await sendEmail({
            to: email,
            subject: "Welcome to Our Service",
            text: welcomeTemp
        });

        invalidateCache("users:*")
        invalidateCache("doctors:*")
        invalidateCache("receptionists:*")
        return res.status(200).json({ message: "User registered and email sent successfully", result })
    }

    const { isError, error } = customValidator({ ...req.body, profile }, registerRules)

    if (isError) {
        return res.status(422).json({ message: "Validation errors", error });
    }

    const hashPassword = await bcryptjs.hash(password, 10)

    const result = await User.create({
        firstName,
        lastName,
        email,
        phone,
        password: hashPassword,
        role,
        profile
    })

    invalidateCache("users:*")
    invalidateCache("doctors:*")
    invalidateCache("receptionists:*")
    return res.status(200).json({ message: "User registered and email sent successfully", result })
})

// Update User
export const updateUser = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params

    const user = await User.findById(id)

    let profile
    if (req.file) {
        const publicId = user?.profile?.split("/").pop()?.split(".")[0]
        publicId && await cloudinary.uploader.destroy(publicId)

        const { secure_url } = await cloudinary.uploader.upload(req.file.path)
        profile = secure_url
    }

    if (!user) {
        return res.status(404).json({ message: "User not found" })
    }

    await User.findByIdAndUpdate(id, { ...req.body, profile }, { new: true, runValidators: true })

    invalidateCache(`user:${id}`)
    invalidateCache("users:*")
    invalidateCache("doctors:*")
    invalidateCache("receptionists:*")
    res.status(200).json({ message: "User update successfully" })
})

// Update User Status
export const updateUserStatus = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { status } = req.body
    const { id } = req.params

    const user = await User.findById(id)

    if (!user) {
        return res.status(404).json({ message: "User not found" })
    }

    await User.findByIdAndUpdate(id, { status }, { new: true, runValidators: true })

    invalidateCache(`user:${id}`)
    invalidateCache("users:*")
    invalidateCache("doctors:*")
    invalidateCache("receptionists:*")
    res.status(200).json({ message: "User status update successfully" })
})

// Delete User
export const deleteUser = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params

    const user = await User.findById(id)

    if (!user) {
        return res.status(400).json({ message: "User not found" })
    }

    await User.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true, runValidators: true })

    invalidateCache(`user:${id}`)
    invalidateCache("users:*")
    invalidateCache("doctors:*")
    invalidateCache("receptionists:*")
    res.status(200).json({ message: "User delete successfully" })
})

// Register User
export const registerUser = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { clinicId, firstName, lastName, email, phone, password }: IUser = req.body

    const clinic = await Clinic.findById(clinicId)

    if (!clinic) {
        return res.status(404).json({ message: "Clinic not found" })
    }

    const user = await User.findOne({ $or: [{ email }, { phone }] })

    if (user) {
        if (user.email == email) {
            return res.status(409).json({ message: "Email already exist" })
        }
        if (user.phone == phone) {
            return res.status(409).json({ message: "Phone number already exist" })
        }
    }

    let profile = ""
    if (req.file) {
        const { secure_url } = await cloudinary.uploader.upload(req.file.path)
        profile = secure_url
    }

    const { isError, error } = customValidator({ ...req.body, profile, role: "Clinic Admin" }, registerRules)

    if (isError) {
        return res.status(422).json({ message: "Validation errors", error });
    }

    const hashPassword = await bcryptjs.hash(password, 10)

    const result = await User.create({
        firstName,
        lastName,
        email,
        phone,
        password: hashPassword,
        role: "Clinic Admin",
        profile,
        clinicId
    })


    if (result && result.role === "Clinic Admin") {
        await Doctor.create({ clinic: clinicId, doctor: result._id })
    }

    const welcomeTemp = welcomeTemplate({ firstName, lastName, email, password })

    await sendEmail({
        to: email,
        subject: "Welcome to Our Service",
        text: welcomeTemp
    });

    invalidateCache("users:*")
    invalidateCache("doctors:*")
    invalidateCache("receptionists:*")
    return res.status(200).json({ message: "User registered and email sent successfully", result })
})

