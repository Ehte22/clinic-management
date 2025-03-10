import { useEffect, useState } from 'react'
import { IData, useDeleteAppointmentMutation, useSearchAppointmentsQuery } from '../../redux/apis/appointment.api'
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import TableData from '../../components/TableData';
import { useNavigate } from 'react-router-dom';
import Loader from '../../components/Loader';
import { idbHelpers } from '../../indexDB';
import { useDebounce } from '../../utils/useDebounce';
import ClinicSelector from '../../components/ClinicSelector';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';

const Appointment = () => {

    const [searchQuery, setSearchQuery] = useState("");
    const [tableData, setTableData] = useState<any[]>([])
    const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
    const debouncedSearchQuery = useDebounce(searchQuery, 500)
    const [selectedClinicId, setSelectedClinicId] = useState("")

    const { data: searchData, isLoading, isSuccess } = useSearchAppointmentsQuery({
        query: debouncedSearchQuery.toLowerCase(),
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        selectedClinicId
    })

    const { user } = useSelector<RootState, any>(state => state.auth)

    const [deleteAppointment] = useDeleteAppointmentMutation()
    const navigate = useNavigate()

    const fetchData = async () => {
        const offlineData = await idbHelpers.getAll({ storeName: "appointments" });

        if (isSuccess && navigator.onLine) {
            await idbHelpers.saveAll({ storeName: "appointments", data: searchData.result });
            setTableData(searchData?.result);
        } else if (!navigator.onLine) {
            setTableData(offlineData);
        }
    };

    const handleDelete = async (id: string) => {
        if (navigator.onLine) {
            deleteAppointment(id)
        } else {
            idbHelpers.delete({ storeName: "appointments", _id: id, endpoint: "appointment/delete" })

            const offlineData = await idbHelpers.getAll({ storeName: "appointments" });
            setTableData(offlineData)
        }
    }



    const columns: ColumnDef<IData>[] = [
        {
            accessorKey: 'patient.name',
            cell: (info) => info.getValue(),
            header: 'Patient Name',
        },
        {
            accessorKey: 'patient.email',
            cell: (info) => info.getValue(),
            header: 'Patient Email',
        },
        {
            accessorKey: 'patient.contactInfo',
            cell: (info) => info.getValue(),
            header: 'Patient mobile',
        },
        {
            header: "Doctor Name",
            accessorKey: "doctor.doctor.firstName",
            cell: (info) => {
                const row = info.row.original;
                return `${row.doctor.doctor.firstName} ${row.doctor.doctor.lastName}`;
            },
        },

        {
            header: "Time Slot",
            accessorKey: "timeSlot",
            cell: (info) => {
                const row = info.row.original;
                return `From: ${row.timeSlot.from} To: ${row.timeSlot.to}`;
            },
            enableSorting: false
        },

        {
            accessorKey: 'status',
            cell: (info) => info.getValue(),
            header: 'Status',
        },
        {
            accessorKey: 'action',
            header: 'Actions',
            cell: (info) => {
                const row = info.row.original

                const navigate = useNavigate()

                return <>
                    <div>
                        <button
                            className="text-indigo-600 hover:text-indigo-900"
                            onClick={() => navigate(`/update-appointment/${row._id}`)}
                        >
                            Edit
                        </button>

                        <button
                            onClick={() => handleDelete(row._id)}
                            className="text-red-600 hover:text-red-800 ms-5"
                        >
                            Delete
                        </button>
                    </div>
                </>
            }
        },

    ]

    useEffect(() => {
        fetchData();
    }, [isSuccess, searchData]);

    // useEffect(() => {
    //     if (deleteSuccess) {
    //         toast.showSuccess("Delete Appointment Success")
    //     }

    // }, [isSuccess])


    if (isLoading) {
        return <div className="flex justify-center items-center h-screen -mt-20">
            <Loader size={16} />
        </div>
    }

    return <>
        <div>

            <div className="grid grid-cols-1 sm:grid-cols-12  md:items-center">
                <div className="sm:col-span-3 xl:col-span-5">
                    <h2 className="text-lg font-bold text-gray-900">Appointments</h2>
                </div>
                <div className="sm:col-span-9 xl:col-span-7">
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-x-5">
                        <div className="sm:col-span-5 md:col-span-5 mt-4 sm:mt-0">
                            {
                                user && user.role === "Super Admin" && <div className="mb-5 md:mb-0">
                                    <ClinicSelector setSelected={setSelectedClinicId} />
                                </div>
                            }
                        </div>
                        <div className="sm:col-span-7 md:col-span-7">
                            <div className="flex items-center gap-5">
                                <input
                                    type="text"
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search..."
                                    className="block w-full h-10 rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                />
                                <button
                                    type="button"
                                    className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                    onClick={() => navigate("/add-appointment")}
                                >
                                    Add
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <div className="mt-8">
                <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">

                        <TableData<IData>
                            data={tableData}
                            columns={columns}
                            enableSorting={true}
                            enableGlobalFilter={true}
                            initialPagination={pagination}
                            onPaginationChange={setPagination}
                            onGlobalFilterChange={searchQuery}
                            totalPages={searchData?.pagination?.totalPages}
                        />
                    </div>
                </div>
            </div>

        </div>
    </>
}

export default Appointment
