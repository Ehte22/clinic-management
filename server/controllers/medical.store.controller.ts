import { Request, Response } from "express"
import asyncHandler from "express-async-handler"
import { customValidator, validationRulesSchema } from "../utils/validator"
import Medicine from "../models/Medicine"
import redisClient from "../services/redisClient"
import { IUserProtected } from "../utils/protected"
import BuyedMedicine from "../models/SellMedicine"
import { invalidateCache } from "../utils/redisMiddleware"


export const addMedicine = asyncHandler(async (req: Request, res: Response): Promise<any> => {

    const { clinicId } = req.user as IUserProtected
    const data = { ...req.body, clinic: clinicId }

    const { isError, error } = customValidator(data, {
        clinic: { required: true },
        medicineName: { required: true, },
        mg: { required: true, },
        category: { required: true, },
        label: { required: false, },
        medicineType: { required: true, },
        price: { required: true, },
        stock: { required: true, },
        // quantity: { required: true, },
        expiryDate: { required: true, },

    })

    if (isError) {
        return res.status(532).json({ message: "Validation Error", error })
    }


    await Medicine.create(data)

    invalidateCache("medicines:*")
    res.json({ message: "medicine Created Successfully" })
})

export const getMedicines = asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const { filter, page, limit, isFetchAll, selectedClinicId }: any = req.query;

    const sortedQuery = JSON.stringify(Object.fromEntries(Object.entries(req.query).sort()))
    const cacheKey = `medicines:${sortedQuery}`
    const cachedData = await redisClient.get(cacheKey)

    if (cachedData) {
        return res.status(200).json(JSON.parse(cachedData))
    }

    const pageMain = parseInt(page) || 1;
    const limitMain = parseInt(limit) || 10;
    const skip = (pageMain - 1) * limitMain;
    const filterMain = filter || '';


    const { clinicId, role } = req.user as IUserProtected

    let query: any = {
        isDeleted: false,
        ...(filterMain && { medicineName: { $regex: filterMain, $options: "i" } })
    }

    if (role !== "Super Admin") {
        query.clinic = clinicId;
    } else {
        if (selectedClinicId) {
            query.clinic = selectedClinicId;
        }
    }

    const totalMedicines = await Medicine.countDocuments(query);

    let result = []
    if (isFetchAll) {
        result = await Medicine.find({ clinic: clinicId })
    } else {
        result = await Medicine.find(query).skip(skip).limit(limitMain);
    }

    await redisClient.setex(
        cacheKey,
        3600,
        JSON.stringify({
            message: "All Medicines Fetch Success",
            result,
            pagination: {
                total: totalMedicines,
                page: Number(pageMain),
                limit: Number(limit),
                totalPages: Math.ceil(totalMedicines / limit),
            },
        })
    )

    res.json({
        message: "All Medicines Fetch Success",
        result,
        pagination: {
            total: totalMedicines,
            page: Number(pageMain),
            limit: Number(limit),
            totalPages: Math.ceil(totalMedicines / limit),
        },
    });

});

export const deleteMedicine = asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const { mId } = req.params
    if (!mId) {
        return res.status(532).json({ message: "Id Required" })
    }

    await Medicine.findByIdAndUpdate(mId, { isDelete: true })

    invalidateCache(`medicine:${mId}`)
    invalidateCache("medicines:*")
    res.json({ message: "Medicine Deleted Successfully" })
})

export const medicineGetById = asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const { mId } = req.params

    const cacheKey = `medicine:${mId}`
    const cachedData = await redisClient.get(cacheKey)

    if (cachedData) {
        return res.status(200).json(JSON.parse(cachedData))
    }

    if (!mId) {
        return res.status(532).json({ message: "Id Required" })
    }

    const result = await Medicine.findOne({ _id: mId })

    await redisClient.setex(
        cacheKey,
        3600,
        JSON.stringify({ message: "Medicine Fetch Successfully", result })
    )
    res.json({ message: "Medicine  Fetch Successfully", result })
})

export const updateMedicine = asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const { mId } = req.params
    if (!mId) {
        return res.status(500).json({ message: "Medicine Id Is Not Provided" })
    }

    await Medicine.findByIdAndUpdate(mId, req.body)

    invalidateCache(`medicine:${mId}`)
    invalidateCache("medicines:*")
    res.json({ message: "medicione Update Success" })
})

export const sellMultipleMedicines = asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const { medicines, pId } = req.body;


    const rules: validationRulesSchema = {
        medicines: [
            {
                mId: { required: true },
                qty: { required: true },
            }
        ],

    }
    const { isError, error } = customValidator(req.body, rules)
    if (isError) {
        return res.status(532).json({ message: "Validation Error", error })
    }

    const purchaseDetails: any[] = [];
    let total = 0;
    const errors: any[] = [];

    for (const { mId, qty } of medicines) {


        const medicine = await Medicine.findById(mId);

        if (!medicine) {
            return res.status(533).json({ message: "Medicine not found" })

        }

        if (medicine.stock < qty) {
            return res.status(512).json({ message: "Medicine Is Out Of Stock :", medicine })
        }

        medicine.stock -= qty;
        await medicine.save();

        const price = medicine.price * qty;
        purchaseDetails.push({
            _id: medicine._id,
            mId: medicine._id,
            price: medicine.price,
            qty,
        });

        total += price;
    }

    if (purchaseDetails.length === 0) {
        return res.status(400).json({ message: "No purchases were successful.", errors });
    }

    const purchaseRecord = await BuyedMedicine.create({
        patient: pId,
        medicines: purchaseDetails,
        total,

    });

    invalidateCache(`medicine:${pId}`)
    invalidateCache("medicines:*")
    res.json({
        message: "Purchase completed successfully.",
        result: purchaseRecord,

    });
});
