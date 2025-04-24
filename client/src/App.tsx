import { BrowserRouter, Route, Routes } from "react-router-dom"
import { useEffect } from "react"
import './i18n';
import Clinics from "./pages/clinic/Clinics"
import AddClinic from "./pages/clinic/AddClinic"
import Users from "./pages/user/Users"
import AddUser from "./pages/user/AddUser"
import Medicines from "./pages/medicine/Medicines"
import Layout from "./components/Layout"
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
import Prescription from "./pages/prescription/Prescription"
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
import { ImageContextProvider } from "./context/ImageContext";
import { createTheme, ThemeProvider } from "@mui/material";
import Patients from "./pages/patient/patients";
import AddPatient from "./pages/Patient";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#FFFFFF", contrastText: "#000000" },
    secondary: { main: "#0772ed" },
  },
  // components: {
  //   MuiTypography: {
  //     styleOverrides: {
  //       root: ({ theme }) => ({
  //         color:
  //           theme.palette.mode === "dark" ? "#ffffff" : "#000000",
  //       }),
  //     },
  //   },
  // },
  breakpoints: { values: { xs: 0, sm: 600, md: 1000, lg: 1200, xl: 1536 } },
})

const App = () => {
  const dispatch = useDispatch()

  const x = localStorage.getItem("user")
  let user
  if (x) {
    user = JSON.parse(x || "")
  }

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
    <ThemeProvider theme={theme}>
      <ImageContextProvider>
        <BrowserRouter>
          <SessionExpiredModal />
          <Routes>

            {/* Super Admin */}
            <Route path="/" element={<Layout />}>

              {/* dashboards */}
              <Route index element={<Protected roles={user?.role === "Super Admin" ? ["Super Admin"] : ["Clinic Admin", "Super Admin"]}
                compo={user?.role === "Super Admin"
                  ? <ErrorBoundary><DashBoard /> </ErrorBoundary>
                  : <ErrorBoundary><ClinicAdminDashBoard /> </ErrorBoundary>} />}
              />
              <Route path="user-dashboard" element={<Protected roles={["Clinic Admin", "Super Admin"]} compo={<ErrorBoundary><ClinicAdminDashBoard /> </ErrorBoundary>} />} />
              <Route path="admin" element={<Protected roles={["Super Admin"]} compo={<ErrorBoundary><DashBoard /> </ErrorBoundary>} />} />

              {/* user */}
              <Route path="users">
                <Route index element={<Protected roles={["Super Admin"]} compo={<ErrorBoundary><Users /></ErrorBoundary>} />} />
                <Route path="add" element={<Protected roles={["Super Admin"]} compo={<ErrorBoundary><AddUser /></ErrorBoundary>} />} />
                <Route path="update/:id" element={<Protected roles={["Super Admin"]} compo={<ErrorBoundary><AddUser /></ErrorBoundary>} />} />
              </Route>

              {/* user profile */}
              <Route path="/profile/:id" element={<Protected roles={["Super Admin", "Clinic Admin", "Doctor", "Receptionist"]} compo={<ErrorBoundary><Profile /></ErrorBoundary>} />} />

              {/* clinic */}
              <Route path="clinics">
                <Route index element={<Protected roles={["Super Admin"]} compo={<ErrorBoundary><Clinics /></ErrorBoundary>} />} />
                <Route path="add" element={<Protected roles={["Super Admin"]} compo={<ErrorBoundary><AddClinic /></ErrorBoundary>} />} />
                <Route path="update/:id" element={<Protected roles={["Super Admin"]} compo={<ErrorBoundary><AddClinic /></ErrorBoundary>} />} />
              </Route>

              {/* medicine */}
              <Route path="buy-med" element={<Protected roles={["Super Admin", "Clinic Admin", "Doctor", "Receptionist"]} compo={<ErrorBoundary><SellMedicine /></ErrorBoundary>} />} />
              <Route path="medicines">
                <Route index element={<Protected roles={["Super Admin", "Clinic Admin", "Doctor", "Receptionist"]} compo={<ErrorBoundary><Medicines /></ErrorBoundary>} />} />
                <Route path="add" element={<Protected roles={["Super Admin", "Clinic Admin", "Doctor", "Receptionist"]} compo={<ErrorBoundary><AddMedicine /></ErrorBoundary>} />} />
                <Route path="update/:id" element={<Protected roles={["Super Admin", "Clinic Admin", "Doctor", "Receptionist"]} compo={<ErrorBoundary><AddMedicine /></ErrorBoundary>} />} />
              </Route>

              {/* invoice */}
              <Route path="invoices">
                <Route index element={<Protected roles={["Super Admin", "Clinic Admin", "Doctor", "Receptionist"]} compo={<ErrorBoundary><Invoice /></ErrorBoundary>} />} />
                <Route path="add" element={<Protected roles={["Super Admin", "Clinic Admin", "Doctor", "Receptionist"]} compo={<ErrorBoundary><AddInvoice /></ErrorBoundary>} />} />
                <Route path="update/:id" element={<Protected roles={["Super Admin", "Clinic Admin", "Doctor", "Receptionist"]} compo={<ErrorBoundary><AddInvoice /></ErrorBoundary>} />} />

              </Route>
              {/* receptionist */}
              <Route path="receptionists">
                <Route index element={<Protected roles={["Super Admin", "Clinic Admin", "Doctor"]} compo={<ErrorBoundary><Receptionist /></ErrorBoundary>} />} />
                <Route path="add" element={<Protected roles={["Super Admin", "Clinic Admin", "Doctor"]} compo={<ErrorBoundary><AddReceptionist /></ErrorBoundary>} />} />
                <Route path="update/:id" element={<Protected roles={["Super Admin", "Clinic Admin", "Doctor"]} compo={<ErrorBoundary><AddReceptionist /></ErrorBoundary>} />} />
              </Route>

              {/* doctor */}
              <Route path="doctors">
                <Route index element={<Protected roles={["Super Admin", "Clinic Admin"]} compo={<ErrorBoundary><Doctor /></ErrorBoundary>} />} />
                <Route path="add" element={<Protected roles={["Super Admin", "Clinic Admin"]} compo={<ErrorBoundary><AddDoctor /></ErrorBoundary>} />} />
                <Route path="update/:id" element={<Protected roles={["Super Admin", "Clinic Admin"]} compo={<ErrorBoundary><AddDoctor /></ErrorBoundary>} />} />
              </Route>

              {/* appointment */}
              <Route path="appointments">
                <Route index element={<Protected roles={["Super Admin", "Clinic Admin", "Doctor", "Receptionist"]} compo={<ErrorBoundary><Appointment /></ErrorBoundary>} />} />
                <Route path="add" element={<Protected roles={["Super Admin", "Clinic Admin", "Doctor", "Receptionist"]} compo={<ErrorBoundary><AddAppointment /></ErrorBoundary>} />} />
                <Route path="update/:id" element={<Protected roles={["Super Admin", "Clinic Admin", "Doctor", "Receptionist"]} compo={<ErrorBoundary><AddAppointment /></ErrorBoundary>} />} />
              </Route>

              {/* patient */}
              <Route path="patients">
                <Route element={<Protected roles={["Super Admin", "Clinic Admin", "Doctor", "Receptionist"]} compo={<ErrorBoundary><Patients /></ErrorBoundary>} />} />
                <Route path="add" element={<Protected roles={["Super Admin", "Clinic Admin", "Doctor", "Receptionist"]} compo={<ErrorBoundary><AddPatient /></ErrorBoundary>} />} />
                <Route path="update/:id" element={<Protected roles={["Super Admin", "Clinic Admin", "Doctor", "Receptionist"]} compo={<ErrorBoundary><AddPatient /></ErrorBoundary>} />} />
              </Route>

              {/* prescription */}
              <Route path="/prescription" element={<Protected roles={["Super Admin", "Clinic Admin", "Doctor"]} compo={<ErrorBoundary><Prescription /></ErrorBoundary>} />} />

              {/* Supplier */}
              <Route path="suppliers">
                <Route index element={<Protected roles={["Super Admin", "Clinic Admin", "Doctor", "Receptionist"]} compo={<ErrorBoundary><Suppliers /></ErrorBoundary>} />} />
                <Route path="add" element={<Protected roles={["Super Admin", "Clinic Admin", "Doctor", "Receptionist"]} compo={<ErrorBoundary><AddSupplier /></ErrorBoundary>} />} />
                <Route path="update/:id" element={<Protected roles={["Super Admin", "Clinic Admin", "Doctor", "Receptionist"]} compo={<ErrorBoundary><AddSupplier /></ErrorBoundary>} />} />
              </Route>

            </Route>


            {/* auth */}
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="*" element={<PageNotFound />} />

          </Routes>
        </BrowserRouter >
      </ImageContextProvider>
    </ThemeProvider >
  </>
}


export default App