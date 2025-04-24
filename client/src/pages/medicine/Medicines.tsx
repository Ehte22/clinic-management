import { useEffect, useState } from "react";
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Loader from "../../components/Loader";
import { format } from "date-fns";
import { idbHelpers } from "../../indexDB";
import { useDebounce } from "../../utils/useDebounce";
import DataContainer, { DataContainerConfig } from "../../components/DataContainer";
import ActionsMenu from "../../components/ActionsMenu";
import Toast from "../../components/Toast";
import { Paper } from "@mui/material";
import { IMedicine } from "../../models/medicine.interface";
import { useDeleteMedicineMutation, useGetMedicinesQuery } from "../../redux/apis/medicineApi";

const Medicines = () => {

  // Hooks
  const [medicines, setMedicines] = useState<IMedicine[]>([])
  const [pagination, setPagination] = useState<{ page: number, pageSize: number }>({ page: 0, pageSize: 10 })
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedClinic, setSelectedClinic] = useState<string>("");

  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  const config: DataContainerConfig = {
    pageTitle: "Medicines",
    showAddBtn: true,
    showRefreshButton: true,
    showSearchBar: true,
    showSelector: true,
    onSearch: setSearchQuery,
    onSelect: setSelectedClinic
  }

  // Queries and Mutations
  const { data, isLoading, isSuccess } = useGetMedicinesQuery({
    page: pagination.page + 1,
    limit: pagination.pageSize,
    searchQuery: debouncedSearchQuery.toLowerCase(),
    selectedClinic
  })
  const [deleteMedicine, { data: message, isSuccess: isDeleteSuccess }] = useDeleteMedicineMutation()

  const columns: GridColDef[] = [
    { field: 'serialNo', headerName: 'Sr. No.', minWidth: 70, flex: 0.4 },
    { field: 'medicineName', headerName: 'Name', minWidth: 170, flex: 1 },
    { field: 'category', headerName: 'Category', minWidth: 170, flex: 1 },
    { field: 'mg', headerName: 'MG', minWidth: 150, flex: 0.8 },
    { field: 'price', headerName: 'Price', minWidth: 120, flex: 0.8 },
    { field: 'stock', headerName: 'Stock', minWidth: 120, flex: 0.8 },
    {
      field: 'expiryDate', headerName: 'Expiry Date', minWidth: 150, flex: 0.7,
      valueGetter: (_, row) => {
        const expiryDate = format(new Date(row.expiryDate), "dd-MM-yyyy")
        return expiryDate
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      minWidth: 100,
      flex: 0.6,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        return <>
          <ActionsMenu id={params.row._id} deleteAction={deleteMedicine} />
        </>
      }
    }
  ];

  const fetchData = async () => {
    const offlineData = await idbHelpers.getAll({ storeName: "medicines" });
    if (isSuccess && navigator.onLine) {
      const medicines = data.result.map((item, index) => {
        return { ...item, serialNo: index + 1 }
      })
      await idbHelpers.saveAll({ storeName: "medicines", data: medicines });
      setMedicines(medicines);
    } else if (!navigator.onLine) {
      setMedicines(offlineData);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isSuccess, data]);

  if (isLoading) {
    return <Loader />
  }

  return <>
    {isDeleteSuccess && <Toast type='success' message={message as string} />}
    <DataContainer config={config} />
    <Paper sx={{ width: '100%', mt: 2 }}>
      <DataGrid
        rows={medicines}
        columns={columns}
        loading={isLoading}
        rowCount={data?.pagination.totalEntries || 0}
        paginationMode='server'
        pageSizeOptions={[5, 10, 20, 50]}
        paginationModel={{ page: pagination.page, pageSize: pagination.pageSize }}
        getRowId={(row) => row._id}
        onPaginationModelChange={(params) => {
          setPagination({ page: params.page, pageSize: params.pageSize })
        }}
        sx={{ border: 0 }}
      />
    </Paper >
  </>
}

export default Medicines