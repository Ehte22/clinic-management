
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import TableData from '../TableData';
import { useDeletePatientMutation, useGetAllAllPatientQuery } from '../../redux/apis/patientApi';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from "react";
import Loader from '../Loader';
import { idbHelpers } from '../../indexDB';
import { useDebounce } from '../../utils/useDebounce';
import ClinicSelector from '../ClinicSelector';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';

const PatientTable = () => {

  const [searchQuery, setSearchQuery] = useState("");
  const [tableData, setTableData] = useState<any[]>([])
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const debouncedSearchQuery = useDebounce(searchQuery, 500)
  const [selectedClinicId, setSelectedClinicId] = useState("")

  const { user } = useSelector<RootState, any>(state => state.auth)

  const { data: searchData, isLoading, isSuccess } = useGetAllAllPatientQuery({
    search: debouncedSearchQuery.toLowerCase(),
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    selectedClinicId
  })

  const navigate = useNavigate()

  const [deletePatient] = useDeletePatientMutation()


  const fetchData = async () => {
    const offlineData = await idbHelpers.getAll({ storeName: "patients" });
    if (isSuccess && navigator.onLine) {
      await idbHelpers.saveAll({ storeName: "patients", data: searchData.result });
      setTableData(searchData?.result);
    } else if (!navigator.onLine) {
      setTableData(offlineData);
    }
  };

  const handleDelete = async (id: string) => {
    if (navigator.onLine) {
      deletePatient(id)
    } else {
      idbHelpers.delete({ storeName: "patients", _id: id, endpoint: "patient/patient-delete" })

      const offlineData = await idbHelpers.getAll({ storeName: "patients" });
      setTableData(offlineData)
    }
  }


  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'name',
      cell: (info) => info.getValue(),
      header: 'Patient Name',
    },

    {
      accessorKey: 'contactInfo',
      cell: (info) => info.getValue(),
      header: 'Patient mobile',
    },
    {
      accessorKey: 'gender',
      cell: (info) => info.getValue(),
      header: 'Gender',
    },
    {
      accessorKey: 'age',
      cell: (info) => info.getValue(),
      header: 'Age',
    },
    {
      accessorKey: 'weight',
      cell: (info) => info.getValue(),
      header: 'Weight',
    },
    // {
    //   header: "Status",
    //   accessorKey: "status",
    //   cell: (info) => {
    //     const row = info.row.original

    //   },
    // },
    {
      header: "Actions",
      cell: (info) => {
        const row = info.row.original;
        const navigate = useNavigate()

        return (
          <div>
            <button
              className="text-indigo-600 hover:text-indigo-900"
              onClick={() => navigate(`/patient/${row._id}`)}
            >
              Edit
            </button>

            <button
              onClick={() => handleDelete(info.row.original._id)}
              className="text-red-600 hover:text-red-800 ms-7"
            >
              Delete
            </button>
          </div>
        );
      },
    },

  ]

  useEffect(() => {
    fetchData();
  }, [isSuccess, searchData]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen -mt-20">
      <Loader size={16} />
    </div>
  }


  return <>
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-12 md:items-center">
        <div className="sm:col-span-3 xl:col-span-5">
          <h2 className="text-lg font-bold text-gray-900">Patients</h2>
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
                  onClick={() => navigate("/patient")}
                >
                  Add
                </button>
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
              enableSorting={true}
              onPaginationChange={setPagination}
              enableGlobalFilter={true}
              onGlobalFilterChange={searchQuery}
              initialPagination={pagination}
              totalPages={searchData?.pagination?.totalPages}
            />
          </div>
        </div>
      </div>

    </div>
  </>
}



export default PatientTable












