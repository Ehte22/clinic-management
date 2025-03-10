import { useEffect, useState } from "react";
import { ColumnDef, PaginationState } from "@tanstack/react-table";
import TableData from "../../components/TableData";
import { useSearchDoctorQuery } from "../../redux/apis/doctor.api";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/Loader";
import { idbHelpers } from "../../indexDB";
import { useDebounce } from "../../utils/useDebounce";
import ClinicSelector from "../../components/ClinicSelector";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";



export interface IDocData {
    _id?: string;
    doctor: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        role: string;
        status: string;
        _id?: string;
    };
    clinic: {
        name: string;
        address: {
            city: string;
            state: string;
        };
    };
    bio: string,
    specialization: string;
    qualifications: string[],
    experience_years: string
    emergency_contact: number,
    schedule: {
        day: string;
        from: string;
        to: string;
    }[],
    label?: string,

}

export interface IDoctor {
    result: IDocData[],

    pagination: { totalPages: number }
}

export interface Doctor {
    result: IDocData,
    pagination: { totalPages: number }
}


const Doctor = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [tableData, setTableData] = useState<any[]>([])
    const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
    const debouncedSearchQuery = useDebounce(searchQuery, 500)
    const [selectedClinicId, setSelectedClinicId] = useState("")
    const { data, isLoading, isSuccess } = useSearchDoctorQuery({
        query: debouncedSearchQuery.toLowerCase(),
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        selectedClinicId
    });


    const { user } = useSelector<RootState, any>(state => state.auth)
    const navigate = useNavigate()

    const fetchData = async () => {
        const offlineData = await idbHelpers.getAll({ storeName: "doctors" });
        if (isSuccess && navigator.onLine) {
            await idbHelpers.saveAll({ storeName: "doctors", data: data.result });
            setTableData(data?.result);
        } else if (!navigator.onLine) {
            setTableData(offlineData);
        }
    };

    const columns: ColumnDef<any>[] = [
        {
            header: "Doctor Name",
            cell: (info) => {
                const row = info.row.original;
                return `${row.doctor?.firstName} ${row.doctor?.lastName}`;
            },
            accessorKey: "doctor.firstName",
            enableSorting: false
        },
        {
            header: "Email",
            cell: (info) => info.getValue(),
            accessorKey: "doctor.email",
        },
        {
            header: "Phone",
            cell: (info) => info.getValue(),
            accessorKey: "doctor.phone",
        },

        {
            header: "Specialization",

            cell: (info) => info.getValue(),
            accessorKey: "specialization",
        },
        {
            header: "Qualification",

            cell: (info) => info.getValue(),
            accessorKey: "qualifications",
        },
        {
            header: 'Actions',
            cell: (info) => {
                const row = info.row.original;

                return <>
                    <div>
                        <button
                            className="text-indigo-600 hover:text-indigo-900"
                            onClick={() => navigate(`/update-doctor/${row._id}`)}
                        >
                            Edit
                        </button>
                    </div>
                </>
            },

        },

    ];

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

            <div className="grid grid-cols-1 sm:grid-cols-12  md:items-center">
                <div className="sm:col-span-3 xl:col-span-5">
                    <h2 className="text-lg font-bold text-gray-900">Doctors</h2>
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
                            </div>
                        </div>
                    </div>

                </div>
            </div>



            <div className="mt-8 flow-root">
                <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">

                        <TableData
                            data={tableData}
                            columns={columns}
                            enableGlobalFilter={true}
                            onPaginationChange={setPagination}
                            initialPagination={{ pageIndex: 0, pageSize: pagination.pageSize }}
                            onGlobalFilterChange={searchQuery}
                            enableSorting={true}
                            totalPages={data?.pagination?.totalPages}
                        />
                    </div>
                </div>
            </div>

        </div>
    </>
}

export default Doctor







