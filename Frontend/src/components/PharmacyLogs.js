import React, { useEffect, useState } from 'react';
import { BASE_URL } from '../config';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Pagination from './Pagination';

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
    <div className='p-4'>
      <h2 className='text-xl font-bold mb-4'>Pharmacy Sales Logs</h2>

      <input
        type='date'
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className='mb-4 p-2 border border-gray-300 rounded w-full max-w-md'
      />
      <div className='overflow-x-auto'>
        <table className='w-full table-auto border border-collapse text-left'>
          <thead>
            <tr className='bg-gray-100'>
              <th className='p-2 border'>Amount</th>
              <th className='p-2 border'>Transferred By</th>
              <th className='p-2 border'>Date</th>
              <th className='p-2 border'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {logs?.map((log) => (
              <tr key={log._id}>
                <td className='p-2 border'>{log.amount}</td>
                <td className='p-2 border'>
                  {log.transferredBy?.firstName || 'N/A'}
                </td>
                <td className='p-2 border'>{log.date.split('T')[0]}</td>
                <td className='p-2 border space-x-2'>
                  <button
                    onClick={() => handleEdit(log)}
                    className='text-blue-600'
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(log._id)}
                    className='text-red-600'
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        totalItems={logs.length}
        totalPagesCount={totalPages}
        itemsPerPage={limit}
        currentPage={currentPage}
        onPageChange={(page) => setCurrentPage(page)}
        onLimitChange={(limit) => setLimit(limit)}
      />

      {editingLog && (
        <div className='mt-4 p-4 border rounded bg-gray-50'>
          <h3 className='font-semibold mb-2'>Edit Log Amount</h3>
          <input
            type='number'
            value={editAmount}
            onChange={(e) => setEditAmount(e.target.value)}
            className='p-2 border border-gray-300 rounded w-full max-w-xs mb-2'
          />
          <div className='space-x-2'>
            <button
              onClick={handleUpdate}
              className='bg-blue-500 text-white px-3 py-1 rounded'
            >
              Update
            </button>
            <button
              onClick={() => setEditingLog(null)}
              className='bg-gray-300 px-3 py-1 rounded'
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmacyLogs;
