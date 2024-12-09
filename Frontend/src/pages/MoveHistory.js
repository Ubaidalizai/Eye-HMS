import React, { useState, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table';

export default function MoveHistory() {
  const [data, setData] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState('');

  // Fetch data dynamically
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `http://localhost:4000/api/v1/move-product?fieldName=date&page=${
            pageIndex + 1
          }&pageSize=${pageSize}&searchTerm=${globalFilter}`,
          {
            method: 'GET',
            credentials: 'include',
          }
        );
        const result = await response.json();
        console.log(result);
        setData(result.data.results);
        setTotalPages(result.totalPages);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [pageIndex, pageSize, globalFilter]);

  const columns = React.useMemo(
    () => [
      { accessorKey: 'inventory_id.name', header: 'Name' },
      { accessorKey: 'quantity_moved', header: 'Quantity Moved' },
      {
        accessorKey: 'moved_by', // This should match the key in your data
        header: 'Moved By',
        cell: ({ row }) => {
          const { firstName, lastName } = row.original.moved_by;
          return `${firstName} ${lastName}`;
        },
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
    state: { pagination: { pageIndex, pageSize }, globalFilter },
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className='p-6 bg-gray-100 min-h-screen'>
      <h1 className='text-4xl font-bold text-center text-blue-800 mb-8'>
        Move History
      </h1>
      {/* Filter Input */}
      <div className='mb-4'>
        <input
          type='date'
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder='Search...'
          className='w-full p-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300'
        />
      </div>
      <div className='overflow-x-auto shadow rounded-lg bg-white'>
        {isLoading ? (
          <div className='text-center py-4'>Loading...</div>
        ) : (
          <table className='min-w-full border-collapse border border-gray-200'>
            <thead className='bg-blue-600 text-white'>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className='px-4 py-2 border border-gray-300 text-left font-semibold'
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
            <tbody className='bg-white'>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className='hover:bg-gray-100 transition duration-150'
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className='px-4 py-2 border border-gray-300'
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {/* Pagination Controls */}
        <div className='flex justify-between items-center p-4'>
          <button
            onClick={() => setPageIndex((prev) => Math.max(prev - 1, 0))}
            disabled={pageIndex === 0 || isLoading}
            className='bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400'
          >
            Previous
          </button>
          <div>
            Page {pageIndex + 1} of {totalPages}
          </div>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className='p-2 border rounded-md'
          >
            {[5, 10, 20].map((size) => (
              <option key={size} value={size}>
                Show {size}
              </option>
            ))}
          </select>
          <button
            onClick={() =>
              setPageIndex((prev) => (prev < totalPages - 1 ? prev + 1 : prev))
            }
            disabled={pageIndex >= totalPages - 1 || isLoading}
            className='bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400'
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
