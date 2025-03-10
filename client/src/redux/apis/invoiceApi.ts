import { createApi } from "@reduxjs/toolkit/query/react"
import { IData } from "./appointment.api";
import { createCustomBaseQuery } from "./customBaseQuery.api";

export interface Invoice {
    _id?: string;
    issueDate: string;
    dueDate: string;
    paymentStatus: string;
    paymentMethod: string;
    tax: number;
    discount: number;
    totalAmount: number;
    notes: string;
    items: InvoiceItem[];
}

export interface InvoiceItem {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

export interface UpdateInvoicePayload {
    _id?: string;
    updateId: string;
    updateData: Invoice;
}

interface InvoiceData {
    data: Invoice[];
    total: number;
}
export interface InvoiceItem {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
    _id: string;
}

export interface IInvoice {
    _id: string;
    invoiceNumber: string;
    appointmentId: IData | null;
    issueDate: string; // ISO 8601 date format
    dueDate: string; // ISO 8601 date format
    items: InvoiceItem[];
    tax: number;
    discount: number;
    totalAmount: number;
    paymentStatus: "pending" | "paid" | "overdue"; // Add other statuses if applicable
    paymentMethod: "online" | "offline" | "cash" | "card"; // Add other methods if applicable
    notes?: string; // Optional
    isDelete: boolean;
    createdAt: string; // ISO 8601 date format
    updatedAt: string; // ISO 8601 date format
    clinic: string; // Reference to clinic ID
    __v: number;
}



export interface SearchInvoiceQuery {
    searchTerm: string;
    paymentStatus?: string;
    dateFrom?: string;
    dateTo?: string;
    page: number;
    limit: number;
}

const baseUrl = `${import.meta.env.VITE_BACKEND_URL}/api/v1/invoice`
const customBaseQuery = createCustomBaseQuery(baseUrl)

export const invoiceApi = createApi({
    reducerPath: "invoiceApi",
    baseQuery: customBaseQuery,
    tagTypes: ["Invoice"],
    endpoints: (builder) => ({
        fetchAllInvoices: builder.query<InvoiceData, { page: number; limit: number; sortBy?: string; filter?: string, selectedClinicId: string }>({
            query: ({ page, limit, sortBy, filter, selectedClinicId }) => ({
                url: "/fetch-all-invoice",
                method: "GET",
                params: { page, limit, sortBy, filter, selectedClinicId },
            }),
            providesTags: (result) => [{ type: "Invoice", id: "LIST", result }]
        }),
        GetInvoiceById: builder.query<IInvoice, string>({
            query: (id) => ({
                url: `/get-invoice/${id}`,
                method: "GET"
            }),
            providesTags: ["Invoice"],
            transformResponse: (response: { data: IInvoice }) => response.data,
            transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                return error.data?.message
            }
        }),
        searchInvoices: builder.query<InvoiceData, SearchInvoiceQuery>({
            query: ({ searchTerm, paymentStatus, dateFrom, dateTo, page, limit }) => ({
                url: "/search-invoices",
                method: "GET",
                params: { searchTerm, paymentStatus, dateFrom, dateTo, page, limit },
            }),
            providesTags: ["Invoice"],
            transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                return error.data?.message
            }
        }),
        // addInvoice: builder.mutation<Invoice, Omit<Invoice, "_id">>({
        //     query: (invoiceData) => ({
        //         url: "/add-invoice",
        //         method: "POST",
        //         body: invoiceData,
        //     }),
        //     invalidatesTags: [{ type: "Invoice", id: "LIST" }],
        // }),
        addInvoice: builder.mutation<Invoice, any>({
            query: (invoiceData) => {
                return {
                    url: "/add-invoice",
                    method: "POST",
                    body: invoiceData,
                }
            },
            invalidatesTags: ['Invoice'],
            transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                return error.data?.message
            }
        }),
        deleteInvoice: builder.mutation<void, string>({
            query: (invoiceId) => ({
                url: `/delete-invoice/${invoiceId}`,
                method: "DELETE",
            }),
            invalidatesTags: ['Invoice'],
            transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                return error.data?.message
            }
        }),
        restoreInvoice: builder.mutation<void, string>({
            query: (invoiceId) => ({
                url: `/restore-invoice/${invoiceId}`,
                method: "PUT",
            }),
            invalidatesTags: ['Invoice']
        }),
        updateInvoice: builder.mutation<Invoice, UpdateInvoicePayload>({
            query: ({ updateId, updateData }) => ({
                url: `/update-invoice/${updateId}`,
                method: "PUT",
                body: updateData,
            }),
            invalidatesTags: ['Invoice'],
            transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                return error.data?.message
            }
        }),
        ChangePaymentStatus: builder.mutation<Invoice, any>({
            query: ({ updateId, Status }) => {
                return {
                    url: `/change-payment-status/${updateId}`,
                    method: "PUT",
                    body: Status,
                }
            },
            invalidatesTags: ['Invoice'],
            transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                return error.data?.message
            }
        }),
    }),
})
export const {
    useFetchAllInvoicesQuery,
    useSearchInvoicesQuery,
    useAddInvoiceMutation,
    useDeleteInvoiceMutation,
    useRestoreInvoiceMutation,
    useUpdateInvoiceMutation,
    useGetInvoiceByIdQuery,
    useChangePaymentStatusMutation,
} = invoiceApi;
