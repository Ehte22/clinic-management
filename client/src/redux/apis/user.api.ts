import { createApi } from "@reduxjs/toolkit/query/react"
import { IUser } from "../../models/user.interface"
import { createCustomBaseQuery } from "./customBaseQuery.api";

const baseUrl = `${import.meta.env.VITE_BACKEND_URL}/api/v1/user`
const customBaseQuery = createCustomBaseQuery(baseUrl)

export const userApi = createApi({
    reducerPath: "userApi",
    baseQuery: customBaseQuery,
    tagTypes: ["user"],
    endpoints: (builder) => {
        return {
            getUsers: builder.query<{ result: IUser[], totalPages: number }, Partial<{ page: number, limit: number, searchQuery: string, isFetchAll: boolean, selectedClinicId: string }>>({
                query: (queryParams = {}) => {
                    return {
                        url: "/",
                        method: "GET",
                        params: queryParams
                    }
                },
                transformResponse: (data: { result: IUser[], totalPages: number }) => {
                    return data
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                },
                providesTags: ["user"]
            }),

            getUserById: builder.query<IUser, string>({
                query: (id) => {
                    return {
                        url: `/${id}`,
                        method: "GET"
                    }
                },
                transformResponse: (data: { result: IUser }) => {
                    return data.result
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                },
                providesTags: ["user"]
            }),

            createUser: builder.mutation<{ message: string, result: IUser }, FormData>({
                query: userData => {
                    return {
                        url: "/add-user",
                        method: "POST",
                        body: userData
                    }
                },
                transformResponse: (data: { message: string, result: IUser }) => {
                    return data
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                },
                invalidatesTags: ["user"]
            }),

            updateUser: builder.mutation<string, { userData: FormData, id: string }>({
                query: ({ userData, id }) => {
                    return {
                        url: `/update-user/${id}`,
                        method: "PUT",
                        body: userData
                    }
                },
                transformResponse: (data: { message: string }) => {
                    return data.message
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                },
                invalidatesTags: ["user"]
            }),

            updateUserStatus: builder.mutation<string, { status: string, id: string }>({
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
                invalidatesTags: ["user"]
            }),

            deleteUser: builder.mutation<string, string>({
                query: (id) => {
                    return {
                        url: `/delete-user/${id}`,
                        method: "PUT",
                    }
                },
                transformResponse: (data: { message: string }) => {
                    return data.message
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                },
                invalidatesTags: ["user"]
            }),

        }
    }
})

export const {
    useGetUsersQuery,
    useGetUserByIdQuery,
    useCreateUserMutation,
    useUpdateUserMutation,
    useUpdateUserStatusMutation,
    useDeleteUserMutation
} = userApi
