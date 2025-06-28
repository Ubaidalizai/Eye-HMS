import React, { useEffect, useState } from 'react';
import { BASE_URL } from '../config';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Pagination from "./Pagination.jsx";

const PharmacyLogs = () => {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [editingLog, setEditingLog] = useState(null);
  const [editAmount, setEditAmount] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const fetchLogs = async () => {
    try {
      const res = await fetch(
        `${BASE_URL}/pharmacy-logs?fieldName=date&searchTerm=${search}&page=${currentPage}&limit=${limit}`,
        {
          credentials: 'include',
        }
      );
      const data = await res.json();
      setLogs(data.data.results);
      setTotalPages(data.totalPages || Math.ceil(data.data.total / limit));
    } catch (err) {
      console.error('Error fetching logs:', err);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [search, currentPage, limit]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this log?')) return;
    try {
      const res = await fetch(`${BASE_URL}/pharmacy-logs/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Log deleted successfully');
      fetchLogs();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleEdit = (log) => {
    setEditingLog(log);
    setEditAmount(log.amount);
  };

  const handleUpdate = async () => {
    try {
      const res = await fetch(`${BASE_URL}/pharmacy-logs/${editingLog._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ amount: editAmount }),
      });
      if (!res.ok) throw new Error('Failed to update');
      toast.success('Log updated successfully');
      setEditingLog(null);
      fetchLogs();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className='p-4 sm:p-6 mt-4 rounded-lg border shadow-sm bg-white'>
      <h2 className='text-lg sm:text-xl font-semibold text-gray-700 mb-6'>
        Pharmacy Sales Logs
      </h2>

      <div className='mb-6'>
        <label
          htmlFor='date-filter'
          className='block text-sm font-medium text-gray-700 mb-1'
        >
          Filter by Date
        </label>
        <input
          id='date-filter'
          type='date'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className='p-2 border border-gray-300 rounded-md w-full sm:max-w-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-10'
        />
      </div>

      {/* Table with horizontal scrolling */}
      <div className='overflow-x-auto shadow-sm rounded-lg'>
        <div className='inline-block min-w-full align-middle'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-100'>
              <tr>
                <th className='px-4 sm:px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider text-left'>
                  Amount
                </th>
                <th className='px-4 sm:px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider text-left'>
                  Transferred By
                </th>
                <th className='px-4 sm:px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider text-left'>
                  Date
                </th>
                <th className='px-4 sm:px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider text-center'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {logs?.length > 0 ? (
                logs.map((log) => (
                  <tr
                    key={log._id}
                    className='hover:bg-gray-50 transition-colors'
                  >
                    <td className='px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {log.amount}
                    </td>
                    <td className='px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {log.transferredBy?.firstName || 'N/A'}
                    </td>
                    <td className='px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {log.date.split('T')[0]}
                    </td>
                    <td className='px-4 sm:px-6 py-4 whitespace-nowrap text-center'>
                      <div className='flex justify-center space-x-3'>
                        <button
                          onClick={() => handleEdit(log)}
                          className='text-blue-600 hover:bg-blue-50 p-1.5 rounded transition-colors'
                          aria-label='Edit log'
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(log._id)}
                          className='text-red-600 hover:bg-red-50 p-1.5 rounded transition-colors'
                          aria-label='Delete log'
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className='px-4 sm:px-6 py-4 text-center text-sm text-gray-500'
                  >
                    No logs found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Responsive indicator - only visible on small screens */}
        <div className='block sm:hidden text-center text-xs text-gray-500 mt-2 px-4'>
          <p>Swipe horizontally to see more data</p>
        </div>
      </div>

      <div className='mt-4'>
        <Pagination
          totalItems={logs.length}
          totalPagesCount={totalPages}
          itemsPerPage={limit}
          currentPage={currentPage}
          onPageChange={(page) => setCurrentPage(page)}
          onLimitChange={(limit) => setLimit(limit)}
        />
      </div>

      {/* Edit Modal */}
      {editingLog && (
        <div className='mt-6 p-4 sm:p-6 border rounded-lg bg-gray-50 shadow-sm'>
          <h3 className='text-lg font-medium text-gray-700 mb-4'>
            Edit Log Amount
          </h3>
          <div className='max-w-md'>
            <label
              htmlFor='edit-amount'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Amount
            </label>
            <input
              id='edit-amount'
              type='number'
              value={editAmount}
              onChange={(e) => setEditAmount(e.target.value)}
              className='p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 h-10 mb-4'
            />
            <div className='flex space-x-3'>
              <button
                onClick={handleUpdate}
                className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors'
              >
                Update
              </button>
              <button
                onClick={() => setEditingLog(null)}
                className='px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors'
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmacyLogs;
