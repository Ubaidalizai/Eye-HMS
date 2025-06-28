import React, { useState, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table';
import Pagination from "../components/Pagination.jsx";
import { BASE_URL } from '../config';

export default function MoveHistory() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch data dynamically
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `${BASE_URL}/move-product?page=${currentPage}&limit=${limit}&search=${globalFilter}`,
          {
            credentials: 'include',
          }
        );
        const data = await response.json();
        setData(data.data.results);
        setTotalPages(data.totalPages || Math.ceil(data.results / limit));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentPage, limit, globalFilter]);

  const columns = React.useMemo(
    () => [
      { accessorKey: 'inventory_id.name', header: 'productName' },
      { accessorKey: 'quantity_moved', header: 'Quantity Moved' },
      {
        accessorKey: 'moved_by',
        header: 'Moved By',
        cell: (data) =>
          `${data.getValue()?.firstName} ${data.getValue()?.lastName}`,
      },
      { accessorKey: 'category', header: 'Category' },
      {
        accessorKey: 'date_moved',
        header: 'Date Moved',
        cell: (info) =>
          new Date(info.getValue()).toLocaleString('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short',
          }),
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    pageCount: totalPages,
    manualPagination: true,
    state: { pagination: { currentPage, limit }, globalFilter },
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className='p-4 sm:p-6 mt-4 mb-5 rounded-lg border shadow-sm bg-white'>
      <h2 className='font-semibold text-lg sm:text-xl text-gray-700 mb-6'>
        Move History
      </h2>

      {/* Filter Input */}
      <div className='mb-6'>
        <label
          htmlFor='move-history-search'
          className='block text-sm font-medium text-gray-700 mb-1'
        >
          Search Move History
        </label>
        <div className='relative'>
          <input
            id='move-history-search'
            type='text'
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder='Search by product name, category...'
            className='p-2 pl-3 border border-gray-300 rounded-md w-full sm:max-w-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-10'
          />
        </div>
      </div>

      {/* Table with horizontal scrolling */}
      <div className='overflow-x-auto shadow-sm rounded-lg'>
        {isLoading ? (
          <div className='flex justify-center items-center py-10'>
            <div className='animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500'></div>
            <p className='ml-3 text-gray-600'>Loading...</p>
          </div>
        ) : (
          <div className='inline-block min-w-full align-middle'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-100'>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        scope='col'
                        className='px-4 sm:px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider text-left'
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className='hover:bg-gray-50 transition-colors'
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className='px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500'
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className='px-4 sm:px-6 py-4 text-center text-sm text-gray-500'
                    >
                      No records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Responsive indicator - only visible on small screens */}
        <div className='block sm:hidden text-center text-xs text-gray-500 mt-2 px-4'>
          <p>Swipe horizontally to see more data</p>
        </div>

        <div className='mt-4'>
          <Pagination
            totalItems={data.length}
            totalPagesCount={totalPages}
            itemsPerPage={limit}
            currentPage={currentPage}
            onPageChange={(page) => setCurrentPage(page)}
            onLimitChange={(limit) => setLimit(limit)}
          />
        </div>
      </div>
    </div>
  );
}
