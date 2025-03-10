import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  getPaginationRowModel,
  type ColumnDef,
  type PaginationState,
} from "@tanstack/react-table";
import { useState, useEffect } from "react";

interface TableProps<T> {
  data: T[];
  columns: ColumnDef<T, any>[];
  enableSorting?: boolean;
  enableGlobalFilter?: boolean;
  initialPagination?: PaginationState;
  onPaginationChange?: (pagination: any) => void;
  totalRows?: number;
  onSortingChange?: (sorting: any) => void;
  onGlobalFilterChange?: string
  totalPages?: number;
}

const TableData = <T,>({
  data,
  columns,
  enableSorting = true,
  enableGlobalFilter = true,
  initialPagination = { pageIndex: 0, pageSize: 10 },
  onPaginationChange,
  onSortingChange,
  onGlobalFilterChange,
  totalPages = 0,
}: TableProps<T>) => {
  const [sorting, setSorting] = useState<any>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState<PaginationState>(initialPagination);

  useEffect(() => {
    if (onPaginationChange) {
      onPaginationChange(pagination);
    }
  }, [pagination, onPaginationChange]);

  useEffect(() => {
    if (onSortingChange) {
      onSortingChange(sorting);
    }
  }, [sorting, onSortingChange]);

  useEffect(() => {
    if (onGlobalFilterChange) {
      setPagination({ ...pagination, pageIndex: 0 })
    }
  }, [onGlobalFilterChange]);

  const table = useReactTable({
    data,
    columns: [
      {
        id: 'serialNo',
        header: 'Sr.No',
        cell: ({ row }) => row.index + 1,
        enableSorting: false,

      },
      ...columns,
    ],
    manualPagination: true,
    manualFiltering: true,
    rowCount: totalPages,
    state: {
      sorting,
      globalFilter,
      pagination,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: enableGlobalFilter ? getFilteredRowModel() : undefined,
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: (row: any, columnId: any, filterValue: any) => {
      const cellValue = row.getValue(columnId);
      return String(cellValue).toLowerCase().includes(filterValue.toLowerCase());
    },
  });



  const totalPageCount = totalPages
  const currentPage = pagination.pageIndex;

  const generatePaginationButtons = () => {
    const buttons = [];

    buttons.push(
      <button
        key={1}
        onClick={() => table.setPageIndex(0)}
        disabled={currentPage === 0}
        className="px-3 py-1 mx-1 bg-gray-700 border border-gray-300 rounded-lg disabled:bg-gray-900 text-white"
      >
        1
      </button>
    );

    if (currentPage > 2) {
      buttons.push(
        <span key="left-ellipsis" className="mx-1">
          ...
        </span>
      );
    }

    const startPage = Math.max(2, currentPage);
    const endPage = totalPageCount && Math.min(totalPageCount - 1, currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => table.setPageIndex(i - 1)}
          disabled={currentPage === i - 1}
          className={`px-3 py-1 mx-1 border rounded-lg ${currentPage === i - 1 ? "bg-gray-300" : "bg-gray-100 border-gray-300"} disabled:opacity-50`}
        >
          {i}
        </button>
      );
    }

    if (currentPage < totalPageCount - 3) {
      buttons.push(
        <span key="right-ellipsis" className="mx-1">
          ...
        </span>
      );
    }

    if (totalPageCount > 1) {
      buttons.push(
        <button
          key={totalPageCount}
          onClick={() => table.setPageIndex(totalPageCount - 1)}
          disabled={currentPage === totalPageCount - 1}
          className="px-3 py-1 mx-1 bg-gray-700 border border-gray-300 rounded-lg disabled:bg-gray-900 text-white"
        >
          {totalPageCount}
        </button>
      );
    }
    return buttons;
  };

  return <>
    {
      data.length > 0
        ? <div className="font-sans">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-white">
              {table.getHeaderGroups().map((headerGroup: any) => (
                <tr
                  key={headerGroup.id}
                >
                  {headerGroup.headers.map((header: any) => (
                    <th
                      key={header.id}
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900"
                      onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                    >
                      <div className="flex items-center">
                        <span>{flexRender(header.column.columnDef.header, header.getContext())}</span>
                        {enableSorting && header.column.getCanSort() && header.column.id !== 'serialNo' && (
                          <span className="ml-1">
                            {header.column.getIsSorted() === "asc"
                              ? <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
                              </svg>

                              : header.column.getIsSorted() === "desc"
                                ? <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-3">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
                                </svg>

                                : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-3">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
                                </svg>
                            }
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {table.getRowModel().rows.map((row: any) => (
                <tr
                  key={row.id}
                >
                  {row.getVisibleCells().map((cell: any) => (
                    <td
                      key={cell.id}
                      className="pl-4 pr-3 whitespace-nowrap py-5 text-sm text-gray-500"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {/* <div className="mt-6 text-center">
            <button
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="px-4 py-2 mx-2 bg-gray-100 border border-gray-300 rounded-lg cursor-pointer disabled:opacity-50"
            >
              {"<<"}
            </button>
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-4 py-2 mx-2 bg-gray-100 border border-gray-300 rounded-lg cursor-pointer disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => table.nextPage()}
              className="px-4 py-2 mx-2 bg-gray-100 border border-gray-300 rounded-lg cursor-pointer disabled:opacity-50"
            >
              Next
            </button>
            <button
              onClick={() => table.setPageIndex(totalPages ? totalPages - 1 : 0)}
              disabled={!table.getCanNextPage()}
              className="px-4 py-2 mx-2 bg-gray-100 border border-gray-300 rounded-lg cursor-pointer disabled:opacity-50"
            >
              {">>"}
            </button>
          </div> */}

          <div className="mt-6 text-center">
            {generatePaginationButtons()}
          </div>

          <div className="text-center mt-4">
            Page <strong>{pagination.pageIndex + 1}</strong> of{" "}
            {totalPages}
          </div>
        </div>
        : <div className="text-center text-lg font-semibold">No Data Found</div>
    }
  </>
};

export default TableData;
