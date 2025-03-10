import { Request, Response } from "express";
import asyncHandler from "express-async-handler"
import { IUserProtected } from "../utils/protected";
import { Patient } from "../models/Patient";
import mongoose from "mongoose";
import { Appointment } from "../models/Appointment";
import { Clinic } from "../models/Clinic";
import { User } from "../models/User";
import { Invoice } from "../models/Invoice";

export const clinicAdminDashboard = asyncHandler(async (req: Request, res: Response) => {
    const { clinicId, role } = req.user as IUserProtected
    const { selectedYear, selectedClinicId = "" } = req.query

    const year = parseInt(selectedYear as string);

    const clinic = role === "Super Admin"
        ? selectedClinicId && new mongoose.Types.ObjectId(selectedClinicId as string)
        : new mongoose.Types.ObjectId(clinicId)

    const patients = await Patient.aggregate([
        {
            $match: {
                clinic,
                isDeleted: { $eq: false },
                createdAt: {
                    $gte: new Date(`${year}-01-01T00:00:00Z`),
                    $lte: new Date(`${year}-12-31T23:59:59Z`),
                }
            },
        },

        {
            $addFields: {
                visitMonth: { $month: "$createdAt" },
                visitYear: { $year: "$createdAt" },
            },
        },

        {
            $group: {
                _id: {
                    contactInfo: "$contactInfo",
                    year: "$visitYear",
                    month: "$visitMonth",
                },
                firstVisitDate: { $min: "$createdAt" },
            },
        },

        {
            $lookup: {
                from: "patients",
                localField: "_id.contactInfo",
                foreignField: "contactInfo",
                as: "patientDetails",
            },
        },

        {
            $unwind: "$patientDetails",
        },

        {
            $addFields: {
                isNewPatient: {
                    $cond: [
                        { $eq: ["$patientDetails.createdAt", "$firstVisitDate"] },
                        true,
                        false,
                    ],
                },
            },
        },

        {
            $group: {
                _id: { year: "$_id.year", month: "$_id.month" },
                newPatients: {
                    $sum: { $cond: [{ $eq: ["$isNewPatient", true] }, 1, 0] },
                },
                oldPatients: {
                    $sum: { $cond: [{ $eq: ["$isNewPatient", false] }, 1, 0] },
                },
            },
        },

        {
            $sort: { "_id.year": 1, "_id.month": 1 },
        },

        {
            $project: {
                year: "$_id.year",
                month: "$_id.month",
                newPatients: 1,
                oldPatients: 1,
                _id: 0,
            },
        },
    ]);

    const appointments = await Appointment.aggregate([
        {
            $match: {
                clinic,
                isDeleted: false,
                date: {
                    $gte: new Date(`${year}-01-01T00:00:00Z`),
                    $lte: new Date(`${year}-12-31T23:59:59Z`),
                }
            },
        },
        {
            $addFields: {
                month: { $month: "$date" },
                year: { $year: "$date" }
            },
        },
        {
            $group: {
                _id: { month: "$month", year: "$year" },
                totalAmount: { $sum: "$payment.amount" }
            }
        },
        {
            $sort: { "_id.year": 1, "_id.month": 1 }
        },
        {
            $project: {
                year: "$_id.year",
                month: "$_id.month",
                totalAmount: 1,
                _id: 0
            }
        }
    ])

    const income = Array.from({ length: 12 }, (_, i) => ({
        year,
        month: i + 1,
        totalAmount: 0
    }));

    appointments.forEach(appointment => {
        const monthData = income.find(m => m.month === appointment.month);
        if (monthData) {
            monthData.totalAmount = appointment.totalAmount;
        }
    });

    res.status(200).json({ message: "Clinic dashboard data fetch successfully", result: { income, patients } })
})

