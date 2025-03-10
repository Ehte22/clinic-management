import { BrowserRouter, Route, Routes } from "react-router-dom"
import { createContext, useEffect, useState } from "react"
import './i18n';
import Clinics from "./pages/clinic/Clinics"
import AddClinic from "./pages/clinic/AddClinic"
import Users from "./pages/user/Users"
import AddUser from "./pages/user/AddUser"
import Medicines from "./pages/medicine/Medicines"
import Layout from "./share/Layout"
import Profile from "./pages/user/Profile"
import Invoice from "./pages/invoice/Invoice"
import AddInvoice from "./pages/invoice/AddInvoice"
import Receptionist from "./pages/receptionist/Receptionist"
import AddReceptionist from "./pages/receptionist/AddReceptionist"
import Doctor from "./pages/doctor/Doctor"
import Appointment from "./pages/appointment/Appointment"
import Login from "./pages/Login"
import AddDoctor from "./pages/doctor/AddDoctor"
import AddAppointment from "./pages/appointment/AddAppointment"
import ResetPassword from "./pages/ResetPassword"
import ForgotPassword from "./pages/ForgotPassword"
import Patient from "./pages/Patient"
import Prescription from "./pages/prescription/Prescription"
import PatientTable from "./components/patient/PatientTable"
import Suppliers from "./pages/supplier/Suppliers"
import AddSupplier from "./pages/supplier/AddSupplier"
import SessionExpiredModal from "./components/SessionExpiredModal"
import SellMedicine from "./pages/medicine/SellMedicine"
import AddMedicine from "./pages/medicine/AddMedicine"
import Protected from "./components/Protected"
import ErrorBoundary from "./components/ErrorBoundary"
import PageNotFound from "./pages/PageNotFound";
import Unauthorized from "./pages/Unauthorized";
import DashBoard from "./pages/DashBoard";
import ClinicAdminDashBoard from "./pages/ClinicAdminDashBoard";
import { useDispatch } from "react-redux"
import { idbHelpers } from "./indexDB"
import { supplierApi } from "./redux/apis/supplier.api"
import { appointmentApi } from "./redux/apis/appointment.api"
import { clinicApi } from "./redux/apis/clinic.api"
import { doctorApi } from "./redux/apis/doctor.api"
import { invoiceApi } from "./redux/apis/invoiceApi"
import { medicineApi } from "./redux/apis/medicineApi"
import { patientApi } from "./redux/apis/patientApi"
import { prescriptionApi } from "./redux/apis/prescriptionApi"
import { receptionistApi } from "./redux/apis/receptionistApi"
import { userApi } from "./redux/apis/user.api"

interface ImagePreviewContextType {
  previewImages: string[];
  setPreviewImages: (images: string[]) => void;
}
export const ImagePreviewContext = createContext<ImagePreviewContextType>({
  previewImages: [],
  setPreviewImages: () => { }
})

