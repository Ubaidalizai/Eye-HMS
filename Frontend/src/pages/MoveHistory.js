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
    <div className='p-4 rounded-lg border min-h-screen'>
      <h2 className='font-semibold text-xl mb-10'>Move History</h2>
      {/* Filter Input */}
      <div className='mb-4'>
        <input
          type='text'
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder='Search...'
          className='p-2 border border-gray-300 rounded w-64 focus:outline-none focus:ring-1 focus:ring-blue-500 h-9'
        />
      </div>
      <div className='overflow-x-auto shadow rounded-lg bg-white'>
        {isLoading ? (
          <div className='text-center py-4'>Loading...</div>
        ) : (
          <table className='min-w-full border-collapse border border-gray-200'>
            <thead className='text-xs text-gray-700 uppercase bg-gray-50'>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      scope='col'
                      className='px-5 py-3 font-bold tracking-wider'
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
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className='hover:bg-gray-50'>
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className='px-6 py-4 whitespace-nowrap text-gray-900'
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
