import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { IClinic } from "../../models/clinic.interface"

export const clinicApi = createApi({
    reducerPath: "clinicApi",
    baseQuery: fetchBaseQuery({ baseUrl: `${import.meta.env.VITE_BACKEND_URL}/api/v1/clinic` }),
    tagTypes: ["clinic"],
    endpoints: (builder) => {
        return {
            registerClinic: builder.mutation<{ message: string, result: IClinic }, FormData>({
                query: clinicData => {
                    return {
                        url: "/register-clinic",
                        method: "POST",
                        body: clinicData
                    }
                },
                transformResponse: (data: { message: string, result: IClinic }) => {
                    localStorage.setItem("clinicId", data.result._id as string)
                    return data
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
    useRegisterClinicMutation
} = clinicApi


