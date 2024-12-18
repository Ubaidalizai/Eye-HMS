import React, { useState, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table';
import Pagination from '../components/Pagination';

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
          `http://localhost:4000/api/v1/move-product?page=${currentPage}&limit=${limit}&search=${globalFilter}`,
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
    state: { pagination: { currentPage, limit }, globalFilter },
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
          type='text'
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
  );
}
