import { useNavigate } from "react-router-dom"
import { useGetClinicsQuery, useUpdateClinicStatusMutation } from "../../redux/apis/clinic.api"
import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { toast } from "../../utils/toast";
import TableData from "../../components/TableData";
import Loader from "../../components/Loader";
import { format } from "date-fns";
import { idbHelpers } from "../../indexDB";
import { IClinic } from "../../models/clinic.interface";
import { useDebounce } from "../../utils/useDebounce";

const columns: ColumnDef<any>[] = [
    {
        header: "Name",
        accessorKey: "name",
        cell: (info) => info.getValue(),
    },
    {
        header: "Phone Number",
        accessorKey: "contactInfo",
        cell: (info) => info.getValue(),
    },
    {
        header: "City",
        accessorKey: "city",
        cell: (info) => info.getValue(),
    },
    {
        header: "End Date",
        cell: (info) => {
            const row = info.row.original
            const formattedDate = format(new Date(row.endDate), "dd-MM-yyyy");
            return formattedDate
        },
    },
    {
        header: "Status",
        accessorKey: "status",
        cell: (info) => {
            const row = info.row.original
            const [updateClinicStatus, { data, error, isSuccess, isError }] = useUpdateClinicStatusMutation()

            const updateStatus = () => {
                const status = row.status === "active" ? "inactive" : "active"
                if (!navigator.onLine) {
                    toast.showInfo("You are offline")
                } else {
                    updateClinicStatus({ status, id: row._id })
                }
            }

            useEffect(() => {
                if (isSuccess) {
                    toast.showSuccess(data)
                }

                if (isError) {
                    toast.showError(error as string)
                }
            }, [data, error, isSuccess, isError])

            return (
                <button
                    onClick={updateStatus}
                    className={
                        row.status === "active"
                            ? "inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20"
                            : "inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20"
                    }
                >
                    {row.status === "active" && "Active"}
                    {row.status === "inactive" && "Inactive"}
                </button>
            );
        },
    },
    {
        header: "Actions",
        cell: (info) => {
            const row = info.row.original;
            const navigate = useNavigate()

            return (
                <button
                    className="text-indigo-600 hover:text-indigo-900"
                    onClick={() => navigate(`/update-clinic/${row._id}`)}
                >
                    Edit
                </button>
            );
        },
    },
];

const Clinics = () => {

    // Hooks
    const [pagination, setPagination] = useState<{ pageIndex: number, pageSize: number }>({ pageIndex: 0, pageSize: 10 });
    const [searchQuery, setSearchQuery] = useState("");
    const [tableData, setTableData] = useState<IClinic[]>([])
    const navigate = useNavigate()
    const debouncedSearchQuery = useDebounce(searchQuery, 500)

    // Queries and Mutations
    const { data, isLoading, isSuccess } = useGetClinicsQuery({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        searchQuery: debouncedSearchQuery.toLowerCase()
    })

    const fetchData = async () => {
        const offlineData = await idbHelpers.getAll({ storeName: "clinics" });
        if (isSuccess && navigator.onLine) {
            await idbHelpers.saveAll({ storeName: "clinics", data: data.result });
            setTableData(data?.result);
        } else if (!navigator.onLine) {
            setTableData(offlineData);
        }
    };

    useEffect(() => {
        fetchData();
    }, [isSuccess, data]);

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen -mt-20">
            <Loader size={16} />
        </div>
    }

    return <>

        <div>
            <div className="sm:flex items-center justify-center">
                <div className="sm:flex-auto">
                    <h2 className="text-lg font-bold text-gray-900">Clinics</h2>
                </div>
                <div className="mt-4 sm:ml-16 sm:mt-0 flex justify-between gap-5">

                    <input
                        type="text"
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search..."
                        className="block w-80 h-10 rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                    />
                    <button
                        type="button"
                        className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        onClick={() => navigate("/add-clinic")}
                    >
                        Add
                    </button>
                </div>
            </div>

            <div className="mt-8 flow-root">
                <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">

                        <TableData
                            data={tableData}
                            columns={columns}
                            enableSorting={true}
                            enableGlobalFilter={true}
                            initialPagination={pagination}
                            totalRows={data?.totalPages || 0}
                            onPaginationChange={setPagination}
                            onGlobalFilterChange={searchQuery}
                            totalPages={data?.totalPages}
                        />

                    </div>
                </div>
            </div>
        </div >
    </>
}

export default Clinics