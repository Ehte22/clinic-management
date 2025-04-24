import { createApi } from "@reduxjs/toolkit/query/react"
import { createCustomBaseQuery } from "./customBaseQuery.api"
import { IPagination } from "../../models/pagination.interface"
import { IMedicine } from "../../models/medicine.interface"

const baseUrl = `${import.meta.env.VITE_BACKEND_URL}/api/v1/medicine`
const customBaseQuery = createCustomBaseQuery(baseUrl)

export const medicineApi = createApi({
  reducerPath: "medicineApi",
  baseQuery: customBaseQuery,
  tagTypes: ["medicine"],
  endpoints: (builder) => {
    return {
      getMedicines: builder.query<{ result: IMedicine[], pagination: IPagination }, Partial<{ page: number, limit: number, searchQuery: string, isFetchAll: boolean, selectedClinic: string }>>({
        query: (queryParams = {}) => {
          return {
            url: "/",
            method: "GET",
            params: queryParams
          }
        },
        transformResponse: (data: { result: IMedicine[], pagination: IPagination }) => {
          return data
        },
        transformErrorResponse: (error: { status: number, data: { message: string } }) => {
          return error.data?.message
        },
        providesTags: ["medicine"]
      }),

      getMedicineById: builder.query<IMedicine, string>({
        query: (id) => {
          return {
            url: `/${id}`,
            method: "GET"
          }
        },
        transformResponse: (data: { result: IMedicine }) => {
          return data.result
        },
        transformErrorResponse: (error: { status: number, data: { message: string } }) => {
          return error.data?.message
        },
        providesTags: ["medicine"]
      }),

      addMedicine: builder.mutation<{ message: string, result: IMedicine }, IMedicine>({
        query: medicineData => {
          return {
            url: "/add",
            method: "POST",
            body: medicineData
          }
        },
        transformResponse: (data: { message: string, result: IMedicine }) => {
          return data
        },
        transformErrorResponse: (error: { status: number, data: { message: string } }) => {
          return error.data?.message
        },
        invalidatesTags: ["medicine"]
      }),

      updateMedicine: builder.mutation<string, { id: string, medicineData: IMedicine }>({
        query: ({ id, medicineData }) => {
          return {
            url: `/update/${id}`,
            method: "PUT",
            body: medicineData
          }
        },
        transformResponse: (data: { message: string }) => {
          return data.message
        },
        transformErrorResponse: (error: { status: number, data: { message: string } }) => {
          return error.data?.message
        },
        invalidatesTags: ["medicine"]
      }),

      updateMedicineStatus: builder.mutation<string, { id: string, status: string }>({
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
        invalidatesTags: ["medicine"]
      }),

      deleteMedicine: builder.mutation<string, string>({
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
        invalidatesTags: ["medicine"]
      }),

    }
  }
})

export const {
  useGetMedicinesQuery,
  useGetMedicineByIdQuery,
  useAddMedicineMutation,
  useUpdateMedicineMutation,
  useUpdateMedicineStatusMutation,
  useDeleteMedicineMutation
} = medicineApi
