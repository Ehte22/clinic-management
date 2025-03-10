import { createApi } from "@reduxjs/toolkit/query/react"
import { ISupplier } from "../../models/supplier.interface"
import { createCustomBaseQuery } from "./customBaseQuery.api"

const baseUrl = `${import.meta.env.VITE_BACKEND_URL}/api/v1/supplier`
const customBaseQuery = createCustomBaseQuery(baseUrl)

export const supplierApi = createApi({
    reducerPath: "supplierApi",
    baseQuery: customBaseQuery,
    tagTypes: ["supplier"],
    endpoints: (builder) => {
        return {
            getSuppliers: builder.query<{ result: ISupplier[], totalPages: number }, Partial<{ page: number, limit: number, searchQuery: string, isFetchAll: boolean, selectedClinicId: string }>>({
                query: (queryParams = {}) => {
                    return {
                        url: "/",
                        method: "GET",
                        params: queryParams
                    }
                },
                transformResponse: (data: { result: ISupplier[], totalPages: number }) => {
                    return data
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                },
                providesTags: ["supplier"]
            }),

            getSupplierById: builder.query<ISupplier, string>({
                query: (id) => {
                    return {
                        url: `/get-supplier/${id}`,
                        method: "GET"
                    }
                },
                transformResponse: (data: { result: ISupplier }) => {
                    return data.result
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                },
                providesTags: ["supplier"]
            }),

            addSupplier: builder.mutation<{ message: string, result: ISupplier }, ISupplier>({
                query: supplierData => {
                    return {
                        url: "/create-supplier",
                        method: "POST",
                        body: supplierData
                    }
                },
                transformResponse: (data: { message: string, result: ISupplier }) => {
                    return data
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                },
                invalidatesTags: ["supplier"]
            }),

            updateSupplier: builder.mutation<string, { supplierData: ISupplier, id: string }>({
                query: ({ supplierData, id }) => {
                    return {
                        url: `/update-supplier/${id}`,
                        method: "PUT",
                        body: supplierData
                    }
                },
                transformResponse: (data: { message: string }) => {
                    return data.message
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                },
                invalidatesTags: ["supplier"]
            }),

            deleteSupplier: builder.mutation<string, string>({
                query: (id) => {
                    return {
                        url: `/delete-supplier/${id}`,
                        method: "PUT",
                    }
                },
                transformResponse: (data: { message: string }) => {
                    return data.message
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                },
                invalidatesTags: ["supplier"]
            }),

        }
    }
})

export const {
    useGetSuppliersQuery,
    useGetSupplierByIdQuery,
    useAddSupplierMutation,
    useUpdateSupplierMutation,
    useDeleteSupplierMutation
} = supplierApi
