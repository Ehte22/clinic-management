import { createApi } from "@reduxjs/toolkit/query/react"
import { createCustomBaseQuery } from "./customBaseQuery.api"
import { IPagination } from "../../models/pagination.interface"
import { IClinic } from "../../models/clinic.interface"

const baseUrl = `${import.meta.env.VITE_BACKEND_URL}/api/v1/clinic`
const customBaseQuery = createCustomBaseQuery(baseUrl)

export const clinicApi = createApi({
    reducerPath: "clinicApi",
    baseQuery: customBaseQuery,
    tagTypes: ["clinic"],
    endpoints: (builder) => {
        return {
            getClinics: builder.query<{ result: IClinic[], pagination: IPagination }, Partial<{ page: number, limit: number, searchQuery: string, isFetchAll: boolean, selectedUser: string }>>({
                query: (queryParams = {}) => {
                    return {
                        url: "/",
                        method: "GET",
                        params: queryParams
                    }
                },
                transformResponse: (data: { result: IClinic[], pagination: IPagination }) => {
                    return data
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                },
                providesTags: ["clinic"]
            }),

            getClinicById: builder.query<IClinic, string>({
                query: (id) => {
                    return {
                        url: `/${id}`,
                        method: "GET"
                    }
                },
                transformResponse: (data: { result: IClinic }) => {
                    return data.result
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                },
                providesTags: ["clinic"]
            }),

            addClinic: builder.mutation<{ message: string, result: IClinic }, FormData>({
                query: clinicData => {
                    return {
                        url: "/add",
                        method: "POST",
                        body: clinicData
                    }
                },
                transformResponse: (data: { message: string, result: IClinic }) => {
                    return data
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                },
                invalidatesTags: ["clinic"]
            }),

            updateClinic: builder.mutation<string, { id: string, clinicData: FormData }>({
                query: ({ id, clinicData }) => {
                    return {
                        url: `/update/${id}`,
                        method: "PUT",
                        body: clinicData
                    }
                },
                transformResponse: (data: { message: string }) => {
                    return data.message
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                },
                invalidatesTags: ["clinic"]
            }),

            updateClinicStatus: builder.mutation<string, { id: string, status: string }>({
                query: ({ id, status }) => {
                    return {
                        url: `/status/${id}`,
                        method: "PUT",
                        body: { status }
                    }
                },
                transformResponse: (data: { message: string }) => {
                    return data.message
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                },
                invalidatesTags: ["clinic"]
            }),

            deleteClinic: builder.mutation<string, string>({
                query: (id) => {
                    return {
                        url: `/delete/${id}`,
                        method: "PUT",
                    }
                },
                transformResponse: (data: { message: string }) => {
                    return data.message
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                },
                invalidatesTags: ["clinic"]
            }),

        }
    }
})

export const {
    useGetClinicsQuery,
    useGetClinicByIdQuery,
    useAddClinicMutation,
    useUpdateClinicMutation,
    useUpdateClinicStatusMutation,
    useDeleteClinicMutation
} = clinicApi
