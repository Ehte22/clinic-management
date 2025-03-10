import { createApi } from "@reduxjs/toolkit/query/react"
import { IUser } from "../../models/user.interface";
import { createCustomBaseQuery } from "./customBaseQuery.api";


interface Data {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    mobile: number;
    profile?: string;
    status: string;
    clinicId: string;
}

export interface AddReceptionistRequest {
    user: string;
    doctor?: string;
    status?: 'active' | 'inactive';
    working_hours: {
        day: string;
        from: string;
        to: string;
    }[];
}
export interface Receptionist {
    data: Data[];
    total: number;

}




export interface IReceptionist {
    // data: {
    _id: string;

    user: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
        phone: number;
        profile?: string;
    };
    clinic: {
        _id: string;
        name: string;
        contactInfo: number;
        city: string;
        state: string;
        country: string;
        street: string;
        alternateContactInfo: string | null;
        email: string;
        logo: string;
        deletedAt: string | null;
        createdAt: string;
        updatedAt: string;
        __v: number;
        status: "active" | "inactive";
    },
    doctor?: string;
    status?: 'active' | 'inactive';
    working_hours: {
        day: string;
        from: string;
        to: string;
    }[];
    // }
    // total: number;

}

export interface UpdateReceptionistPayload {
    _id: string;
    data: FormData;
}
export interface ChangeReceptionistStatusPayload {
    id: string;
    status: string;
}

const baseUrl = `${import.meta.env.VITE_BACKEND_URL}/api/v1/receptionist`
const customBaseQuery = createCustomBaseQuery(baseUrl)

export const receptionistApi = createApi({
    reducerPath: "receptionistApi",
    baseQuery: customBaseQuery,
    tagTypes: ["Receptionist"],
    endpoints: (builder) => ({
        addReceptionist: builder.mutation<Receptionist, FormData>({
            query: (receptionistData) => {

                return {
                    url: "/add-receptionist",
                    method: "POST",
                    body: receptionistData,
                }
            },
            invalidatesTags: ["Receptionist"],
            transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                return error.data?.message
            }
        }),
        getAllReceptionists: builder.query<Receptionist, { page: number; limit: number; sortBy?: string; filter?: string, selectedClinicId?: string }>({
            query: ({ page, limit, sortBy, filter, selectedClinicId }) => ({
                url: "/receptionists",
                method: "GET",
                params: { page, limit, sortBy, filter, selectedClinicId }
            }),
            providesTags: ["Receptionist"],
            transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                return error.data?.message
            }
        }),
        receptionistsUser: builder.query<IUser[], void>({
            query: () => ({
                url: "/receptionists-user",
                method: "GET",
            }),
            providesTags: ["Receptionist"],
            transformResponse: (data: { data: IUser[] }) => {
                return data.data
            },
            transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                return error.data?.message
            }
        }),
        getReceptionistById: builder.query<IReceptionist, string>({
            query: (id: string) => ({
                url: `/receptionists/${id}`,
                method: "GET",
            }),
            providesTags: (result, error, id) => [{ type: "Receptionist", id, error, result }],
            transformResponse: (response: { data: IReceptionist }) => response.data,
            transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                return error.data?.message
            }
        }),
        updateReceptionist: builder.mutation<Receptionist, UpdateReceptionistPayload>({
            query: ({ _id, data }) => ({
                url: `/update-receptionists/${_id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: (result, error, { _id }) => [{ type: "Receptionist", _id, error, result }],
        }),
        deleteReceptionist: builder.mutation<void, string>({
            query: (id) => ({
                url: `/receptionists/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, id) => [{ type: "Receptionist", id, error, result }],
            transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                return error.data?.message
            },
        }),
        searchReceptionists: builder.query<Receptionist[], { query: string }>({
            query: ({ query }) => ({
                url: `/receptionists/search`,
                method: "GET",
                params: { q: query },
            }),
            providesTags: ["Receptionist"],
            transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                return error.data?.message
            }
        }),
        changeReceptionistStatus: builder.mutation<Receptionist, ChangeReceptionistStatusPayload>({
            query: ({ id, status }) => ({
                url: `/receptionists/${id}/status`,
                method: "PUT",
                body: { status },
            }),
            // invalidatesTags: (result, error, { id }) => [{ type: "Receptionist", id, error, result }],
            invalidatesTags: ["Receptionist"],
            transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                return error.data?.message
            }
        }),
        getReceptionistsByClinic: builder.query<Receptionist[], string>({
            query: (clinicId) => ({
                url: `/receptionists/clinic/${clinicId}`,
                method: "GET",
            }),
            providesTags: ["Receptionist"],
            transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                return error.data?.message
            }
        }),
    }),
})

export const {
    useAddReceptionistMutation,
    useGetAllReceptionistsQuery,
    useGetReceptionistByIdQuery,
    useUpdateReceptionistMutation,
    useDeleteReceptionistMutation,
    useSearchReceptionistsQuery,
    useChangeReceptionistStatusMutation,
    useGetReceptionistsByClinicQuery,
    useReceptionistsUserQuery,
} = receptionistApi;
