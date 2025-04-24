import { useEffect, useState } from "react";
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Loader from "../../components/Loader";
import { format } from "date-fns";
import { idbHelpers } from "../../indexDB";
import { IClinic } from "../../models/clinic.interface";
import { useDebounce } from "../../utils/useDebounce";
import DataContainer, { DataContainerConfig } from "../../components/DataContainer";
import ActionsMenu from "../../components/ActionsMenu";
import Toast from "../../components/Toast";
import { Chip, Paper, Stack } from "@mui/material";
import { useGetClinicsQuery, useUpdateClinicStatusMutation } from "../../redux/apis/clinic.api";

const Clinics = () => {

    // Hooks
    const [clinics, setClinics] = useState<IClinic[]>([])
    const [pagination, setPagination] = useState<{ page: number, pageSize: number }>({ page: 0, pageSize: 10 })
    const [searchQuery, setSearchQuery] = useState("");

    const debouncedSearchQuery = useDebounce(searchQuery, 500)

    const config: DataContainerConfig = {
        pageTitle: "Clinics",
        showAddBtn: true,
        showRefreshButton: true,
        showSearchBar: true,
        onSearch: setSearchQuery,
    }

    // Queries and Mutations
    const { data, isLoading, isSuccess } = useGetClinicsQuery({
        page: pagination.page + 1,
        limit: pagination.pageSize,
        searchQuery: debouncedSearchQuery.toLowerCase()
    })
    const [updateStatus, { data: statusMessage, error: statusError, isSuccess: statusUpdateSuccess, isError: statusUpdateError }] = useUpdateClinicStatusMutation()

    const columns: GridColDef[] = [
        { field: 'serialNo', headerName: 'Sr. No.', minWidth: 70, flex: 0.4 },
        { field: 'name', headerName: 'Name', minWidth: 200, flex: 1 },
        { field: 'contactInfo', headerName: 'Phone Number', minWidth: 170, flex: 1 },
        { field: 'city', headerName: 'City', minWidth: 200, flex: 1 },
        {
            field: 'endData', headerName: 'Expiry Date', minWidth: 150, flex: 0.7,
            valueGetter: (_, row) => {
                const expiryDate = format(new Date(row.endDate), "dd-MM-yyyy")
                return expiryDate
            }
        },
        {
            field: 'status', headerName: 'Status', minWidth: 150, flex: 0.8,
            renderCell: (params) => {
                const handleStatusChange = () => {
                    updateStatus({ id: params.row._id, status: params.value === "active" ? "inactive" : "active" })
                };
                return <>
                    <Stack direction="row" sx={{ height: "100%", display: "flex", alignItems: "center" }} >
                        <Chip
                            label={params.value === "active" ? "Active" : "Inactive"}
                            color={params.value === "active" ? "success" : "error"}
                            variant="outlined"
                            onClick={handleStatusChange}
                            sx={{ borderRadius: 1 }} />
                    </Stack>
                </>
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
                    <ActionsMenu id={params.row._id} showDelete={false} />
                </>
            }
        }
    ];

    const fetchData = async () => {
        const offlineData = await idbHelpers.getAll({ storeName: "clinics" });
        if (isSuccess && navigator.onLine) {
            const clinics = data.result.map((item, index) => {
                return { ...item, serialNo: index + 1 }
            })
            await idbHelpers.saveAll({ storeName: "clinics", data: clinics });
            setClinics(clinics);
        } else if (!navigator.onLine) {
            setClinics(offlineData);
        }
    };

    useEffect(() => {
        fetchData();
    }, [isSuccess, data]);

    if (isLoading) {
        return <Loader />
    }

    return <>
        {statusUpdateSuccess && <Toast type="success" message={statusMessage} />}
        {statusUpdateError && <Toast type="error" message={statusError as string} />}

        <DataContainer config={config} />
        <Paper sx={{ width: '100%', mt: 2 }}>
            <DataGrid
                rows={clinics}
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

export default Clinics