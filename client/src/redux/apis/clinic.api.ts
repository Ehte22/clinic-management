import { createApi } from "@reduxjs/toolkit/query/react"
import { IClinic } from "../../models/clinic.interface"
import { createCustomBaseQuery } from "./customBaseQuery.api"

const baseUrl = `${import.meta.env.VITE_BACKEND_URL}/api/v1/clinic`
const customBaseQuery = createCustomBaseQuery(baseUrl)

export const clinicApi = createApi({
    reducerPath: "clinicApi",
    baseQuery: customBaseQuery,
    tagTypes: ["clinic"],
    endpoints: (builder) => {
        return {
            getClinics: builder.query<{ result: IClinic[], totalPages: number }, Partial<{ page: number, limit: number, searchQuery: string, isFetchAll: boolean }>>({
                query: (queryParams = {}) => {
                    return {
                        url: "/",
                        method: "GET",
                        params: queryParams
                    }
                },
                transformResponse: (data: { result: IClinic[], totalPages: number }) => {
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
                        url: `/get-clinic/${id}`,
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

            createClinic: builder.mutation<{ message: string, result: IClinic }, FormData>({
                query: clinicData => {
                    return {
                        url: "/create-clinic",
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

            updateClinic: builder.mutation<string, { clinicData: FormData, id: string }>({
                query: ({ clinicData, id }) => {
                    return {
                        url: `/update-clinic/${id}`,
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

            updateClinicStatus: builder.mutation<string, { status: string, id: string }>({
                query: (statusData) => {
                    return {
                        url: `/update-status/${statusData.id}`,
                        method: "PUT",
                        body: statusData
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
                        url: `/delete-clinic/${id}`,
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
    useCreateClinicMutation,
    useUpdateClinicMutation,
    useUpdateClinicStatusMutation,
    useDeleteClinicMutation
} = clinicApi
