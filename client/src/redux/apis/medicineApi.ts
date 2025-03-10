import { createApi } from "@reduxjs/toolkit/query/react";
import { createCustomBaseQuery } from "./customBaseQuery.api";

export interface Medicine {
  _id?: string;
  medicineName: string;
  // manufacturer: string;
  expiryDate: string;
  stock: number;
  // batchNumber: string;
  mg: number;
  price: number;
  // discount: number;
  supplier: string;
  // purchasedPrice: number;
  quantity: number;
  category: string;
  label: string;
  clinicId: string;
  medicineType: string;
}


export interface GETDATA {
  result: Medicine[];
  message: string;
  pagination: {
    total: number,
    page: number,
    limit: number,
    totalPages: number
  }
}
export interface GETDATA2 {
  result: Medicine;
  message: string;

}
export interface ISellMed {
  pId: any,
  medicines: {
    mId: string,
    qty: number
  }

}

const baseUrl = `${import.meta.env.VITE_BACKEND_URL}/api/v1/medicine`
const customBaseQuery = createCustomBaseQuery(baseUrl)

export const medicineApi = createApi({
  reducerPath: "medicineApi",
  baseQuery: customBaseQuery,
  tagTypes: ["Medicine"],
  endpoints: (builder) => ({

    getAllMedicines: builder.query<GETDATA, Partial<{ page: number, limit: number, filter: string, isFetchAll: boolean, selectedClinicId: string }>>({
      query: (queryParams = {}) => ({
        url: "/get-medicine",
        method: "GET",
        params: queryParams
      }),
      transformResponse: (data: GETDATA) => {
        return data
      },
      providesTags: ["Medicine"],
    }),
    getSingleMedicine: builder.query<Medicine, string>({
      query: (id) => ({
        url: `/get-single-medicine/${id}`,
        method: "GET",

      }),
      transformResponse: (data: GETDATA2) => {
        return data.result
      },
      providesTags: ["Medicine"],
    }),
    addMedicine: builder.mutation<void, Medicine>({
      query: (invoiceData) => ({
        url: "/add-medicine",
        method: "POST",
        body: invoiceData,
      }),
      invalidatesTags: ["Medicine"],
    }),
    deleteMedicine: builder.mutation<void, { id: string }>({
      query: (id) => ({
        url: `/delete-medicine/${id}`,
        method: "DELETE",

      }),
      invalidatesTags: ["Medicine"],
    }),
    updateMedicine: builder.mutation<void, Medicine>({
      query: (data) => ({
        url: `/update-medicine/${data._id}`,
        method: "PUT",
        body: data

      }),
      invalidatesTags: ["Medicine"],
    }),
    sellMedicine: builder.mutation<void, ISellMed>({
      query: (data) => ({
        url: `/sell-medicine`,
        method: "POST",
        body: data

      }),
      invalidatesTags: ["Medicine"],
    }),
  }),
});

export const {
  useGetAllMedicinesQuery,
  useAddMedicineMutation,
  useDeleteMedicineMutation,
  useUpdateMedicineMutation,
  useGetSingleMedicineQuery,
  useSellMedicineMutation
} = medicineApi;
