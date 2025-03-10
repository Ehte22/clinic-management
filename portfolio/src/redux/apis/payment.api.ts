import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

export const paymentApi = createApi({
    reducerPath: "paymentApi",
    baseQuery: fetchBaseQuery({ baseUrl: `${import.meta.env.VITE_BACKEND_URL}/api/v1/payment` }),
    tagTypes: ["payment"],
    endpoints: (builder) => {
        return {
            initiatePayment: builder.mutation<{ message: string, orderId: string, amount: number }, number>({
                query: amount => {
                    return {
                        url: "/initiate-payment",
                        method: "POST",
                        body: { amount }
                    }
                },
            }),

            verifyPayment: builder.mutation<{ success: boolean, message: string }, any>({
                query: (paymentData) => {
                    console.log(paymentData);

                    return {
                        url: "/verify-payment",
                        method: "POST",
                        body: paymentData
                    }
                },
            })

        }
    }
})

export const {
    useInitiatePaymentMutation,
    useVerifyPaymentMutation
} = paymentApi
