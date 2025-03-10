import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { IUser } from "../../models/user.interface"

export const userApi = createApi({
    reducerPath: "userApi",
    baseQuery: fetchBaseQuery({ baseUrl: `${import.meta.env.VITE_BACKEND_URL}/api/v1` }),
    tagTypes: ["user"],
    endpoints: (builder) => {
        return {
            registerUser: builder.mutation<{ message: string, result: IUser }, FormData>({
                query: userData => {
                    return {
                        url: "/user/register-user",
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

            sendOTP: builder.mutation<string, { username: string }>({
                query: (username) => {
                    return {
                        url: "/auth/send-otp",
                        method: "POST",
                        body: username
                    }
                },
                transformResponse: (data: { message: string }) => {
                    return data.message
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                }
            }),

            verifyOTP: builder.mutation<string, { username: string, otp: string }>({
                query: (userData) => {
                    return {
                        url: "/auth/verify-otp",
                        method: "POST",
                        body: userData
                    }
                },
                transformResponse: (data: { message: string }) => {
                    return data.message
                },
                transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                    return error.data?.message
                }
            }),

        }
    }
})

export const {
    useRegisterUserMutation,
    useSendOTPMutation,
    useVerifyOTPMutation,
} = userApi
