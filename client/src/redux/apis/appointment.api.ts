import { createApi, } from "@reduxjs/toolkit/query/react";
import { IClinic } from "../../models/clinic.interface";
import { Patient } from "./patientApi";
import { createCustomBaseQuery } from "./customBaseQuery.api";

export interface IData {
    _id: string;
    patient: Patient;
    doctor: DoctorID;
    clinic: IClinic;
    date: string;
    status: string;
    label: string;
    notes: string
    reason: string;
    payment: {
        amount: number,
        method: string,
        status: string,
        patientType: string
    },
    timeSlot: {
        from: string,
        to: string,
    }
    paymentStatus: string;
    createdAt: string;
    updatedAt: string;
}

export interface DoctorID {
    doctor: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        role: string;
        status: string;
    }

}
export interface IAppointment {
    pagination: { totalPages: number }
    result: IData[]
}
export interface Appointment {
    pagination: { totalPages: number }
    result: IData
}



export interface IAppointmentStats {
    total: number;
    completed: number;
    pending: number;
    cancelled: number;
}

const baseUrl = `${import.meta.env.VITE_BACKEND_URL}/api/v1/appointment`
const customBaseQuery = createCustomBaseQuery(baseUrl)

export const appointmentApi = createApi({
    reducerPath: "appointmentApi",
    baseQuery: customBaseQuery,
    tagTypes: ["Appointments"],
    endpoints: (builder) => ({
        createAppointment: builder.mutation<IAppointment, Partial<IAppointment>>({
            query: (newAppointment) => ({
                url: "/create",
                method: "POST",
                body: newAppointment,
            }),
            transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                return error.data?.message
            },
            invalidatesTags: ["Appointments"],
        }),

        getAppointments: builder.query<IAppointment, any>({
            query: () => ({
                url: "/list",
                method: "GET",
            }),
            providesTags: ["Appointments"],
            transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                return error.data?.message
            },
        }),

        getAppointmentById: builder.query<Appointment, string>({
            query: (id) => ({
                url: `/detail/${id}`,
                method: "GET",
            }),
            providesTags: ["Appointments"],
            transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                return error.data?.message
            },
        }),

        updateAppointment: builder.mutation<IAppointment, { id: string; appointmentData: Partial<IAppointment> }>({
            query: (data) => {
                return {
                    url: `/update/${data.id}`,
                    method: "PUT",
                    body: data.appointmentData,
                }
            },
            invalidatesTags: ["Appointments"],
            transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                return error.data?.message
            },
        }),
        deleteAppointment: builder.mutation<void, string>({
            query: (id) => ({
                url: `/delete/${id}`,
                method: "PUT",
            }),
            invalidatesTags: ["Appointments"],
            transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                return error.data?.message
            },
        }),

        restoreAppointment: builder.mutation<void, string>({
            query: (id) => ({
                url: `/restore/${id}`,
                method: "PUT",
            }),
            invalidatesTags: ["Appointments"],
            transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                return error.data?.message
            },
        }),

        changeAppointmentStatus: builder.mutation<void, { id: string; status: string }>({
            query: ({ id, status }) => ({
                url: `/status/${id}`,
                method: "PUT",
                body: { status },
            }),
            invalidatesTags: ["Appointments"],
        }),

        getAppointmentsByPatient: builder.query<IAppointment[], string>({
            query: (patient) => ({
                url: `/patient/${patient}`,
                method: "GET",
            }),
            transformResponse: (data: { result: IAppointment[] }) => data.result,
            providesTags: ["Appointments"],
        }),

        getAppointmentsByDoctor: builder.query<IAppointment[], string>({
            query: (doctor) => ({
                url: `/doctor/${doctor}`,
                method: "GET",
            }),
            transformResponse: (data: { result: IAppointment[] }) => data.result,
            providesTags: ["Appointments"],
        }),

        getAppointmentsByClinic: builder.query<IAppointment[], string>({
            query: (clinic) => ({
                url: `/clinic/${clinic}`,
                method: "GET",
            }),
            transformResponse: (data: { result: IAppointment[] }) => data.result,
            providesTags: ["Appointments"],
        }),

        filterAppointmentsByDate: builder.query<IAppointment[], { startDate: string; endDate: string }>({
            query: ({ startDate, endDate }) => ({
                url: "/filter",
                method: "POST",
                body: { startDate, endDate },
            }),
            transformResponse: (data: { result: IAppointment[] }) => data.result,
            providesTags: ["Appointments"],
        }),

        markPaymentAsPaid: builder.mutation<void, string>({
            query: (id) => ({
                url: `/payment/${id}`,
                method: "PUT",
            }),
            invalidatesTags: ["Appointments"],
        }),

        updateTimeSlot: builder.mutation<void, { appointmentId: string; timeSlot: string }>({
            query: ({ appointmentId, timeSlot }) => ({
                url: `/update/timeslot/${appointmentId}`,
                method: "PUT",
                body: { timeSlot },
            }),
            invalidatesTags: ["Appointments"],
        }),

        getPastAppointments: builder.query<IAppointment[], void>({
            query: () => ({
                url: "/get/past-apointments",
                method: "GET",
            }),
            transformResponse: (data: { result: IAppointment[] }) => data.result,
            providesTags: ["Appointments"],
        }),

        cancelAppointment: builder.mutation<void, string>({
            query: (id) => ({
                url: `/cancle-apointments/${id}`,
                method: "PUT",
            }),
            invalidatesTags: ["Appointments"],
        }),

        getAppointmentStats: builder.query<IAppointmentStats, void>({
            query: () => ({
                url: "/get-AppointmentStats",
                method: "GET",
            }),
            transformResponse: (data: { result: IAppointmentStats }) => data.result,
            providesTags: ["Appointments"],
        }),

        checkAppointmentAvailability: builder.query<boolean, { doctorId: string; date: string; timeSlot: string }>({
            query: ({ doctorId, date, timeSlot }) => ({
                url: "/check-appointmen-availability",
                method: "GET",
                params: { doctorId, date, timeSlot },
            }),
            providesTags: ["Appointments"],
        }),

        searchAppointments: builder.query<IAppointment, Partial<{ query: string, page: Number, limit: Number, selectedClinicId?: string }>>({
            query: (searchTerm) => ({
                url: `/search/appointments`,
                method: "GET",
                params: searchTerm,
            }),
            providesTags: ["Appointments"],
            transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                return error.data?.message
            },
        }),

        rescheduleAppointment: builder.mutation<IAppointment, { id: string; newTimeSlot: string }>({
            query: ({ id, newTimeSlot }) => ({
                url: `/reschedule/appointment/${id}`,
                method: "PUT",
                body: { newTimeSlot },
            }),
            invalidatesTags: ["Appointments"],
            transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                return error.data?.message
            },

        }),
    }),
});

export const {
    useCreateAppointmentMutation,
    useGetAppointmentsQuery,
    useGetAppointmentByIdQuery,
    useUpdateAppointmentMutation,
    useDeleteAppointmentMutation,
    useRestoreAppointmentMutation,
    useChangeAppointmentStatusMutation,
    useGetAppointmentsByPatientQuery,
    useGetAppointmentsByDoctorQuery,
    useGetAppointmentsByClinicQuery,
    useFilterAppointmentsByDateQuery,
    useMarkPaymentAsPaidMutation,
    useUpdateTimeSlotMutation,
    useGetPastAppointmentsQuery,
    useCancelAppointmentMutation,
    useGetAppointmentStatsQuery,
    useCheckAppointmentAvailabilityQuery,
    useSearchAppointmentsQuery,
    useRescheduleAppointmentMutation,
} = appointmentApi;
