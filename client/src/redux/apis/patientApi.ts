import { createApi } from '@reduxjs/toolkit/query/react';
import { createCustomBaseQuery } from './customBaseQuery.api';


export interface CreatePatientResponse {
  message: string;
  patient: Patient;
}

export interface UpdatePatientResponse {
  message: string;
  updatedPatient: Patient;
}

export interface GetAllPatientsResponse {
  patients: Patient[];
}

export interface GetPatientByIdResponse {
  patient: Patient;
}

export interface SearchPatientsResponse {
  result: Patient[];
}
export interface Patient {
  _id?: string;
  id?: string;
  name: string;
  age: number;
  weight: number;
  gender: string;
  contact: string;
  address: {
    city: string;
    state: string;
    country: string;
    street: string;
    zipCode: string;
  };





  dateOfBirth: string;
  contactInfo: string;
  email: string;
  emergencyContact: emergencyContact;

}
export interface Ipatient {
  result: Patient[]
  pagination: {
    total: number,
    page: number,
    limit: number,
    totalPages: number
  }
  id: string;
  name: string;
  age: number;
  gender: string;
  contact: string;
  address: string;

}
export interface Address {
  city: string;
  state: string;
  country: string;
  street: string;
  zipCode: string;
}

export interface emergencyContact {
  name: string;
  relationship: string;
  contactNumber: string;
}

export interface FormValues {
  name?: string;
  age?: number;
  gender?: string;
  contact?: string;

  email?: string;
  emergencyContact?: {
    name: string;
    relation: string;
    phone: string;
  };
}

export interface UpdatePatientInput {
  name?: string;
  age?: number;
  gender?: string;
  contact?: string;
  address?: string;
}

const baseUrl = `${import.meta.env.VITE_BACKEND_URL}/api/v1/patient`
const customBaseQuery = createCustomBaseQuery(baseUrl)

export const patientApi = createApi({
  reducerPath: 'patientApi',
  baseQuery: customBaseQuery,
  tagTypes: ['Patient'],
  endpoints: (builder) => ({


    addCreatePatient: builder.mutation<Patient, Patient>({
      query: (PatientData) => ({
        url: '/patient-create',
        method: 'POST',
        body: PatientData,
      }),
      invalidatesTags: ['Patient'],
    }),

    getAllPatients: builder.query<Patient[], string>({
      query: (clinic) => ({
        url: `/patient-list/${clinic}`,
        method: 'GET',
      }),
      transformResponse: (data: { result: Patient[] }) => data.result,
      transformErrorResponse: (error: { status: number, data: { message: string } }) => {
        return error.data?.message
      },
      providesTags: ['Patient'],
    }),

    getPatientById: builder.query<Patient, string>({
      query: (patientbyid) => ({
        url: `/patient-view/${patientbyid}`,
        method: 'GET',
      }),
      transformResponse: (data: { result: Patient }) => data.result,

      providesTags: ['Patient'],
    }),

    updatePatient: builder.mutation<void, { updatedPatient: string; updatepatient: FormData }>({
      query: ({ updatepatient, updatedPatient }) => ({
        url: `/patient-update/${updatedPatient}`,
        method: 'PUT',
        body: updatepatient,
      }),
      invalidatesTags: ['Patient'],
    }),

    deletePatient: builder.mutation<void, string>({
      query: (id) => ({
        url: `/patient-delete/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Patient'],
    }),

    getPatientsForTable: builder.query<Patient[], void>({
      query: () => ({
        url: '/patient-table',
        method: 'GET',
      }),
      transformResponse: (data: { result: Patient[] }) => data.result,
      providesTags: ['Patient'],
    }),

    getAllAllPatient: builder.query<Ipatient, Partial<{ search: string, limit: number, page: number, isFetchAll: boolean, selectedClinicId: string }>>({
      query: (search = {}) => ({
        url: '/patient-all',
        method: 'GET',
        params: search,
      }),

      transformErrorResponse: (error: { status: number; data: { message: string } }) => {
        return error.data?.message;
      },
      providesTags: ['Patient'],
    }),
    todayPatients: builder.query<Ipatient, void>({
      query: () => ({
        url: '/today',
        method: 'GET',

      }),
      providesTags: ['Patient'],
    }),


    searchPatientsByName: builder.query<Patient[], string>({
      query: (search) => {
        return {
          url: '/patient-search',
          method: 'GET',
          params: { search },
        };
      },
      transformResponse: (data: { result: Patient[] }) => data.result,
      providesTags: ['Patient'],
    }),

  }),
});

export const {
  useAddCreatePatientMutation,
  useGetAllPatientsQuery,
  useGetPatientByIdQuery,
  useUpdatePatientMutation,
  useDeletePatientMutation,
  useGetPatientsForTableQuery,
  useSearchPatientsByNameQuery, useGetAllAllPatientQuery, useTodayPatientsQuery
} = patientApi;