export const dashboard = asyncHandler(async (req: Request, res: Response) => {
    const { selectedYear } = req.query

    const year = parseInt(selectedYear as string);

    const clinicCounts = await Clinic.aggregate([
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 }
            }
        },
        {
            $group: {
                _id: null,
                total: { $sum: "$count" },
                data: { $push: { k: "$_id", v: "$count" } }
            }
        },
        {
            $project: {
                _id: 0,
                total: 1,
                result: { $arrayToObject: "$data" }
            }
        },
        {
            $replaceRoot: { newRoot: { $mergeObjects: ["$result", { total: "$total" }] } }
        }
    ]);

    const userCounts = await User.aggregate([
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 }
            }
        },
        {
            $group: {
                _id: null,
                total: { $sum: "$count" },
                data: { $push: { k: "$_id", v: "$count" } }
            }
        },
        {
            $project: {
                _id: 0,
                total: 1,
                result: { $arrayToObject: "$data" }
            }
        },
        {
            $replaceRoot: { newRoot: { $mergeObjects: ["$result", { total: "$total" }] } }
        }
    ]);

    const revenueStats = await Clinic.aggregate([
        {
            $lookup: {
                from: "invoices",
                localField: "_id",
                foreignField: "clinic",
                pipeline: [
                    { $match: { paymentStatus: "paid" } },
                    {
                        $group: {
                            _id: {
                                clinic: "$clinic",
                                month: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }
                            },
                            totalRevenue: { $sum: "$totalAmount" }
                        }
                    }
                ],
                as: "monthlyRevenueData"
            }
        },
        {
            $lookup: {
                from: "invoices",
                localField: "_id",
                foreignField: "clinic",
                pipeline: [
                    { $match: { paymentStatus: "paid" } },
                    {
                        $group: {
                            _id: "$clinic",
                            totalRevenue: { $sum: "$totalAmount" }
                        }
                    }
                ],
                as: "revenueData"
            }
        },
        {
            $unwind: { path: "$revenueData", preserveNullAndEmptyArrays: true }
        },
        {
            $facet: {
                totalRevenue: [
                    {
                        $group: {
                            _id: null,
                            total: { $sum: { $ifNull: ["$revenueData.totalRevenue", 0] } }
                        }
                    },
                    { $project: { _id: 0, total: 1 } }
                ],
                revenuePerClinic: [
                    {
                        $project: {
                            _id: "$_id",
                            name: "$name",
                            revenue: { $ifNull: ["$revenueData.totalRevenue", 0] }
                        }
                    }
                ],
                monthlyTrends: [
                    { $unwind: { path: "$monthlyRevenueData", preserveNullAndEmptyArrays: true } },
                    {
                        $match: {
                            "monthlyRevenueData._id.month": { $ne: null }  // Exclude null values
                        }
                    },
                    {
                        $group: {
                            _id: "$monthlyRevenueData._id.month",
                            total: { $sum: "$monthlyRevenueData.totalRevenue" }
                        }
                    },
                    { $sort: { _id: 1 } }
                ]

            }
        }
    ]);

    const monthlyTrends = await Clinic.aggregate([
        {
            $lookup: {
                from: "invoices",
                let: { clinicId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            paymentStatus: "paid",
                            $expr: { $eq: ["$clinic", "$$clinicId"] }
                        }
                    },
                    {
                        $group: {
                            _id: {
                                clinic: "$clinic",
                                year: { $year: { date: "$createdAt", timezone: "UTC" } }, // Extract year in UTC
                                month: { $month: { date: "$createdAt", timezone: "UTC" } } // Extract month in UTC
                            },
                            totalRevenue: { $sum: "$totalAmount" }
                        }
                    }
                ],
                as: "monthlyRevenueData"
            }
        },

        { $unwind: { path: "$monthlyRevenueData", preserveNullAndEmptyArrays: true } },

        {
            $match: {
                "monthlyRevenueData._id.year": year,
            }
        },

        {
            $project: {
                _id: 0,
                clinic: "$name",
                year: "$monthlyRevenueData._id.year",
                month: "$monthlyRevenueData._id.month",
                totalRevenue: { $ifNull: ["$monthlyRevenueData.totalRevenue", 0] }
            }
        },

        { $sort: { year: 1, month: 1 } }
    ]);

    const monthlyIncome = await Clinic.aggregate([
        {
            $match: {
                status: "active",
                deletedAt: null,
                startDate: {
                    $gte: new Date(`${year}-01-01T00:00:00Z`),
                    $lte: new Date(`${year}-12-31T23:59:59Z`),
                }
            }
        },
        {
            $addFields: {
                month: { $month: "$startDate" },
                year: { $year: "$startDate" }
            },
        },
        {
            $group: {
                _id: {
                    year: { $year: "$startDate" },
                    month: { $month: "$startDate" }
                },
                totalAmount: { $sum: "$amount" },
            }
        },
        {
            $sort: { "_id.year": 1, "_id.month": 1 }
        },
        {
            $project: {
                year: "$_id.year",
                month: "$_id.month",
                totalAmount: 1,
                _id: 0
            }
        }
    ]);

    const income = Array.from({ length: 12 }, (_, i) => ({
        year: year,
        month: i + 1,
        totalAmount: 0
    }));

    monthlyIncome.forEach(item => {
        const monthData = income.find(m => m.month === item.month);
        if (monthData) {
            monthData.totalAmount = item.totalAmount;
        }
    });

    const formattedRevenue = revenueStats[0];

    formattedRevenue.totalRevenue = formattedRevenue.totalRevenue.length
        ? formattedRevenue.totalRevenue[0].total
        : 0

    const result = {
        income,
        clinics: clinicCounts.length > 0 ? clinicCounts[0] : { active: 0, inactive: 0 },
        users: userCounts.length > 0 ? userCounts[0] : { active: 0, inactive: 0 },
        revenue: formattedRevenue,
        monthlyTrends: monthlyTrends,
    }

    res.status(200).json({
        message: "Dashboard data fetch successfully",
        result
    });
});

