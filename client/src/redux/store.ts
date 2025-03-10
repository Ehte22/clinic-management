import { configureStore } from "@reduxjs/toolkit";

import { invoiceApi } from "./apis/invoiceApi";
import { receptionistApi } from "./apis/receptionistApi";
import authSlice from "./slices/auth.slice"
import { clinicApi } from "./apis/clinic.api";

import { patientApi } from "./apis/patientApi";
import { prescriptionApi } from "./apis/prescriptionApi";
import { authApi } from "./apis/auth.api";
import { doctorApi } from "./apis/doctor.api";
import { appointmentApi } from "./apis/appointment.api";
import { medicineApi } from "./apis/medicineApi";
import { userApi } from "./apis/user.api";
import { dashBoardApi } from "./apis/dashboard.api";
import { supplierApi } from "./apis/supplier.api";




const reduxStore = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [clinicApi.reducerPath]: clinicApi.reducer,
    [invoiceApi.reducerPath]: invoiceApi.reducer,
    [patientApi.reducerPath]: patientApi.reducer,
    [prescriptionApi.reducerPath]: prescriptionApi.reducer,
    [receptionistApi.reducerPath]: receptionistApi.reducer,
    [appointmentApi.reducerPath]: appointmentApi.reducer,
    [doctorApi.reducerPath]: doctorApi.reducer,
    [medicineApi.reducerPath]: medicineApi.reducer,
    [dashBoardApi.reducerPath]: dashBoardApi.reducer,
    [supplierApi.reducerPath]: supplierApi.reducer,
    auth: authSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      prescriptionApi.middleware,
      patientApi.middleware,
      invoiceApi.middleware,
      clinicApi.middleware,
      appointmentApi.middleware,
      doctorApi.middleware,
      receptionistApi.middleware,
      authApi.middleware,
      userApi.middleware,
      medicineApi.middleware,
      dashBoardApi.middleware,
      supplierApi.middleware,
    )
})


export type RootState = ReturnType<typeof reduxStore.getState>
export type AppDispatch = typeof reduxStore.dispatch

export default reduxStore

