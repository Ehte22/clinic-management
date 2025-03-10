import { createApi } from "@reduxjs/toolkit/query/react";
import { IDocData, IDoctor } from "../../pages/doctor/Doctor";
import { IUser } from "../../models/user.interface";
import { createCustomBaseQuery } from "./customBaseQuery.api";

export interface IDoctorUpdate {
    name?: string;
    specialization?: string;
    clinic?: string;
    schedule?: { day: string; from: string; to: string }[];
    qualifications?: string[];
    experience_years?: number;
    bio?: string;
    label?: string;
    emergency_contact?: string;
}

const baseUrl = `${import.meta.env.VITE_BACKEND_URL}/api/v1/doctor`
const customBaseQuery = createCustomBaseQuery(baseUrl)

export const doctorApi = createApi({
    reducerPath: "doctorApi",
    baseQuery: customBaseQuery,
    tagTypes: ["Doctors"],
    endpoints: (builder) => ({
        createDoctor: builder.mutation<IDoctor, Partial<IDoctor>>({
            query: (newDoctor) => {

                return ({
                    url: "/create",
                    method: "POST",
                    body: newDoctor,
                })
            },
            invalidatesTags: ["Doctors"],
            transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                return error.data?.message
            },
        }),

        getDoctors: builder.query<IUser[], void>({
            query: () => ({
                url: "/get-doctors",
                method: "GET",
            }),
            transformResponse: (data: { result: IUser[] }) => data.result,
            providesTags: ["Doctors"],
            transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                return error.data?.message
            },
        }),

        getDoctorById: builder.query<IDocData, string>({
            query: (id) => ({
                url: `/get-doctor/${id}`,
                method: "GET",
            }),
            transformResponse: (data: { result: IDocData }) => data.result,
            transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                return error.data?.message
            },
            providesTags: ["Doctors"]
        }),
        GetClinicDoctors: builder.query<IDocData[], void>({
            query: () => ({
                url: `/get-clinic-doctors`,
                method: "GET",
            }),
            transformResponse: (data: { result: IDocData[] }) => data.result,
            transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                return error.data?.message
            },
            providesTags: ["Doctors"]
        }),

        updateDoctor: builder.mutation<IDoctor, { id: string; doctorData: IDoctorUpdate }>({
            query: (data) => ({
                url: `/update-doctors/${data.id}`,
                method: "PUT",
                body: data.doctorData,
            }),
            transformResponse: (data: { result: IDoctor }) => data.result,
            transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                return error.data?.message
            },
            invalidatesTags: ["Doctors"],
        }),
        searchDoctor: builder.query<IDoctor, { query: string, page: number, limit: number, selectedClinicId?: string }>({
            query: (doctor) => ({
                url: `/search/doctors`,
                method: "GET",
                params: doctor
            }),
            providesTags: ["Doctors"],
            transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                return error.data?.message
            },
        }),

        deleteDoctor: builder.mutation<void, string>({
            query: (id) => ({
                url: `/delete-doctors/${id}`,
                method: "PUT",
            }),
            invalidatesTags: ["Doctors"],
            transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                return error.data?.message
            },
        }),

        restoreDoctor: builder.mutation<void, string>({
            query: (id) => ({
                url: `/restore-doctors/${id}`,
                method: "PUT",
            }),
            invalidatesTags: ["Doctors"],
            transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                return error.data?.message
            },
        }),

        getDoctorsByClinic: builder.query<IDoctor[], string>({
            query: (clinic) => ({
                url: `/doctors/clinic/${clinic}`,
                method: "GET",
            }),
            transformResponse: (data: { result: IDoctor[] }) => data.result,
            providesTags: ["Doctors"],
            transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                return error.data?.message
            },
        }),

        getActiveDoctors: builder.query<IDoctor[], void>({
            query: () => ({
                url: "/doctors/active",
                method: "GET",
            }),
            transformResponse: (data: { result: IDoctor[] }) => data.result,
            providesTags: ["Doctors"],
            transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                return error.data?.message
            },
        }),

        getDoctorSchedule: builder.query<{ day: string; from: string; to: string }[], string>({
            query: (id) => ({
                url: `/doctors/schedule/${id}`,
                method: "GET",
            }),
            transformResponse: (data: { result: { day: string; from: string; to: string }[] }) => data.result,
            transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                return error.data?.message
            },
            providesTags: ["Doctors"],
        }),

        searchDoctorsBySpecialization: builder.query<IDoctor[], string>({
            query: (specialization) => ({
                url: `/doctors/search/${specialization}`,
                method: "GET",
            }),
            transformResponse: (data: { result: IDoctor[] }) => data.result,
            transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                return error.data?.message
            },
            providesTags: ["Doctors"],
        }),

        updateDoctorStatus: builder.mutation<void, { id: string; status: string }>({
            query: ({ id, status }) => ({
                url: `/doctors/updatestatus/${id}`,
                method: "PUT",
                body: { status },
            }),
            invalidatesTags: ["Doctors"],
            transformErrorResponse: (error: { status: number, data: { message: string } }) => {
                return error.data?.message
            },
        }),
    }),
});

export const {
    useCreateDoctorMutation,
    useGetDoctorsQuery,
    useGetDoctorByIdQuery,
    useUpdateDoctorMutation,
    useDeleteDoctorMutation,
    useRestoreDoctorMutation,
    useGetDoctorsByClinicQuery,
    useGetActiveDoctorsQuery,
    useGetDoctorScheduleQuery,
    useSearchDoctorsBySpecializationQuery,
    useUpdateDoctorStatusMutation,
    useSearchDoctorQuery,
    useGetClinicDoctorsQuery,
} = doctorApi;
