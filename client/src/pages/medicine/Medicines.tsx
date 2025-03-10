import { useEffect, useState } from "react"
import { Medicine, useGetAllMedicinesQuery } from "../../redux/apis/medicineApi"
// import ReusableTable from "../ReusableTable"
import { ColumnDef } from "@tanstack/react-table"
import TableData from "../../components/TableData"
import { useNavigate } from "react-router-dom"
import Loader from "../../components/Loader"
import { format } from "date-fns"
import { idbHelpers } from "../../indexDB"
import { useDebounce } from "../../utils/useDebounce"
import ClinicSelector from "../../components/ClinicSelector"
import { useSelector } from "react-redux"
import { RootState } from "../../redux/store"


const Medicines = () => {
  const navigate = useNavigate()
  const [filter, setFilter] = useState("")
  const [tableData, setTableData] = useState<Medicine[]>([])
  const [selectedClinicId, setSelectedClinicId] = useState("")
  const debouncedSearchQuery = useDebounce(filter, 500)
  const { user } = useSelector<RootState, any>(state => state.auth)
  const [page, setPage] = useState({ pageIndex: 0, pageSize: 10 })
  const { data, isLoading, isSuccess } = useGetAllMedicinesQuery({
    page: page.pageIndex + 1,
    limit: page.pageSize,
    filter: debouncedSearchQuery.toLowerCase(),
    selectedClinicId
  })

  const fetchData = async () => {
    const offlineData = await idbHelpers.getAll({ storeName: "medicines" });
    if (isSuccess && navigator.onLine) {
      await idbHelpers.saveAll({ storeName: "medicines", data: data.result });
      setTableData(data?.result);
    } else if (!navigator.onLine) {
      setTableData(offlineData);
    }
  };


  const columns: ColumnDef<any>[] = [
    {
      header: "Medicine Name",
      accessorKey: "medicineName",
      cell: (info) => info.getValue(),
      // enableSorting:true,
    },

    {
      header: "Category",
      accessorKey: "category",
      cell: (info) => info.getValue(),
    },
    {
      header: "MG",
      accessorKey: "mg",
      cell: (info) => info.getValue(),
    },
    {
      header: "Price",
      accessorKey: "price",
      cell: (info) => info.getValue(),
    },
    {
      header: "Stock",
      accessorKey: "stock",
      cell: (info) => info.getValue(),
    },
    {
      header: "Expiry",
      cell: (info) => {
        const row = info.row.original
        return format(new Date(row.expiryDate), "dd-MM-yyyy")
      }
    },

    {
      header: "Actions",
      cell: (info) => {
        const row = info.row.original;
        const navigate = useNavigate()

        return (
          <button
            className="text-indigo-600 hover:text-indigo-900"
            onClick={() => navigate(`/update-medicine/${row._id}`)}
          >
            Edit
          </button>
        );
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

  return <div>

    <div >
      <div className="grid grid-cols-1 sm:grid-cols-12  md:items-center">
        <div className="sm:col-span-3 xl:col-span-5">
          <h2 className="text-lg font-bold text-gray-900">Medicines</h2>
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
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder="Search..."
                  className="block w-full h-10 rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
                <button
                  type="button"
                  className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  onClick={() => navigate("/add-medicine")}
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
              enableGlobalFilter={true}
              initialPagination={page}
              onPaginationChange={setPage}
              onGlobalFilterChange={filter}
              totalPages={data?.pagination.totalPages}
              totalRows={data?.pagination.total || 0}


            />

          </div>
        </div>
      </div>
      {/* <div className="mt-10">

 </div> */}
    </div>
  </div>
}

export default Medicines