const App = () => {
  const [previewImages, setPreviewImages] = useState<string[]>([])

  const dispatch = useDispatch()

  useEffect(() => {

    const handleOnline = async () => {
      await idbHelpers.sync().then(() => {
        const apis = [
          { api: appointmentApi, tag: "Appointments" },
          { api: clinicApi, tag: "clinic" },
          { api: doctorApi, tag: "Doctors" },
          { api: invoiceApi, tag: "Invoice" },
          { api: medicineApi, tag: "Medicine" },
          { api: patientApi, tag: "Patient" },
          { api: prescriptionApi, tag: "Prescription" },
          { api: receptionistApi, tag: "Receptionist" },
          { api: supplierApi, tag: "supplier" },
          { api: userApi, tag: "user" },
        ]

        apis.forEach(({ api, tag }) => {
          dispatch(api.util.invalidateTags([tag as any]))
        });
      })
    };

    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [dispatch]);

  return <>
    <ImagePreviewContext.Provider value={{ previewImages, setPreviewImages }}>
      <BrowserRouter>
        <SessionExpiredModal />
        <Routes>

          {/* Super Admin */}
          <Route path="/" element={<Layout />}>

            {/* dashboards */}
            <Route index element={<Protected roles={["Super Admin", "Clinic Admin"]} compo={<ErrorBoundary><ClinicAdminDashBoard /></ErrorBoundary>} />} />
            <Route path="/dashboard" element={<Protected roles={["Super Admin"]} compo={<ErrorBoundary><DashBoard /></ErrorBoundary>} />} />

            {/* user */}
            <Route path="/users" element={<Protected roles={["Super Admin"]} compo={<ErrorBoundary><Users /></ErrorBoundary>} />} />
            <Route path="/add-user" element={<Protected roles={["Super Admin"]} compo={<ErrorBoundary><AddUser /></ErrorBoundary>} />} />
            <Route path="/update-user/:id" element={<Protected roles={["Super Admin"]} compo={<ErrorBoundary><AddUser /></ErrorBoundary>} />} />

            {/* user profile */}
            <Route path="/profile/:id" element={<Protected roles={["Super Admin", "Clinic Admin", "Doctor", "Receptionist"]} compo={<ErrorBoundary><Profile /></ErrorBoundary>} />} />

            {/* clinic */}
            <Route path="/clinics" element={<Protected roles={["Super Admin"]} compo={<ErrorBoundary><Clinics /></ErrorBoundary>} />} />
            <Route path="/add-clinic" element={<Protected roles={["Super Admin"]} compo={<ErrorBoundary><AddClinic /></ErrorBoundary>} />} />
            <Route path="/update-clinic/:id" element={<Protected roles={["Super Admin"]} compo={<ErrorBoundary><AddClinic /></ErrorBoundary>} />} />

            {/* medicine */}
            <Route path="all-medicines" element={<Protected roles={["Super Admin", "Clinic Admin", "Doctor", "Receptionist"]} compo={<ErrorBoundary><Medicines /></ErrorBoundary>} />} />
            <Route path="buy-med" element={<Protected roles={["Super Admin", "Clinic Admin", "Doctor", "Receptionist"]} compo={<ErrorBoundary><SellMedicine /></ErrorBoundary>} />} />
            <Route path="add-medicine" element={<Protected roles={["Super Admin", "Clinic Admin", "Doctor", "Receptionist"]} compo={<ErrorBoundary><AddMedicine /></ErrorBoundary>} />} />
            <Route path="update-medicine/:id" element={<Protected roles={["Super Admin", "Clinic Admin", "Doctor", "Receptionist"]} compo={<ErrorBoundary><AddMedicine /></ErrorBoundary>} />} />

            {/* invoice */}
            <Route path="invoice" element={<Protected roles={["Super Admin", "Clinic Admin", "Doctor", "Receptionist"]} compo={<ErrorBoundary><Invoice /></ErrorBoundary>} />} />
            <Route path="add-invoice" element={<Protected roles={["Super Admin", "Clinic Admin", "Doctor", "Receptionist"]} compo={<ErrorBoundary><AddInvoice /></ErrorBoundary>} />} />
            <Route path="update-invoice/:id" element={<Protected roles={["Super Admin", "Clinic Admin", "Doctor", "Receptionist"]} compo={<ErrorBoundary><AddInvoice /></ErrorBoundary>} />} />

            {/* receptionist */}
            <Route path="receptionist" element={<Protected roles={["Super Admin", "Clinic Admin", "Doctor"]} compo={<ErrorBoundary><Receptionist /></ErrorBoundary>} />} />
            <Route path="add-receptionist" element={<Protected roles={["Super Admin", "Clinic Admin", "Doctor"]} compo={<ErrorBoundary><AddReceptionist /></ErrorBoundary>} />} />
            <Route path="update-receptionist/:id" element={<Protected roles={["Super Admin", "Clinic Admin", "Doctor"]} compo={<ErrorBoundary><AddReceptionist /></ErrorBoundary>} />} />

            {/* doctor */}
            <Route path="/doctor" element={<Protected roles={["Super Admin", "Clinic Admin"]} compo={<ErrorBoundary><Doctor /></ErrorBoundary>} />} />
            <Route path="/add-doctor" element={<Protected roles={["Super Admin", "Clinic Admin"]} compo={<ErrorBoundary><AddDoctor /></ErrorBoundary>} />} />
            <Route path="/update-doctor/:id" element={<Protected roles={["Super Admin", "Clinic Admin"]} compo={<ErrorBoundary><AddDoctor /></ErrorBoundary>} />} />

            {/* appointment */}
            <Route path="/appointment" element={<Protected roles={["Super Admin", "Clinic Admin", "Doctor", "Receptionist"]} compo={<ErrorBoundary><Appointment /></ErrorBoundary>} />} />
            <Route path="/add-appointment" element={<Protected roles={["Super Admin", "Clinic Admin", "Doctor", "Receptionist"]} compo={<ErrorBoundary><AddAppointment /></ErrorBoundary>} />} />
            <Route path="/update-appointment/:id" element={<Protected roles={["Super Admin", "Clinic Admin", "Doctor", "Receptionist"]} compo={<ErrorBoundary><AddAppointment /></ErrorBoundary>} />} />

            {/* patient */}
            <Route path="/patients" element={<Protected roles={["Super Admin", "Clinic Admin", "Doctor", "Receptionist"]} compo={<ErrorBoundary><PatientTable /></ErrorBoundary>} />} />
            <Route path="/patient" element={<Protected roles={["Super Admin", "Clinic Admin", "Doctor", "Receptionist"]} compo={<ErrorBoundary><Patient /></ErrorBoundary>} />} />
            <Route path="/patient/:id" element={<Protected roles={["Super Admin", "Clinic Admin", "Doctor", "Receptionist"]} compo={<ErrorBoundary><Patient /></ErrorBoundary>} />} />

            {/* prescription */}
            <Route path="/prescription" element={<Protected roles={["Super Admin", "Clinic Admin", "Doctor"]} compo={<ErrorBoundary><Prescription /></ErrorBoundary>} />} />

            {/* Supplier */}
            <Route path="/suppliers" element={<Protected roles={["Super Admin", "Clinic Admin", "Doctor", "Receptionist"]} compo={<ErrorBoundary><Suppliers /></ErrorBoundary>} />} />
            <Route path="/add-supplier" element={<Protected roles={["Super Admin", "Clinic Admin", "Doctor", "Receptionist"]} compo={<ErrorBoundary><AddSupplier /></ErrorBoundary>} />} />
            <Route path="/update-supplier/:id" element={<Protected roles={["Super Admin", "Clinic Admin", "Doctor", "Receptionist"]} compo={<ErrorBoundary><AddSupplier /></ErrorBoundary>} />} />

          </Route>


          {/* auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="*" element={<PageNotFound />} />

        </Routes>
      </BrowserRouter >
    </ImagePreviewContext.Provider >
  </>
}


export default App