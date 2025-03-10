import { configureStore } from "@reduxjs/toolkit";
import { clinicApi } from "./apis/clinic.api";
import { userApi } from "./apis/user.api";
import { paymentApi } from "./apis/payment.api";


const reduxStore = configureStore({
    reducer: {
        [clinicApi.reducerPath]: clinicApi.reducer,
        [userApi.reducerPath]: userApi.reducer,
        [paymentApi.reducerPath]: paymentApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(
            clinicApi.middleware,
            userApi.middleware,
            paymentApi.middleware
        )

})

export type RootState = ReturnType<typeof reduxStore.getState>
export type AppDispatch = typeof reduxStore.dispatch

export default reduxStore