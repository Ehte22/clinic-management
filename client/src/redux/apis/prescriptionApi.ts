import { createApi } from '@reduxjs/toolkit/query/react';
import { createCustomBaseQuery } from './customBaseQuery.api';



export interface Prescription {
    _id: string;
    patient: string;
    doctor: string;
    clinic: string;
    medication: string;
    dosage: string;
    date: string;
}

export interface SearchQuery {
    query: string;
}

export interface CreatePrescriptionData {
    patient: string;
    doctor: string;
    clinic: string;
    medication: string;
    dosage: string;
    date: string;

}

export interface UpdatePrescriptionData {
    medication?: string;
    dosage?: string;
    date?: string;
    details: string;

}

const baseUrl = `${import.meta.env.VITE_BACKEND_URL}/api/v1/prescription`
const customBaseQuery = createCustomBaseQuery(baseUrl)

export const prescriptionApi = createApi({
    reducerPath: 'prescriptionApi',
    baseQuery: customBaseQuery,
    tagTypes: ['Prescription'],
    endpoints: (builder) => ({
        getAllPrescriptions: builder.query<Prescription[], string | void>({
            query: () => ({
                url: '/all',
                method: 'GET',
            }),
            transformResponse: (data: { result: Prescription[] }) => {

                return data.result;
            },
            transformErrorResponse: (error: { status: number; data: { message: string } }) => {

                return error.data?.message;
            },
            providesTags: ['Prescription'],
        }),

        getPrescriptionsByPatient: builder.query<Prescription[], string>({
            query: (patientId) => ({
                url: `/patient/${patientId}`,
                method: 'GET',
            }),
            providesTags: ['Prescription'],
        }),

        getPrescriptionsByDoctor: builder.query<Prescription[], string>({
            query: (doctorId) => ({
                url: `/doctor/${doctorId}`,
                method: 'GET',
            }),
            providesTags: ['Prescription'],
        }),

        getPrescriptionById: builder.query<Prescription, string>({
            query: (prescriptionId) => ({
                url: `/prescription/${prescriptionId}`,
                method: 'GET',
            }),
            providesTags: ['Prescription'],
        }),

        updatePrescription: builder.mutation<Prescription, { prescriptionId: string; updatedPrescription: UpdatePrescriptionData }>({
            query: ({ prescriptionId, updatedPrescription }) => ({
                url: `/update/${prescriptionId}`,
                method: 'PUT',
                body: updatedPrescription,
            }),
            invalidatesTags: ['Prescription'],
        }),

        deletePrescription: builder.mutation<void, string>({
            query: (deleteprescriptionId) => ({
                url: `/delete/${deleteprescriptionId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Prescription'],
        }),


        createPrescription: builder.mutation<Prescription, CreatePrescriptionData>({
            query: (PrescriptionData) => ({
                url: '/create',
                method: 'POST',
                body: PrescriptionData,
            }),
            invalidatesTags: ['Prescription'],
        }),

        getPrescriptionsByClinic: builder.query<Prescription[], string>({
            query: (clinicId) => ({
                url: `/clinic/${clinicId}`,
                method: 'GET',
            }),
            transformResponse: (data: { result: Prescription[] }) => {
                return data.result;
            },
            transformErrorResponse: (error: { status: number; data: { message: string } }) => {
                return error.data?.message;
            },
            providesTags: ['Prescription'],
        }),

    }),
});

export const {
    useGetAllPrescriptionsQuery,
    useGetPrescriptionsByPatientQuery,
    useGetPrescriptionsByDoctorQuery,
    useGetPrescriptionByIdQuery,
    useUpdatePrescriptionMutation,
    useDeletePrescriptionMutation,
    useCreatePrescriptionMutation,
    useGetPrescriptionsByClinicQuery,
} = prescriptionApi;





