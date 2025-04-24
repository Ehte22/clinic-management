import { useEffect, useState } from "react";
import { useGetUsersQuery, useUpdateUserStatusMutation } from "../../redux/apis/user.api";
import Loader from "../../components/Loader";
import { idbHelpers } from "../../indexDB";
import { IUser } from "../../models/user.interface";
import { useDebounce } from "../../utils/useDebounce";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Chip, Paper, Stack } from "@mui/material";
import ActionsMenu from "../../components/ActionsMenu";
import DataContainer, { DataContainerConfig } from "../../components/DataContainer";
import Toast from "../../components/Toast";

const Users = () => {
    // States
    const [users, setUsers] = useState<IUser[]>([])
    const [pagination, setPagination] = useState<{ page: number, pageSize: number }>({ page: 0, pageSize: 10 })
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [selectedClinic, setSelectedClinic] = useState<string>("")

    const debouncedSearchQuery = useDebounce(searchQuery, 500)

    const config: DataContainerConfig = {
        pageTitle: "Users",
        showAddBtn: true,
        showRefreshButton: true,
        showSearchBar: true,
        showSelector: true,
        onSearch: setSearchQuery,
        onSelect: setSelectedClinic
    }

    // Queries and Mutations
    const { data, isLoading, isSuccess } = useGetUsersQuery({
        page: pagination.page + 1,
        limit: pagination.pageSize,
        searchQuery: debouncedSearchQuery.toLowerCase(),
        selectedClinic
    })
    const [updateStatus, { data: statusMessage, error: statusError, isSuccess: statusUpdateSuccess, isError: statusUpdateError }] = useUpdateUserStatusMutation()

    const columns: GridColDef[] = [
        { field: 'serialNo', headerName: 'Sr. No.', minWidth: 70, flex: 0.4 },
        {
            field: 'name', headerName: 'Name', minWidth: 200, flex: 1,
            valueGetter: (_, row) => `${row.firstName} ${row.lastName}`
        },
        { field: 'email', headerName: 'Phone Number', minWidth: 200, flex: 1 },
        { field: 'phone', headerName: 'City', minWidth: 170, flex: 1 },
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
        const offlineData = await idbHelpers.getAll({ storeName: "users" });
        if (isSuccess && navigator.onLine) {
            const users = data.result.map((item, index) => {
                return { ...item, serialNo: index + 1 }
            })
            await idbHelpers.saveAll({ storeName: "users", data: data.result });
            setUsers(users);
        } else if (!navigator.onLine) {
            setUsers(offlineData);
        }
    };

    useEffect(() => {
        fetchData();
    }, [isSuccess, data, selectedClinic]);


    if (isLoading) {
        return <Loader />
    }

    return <>
        {statusUpdateSuccess && <Toast type="success" message={statusMessage} />}
        {statusUpdateError && <Toast type="error" message={statusError as string} />}

        <DataContainer config={config} />
        <Paper sx={{ width: '100%', mt: 2 }}>
            <DataGrid
                rows={users}
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

export default Users