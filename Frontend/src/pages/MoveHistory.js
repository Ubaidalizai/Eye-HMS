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
          `/api/move-history?p age=${
            pageIndex + 1
          }&pageSize=${pageSize}&search=${globalFilter}`
        );
        const result = await response.json();
        setData(result.data);
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
      { accessorKey: 'Name', header: 'Name' },
      { accessorKey: 'quantity_moved', header: 'Quantity Moved' },
      { accessorKey: 'moved_by', header: 'Moved By' },
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
    <div className='p-6 min-h-screen'>
      <h1 className='text-4xl font-bold text-center text-gray-900 mb-8'>
        Move History
      </h1>
      {/* Filter Input */}
      <div className='mb-4'>
        <input
          type='text'
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder='Search...'
          className='border border-gray-300 rounded w-64 focus:outline-none focus:ring-1 focus:ring-blue-500 h-9'
        />
      </div>
      <div className='overflow-x-auto border rounded-lg bg-white'>
        {isLoading ? (
          <div className='text-center py-4'>Loading...</div>
        ) : (
          <table className='min-w-full border-collapse border border-gray-200'>
            <thead className='text-xs text-gray-700 uppercase bg-gray-100'>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      scope='col'
                      className='px-6 py-3 font-bold tracking-wider'
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
                <tr key={row.id} className='bg-white border-b hover:bg-gray-50'>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className='px-6 py-4 whitespace-nowrap'>
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
            className='pr-7 border rounded-md'
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
