import { createApi } from "@reduxjs/toolkit/query/react"
import { createCustomBaseQuery } from "./customBaseQuery.api";

export interface IClinicDashboard {
    income: {
        totalAmount?: number
        month?: number
        year?: number
    },
    patients: {
        newPatients?: number
        oldPatients?: number
        month?: number
        year?: number
    },
}

export interface IClinicRevenue {
    totalRevenue: number
    revenuePerClinic: {
        _id: string,
        name: string,
        revenue: number
    }[]
    monthlyTrends: {
        _id: string,
        total: number
    }[]
}

export interface IMonthlyTrends {
    clinic: string
    month: string
    totalRevenue: number
}

export interface IIncome {
    year: number
    month: number
    totalAmount: number
}

export interface IDashboard {
    clinics: {
        total: number
        active: number
        inactive: number
    }
    users: {
        total: number
        active: number
        inactive: number
    }
    revenue: IClinicRevenue
    monthlyTrends: IMonthlyTrends[]
    income: IIncome[]
}

const baseUrl = `${import.meta.env.VITE_BACKEND_URL}/api/v1/admin`
const customBaseQuery = createCustomBaseQuery(baseUrl)

export const dashBoardApi = createApi({
    reducerPath: "dashBoardApi",
    baseQuery: customBaseQuery,
    tagTypes: ["dashboard"],
    endpoints: (builder) => {
        return {
            getClinicAdminDashboardData: builder.query<IClinicDashboard, { selectedYear: number, selectedClinicId?: string }>({
                query: (queryParams) => {
                    return {
                        url: "/clinic-dashboard",
                        method: "GET",
                        params: queryParams
                    }
                },
                transformResponse: (data: { result: IClinicDashboard }) => {
                    return data.result
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                },
                providesTags: ["dashboard"]
            }),

            getDashBoardData: builder.query<IDashboard, { selectedYear: number }>({
                query: (queryParams) => {
                    return {
                        url: "/dashboard",
                        method: "GET",
                        params: queryParams
                    }
                },
                transformResponse: (data: { result: IDashboard }) => {
                    return data.result
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                },
                providesTags: ["dashboard"]
            }),
        }
    }
})

export const {
    useGetClinicAdminDashboardDataQuery,
    useGetDashBoardDataQuery
} = dashBoardApi
