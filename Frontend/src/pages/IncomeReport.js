import React, { useState, useEffect } from 'react';
import { MdOutlineDeleteOutline } from 'react-icons/md';
import { FaPlus, FaRegEdit, FaTrash } from 'react-icons/fa';
import { HiSearch } from 'react-icons/hi';
import Pagination from '../components/Pagination';
import IncomeModal from '../components/IncomeModal';

const categories = ['drug', 'sunglasses', 'glass', 'frame', 'other'];

export default function IncomeReport() {
  const [income, setIncome] = useState([]);
  const [newIncome, setNewIncome] = useState({
    totalNetIncome: '',
    date: '',
    description: '',
    category: '',
  });
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchIncome();
  }, [currentPage, selectedCategory, searchTerm, limit]);

  const fetchIncome = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `http://localhost:4000/api/v1/income?page=${currentPage}&limit=${limit}&fieldName=date&searchTerm=${searchTerm}&category=${selectedCategory}`,
        { credentials: 'include' }
      );

      if (!response.ok) throw new Error(`Error: ${response.status}`);

      const data = await response.json();
      setIncome(data.data.results);
      setTotalPages(data.totalPages || Math.ceil(data.results / limit));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    setIsLoading(true);
    setError(null);

    try {
      const url = formData._id
        ? `http://localhost:4000/api/v1/income/${formData._id}`
        : 'http://localhost:4000/api/v1/income';

      const response = await fetch(url, {
        method: formData._id ? 'PATCH' : 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save income');

      setShowModal(false);
      fetchIncome();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const editIncome = (income) => {
    setNewIncome(income);
    setShowModal(true);
  };

  const deleteIncome = async (id) => {
    if (!window.confirm('Are you sure you want to delete this income?')) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `http://localhost:4000/api/v1/income/${id}`,
        { method: 'DELETE', credentials: 'include' }
      );

      if (!response.ok) throw new Error('Failed to delete income');

      fetchIncome();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='container mx-auto'>
      <h2 className='font-semibold text-xl'> Income List</h2>
      <div className='border sm:rounded-lg my-10 '>
        <div className='flex flex-row items-center justify-between my-5'>
          <div className='flex items-center justify-center z-0'>
            <HiSearch className='translate-x-7 text-gray-400' size={20} />
            <input
              type='date'
              placeholder='Search by date'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='pl-10 pr-4 py-2 border border-gray-300 rounded w-64 focus:outline-none focus:ring-1 focus:ring-blue-500 h-9'
            />
          </div>
          <button
            className='inline-flex items-center px-5 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none mr-6 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
            onClick={() => {
              setNewIncome({
                totalNetIncome: '',
                date: '',
                description: '',
                category: '',
              });
              setShowModal(true);
            }}
          >
            <FaPlus className='mr-2' /> Add Income
          </button>
        </div>

        {isLoading && <p>Loading...</p>}
        {error && <p className='text-red-500'>{error}</p>}

        <table className='w-full text-sm text-left text-gray-500'>
          <thead className='text-xs text-gray-700 uppercase bg-gray-50'>
            <tr>
              <th className='px-5 py-3 font-bold tracking-wider'>
                Total Net Income
              </th>
              <th className='px-5 py-3 font-bold tracking-wider'>Date</th>
              <th className='px-5 py-3 font-bold tracking-wider'>
                Description
              </th>
              <th className='px-5 py-3 font-bold tracking-wider'>Category</th>
              <th className='px-5 py-3 font-bold tracking-wider'>Actions</th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {income.map((item) => (
              <tr key={item._id} className='hover:bg-gray-50'>
                <td className='px-6 py-4 whitespace-nowrap text-gray-900'>
                  {item.totalNetIncome}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-gray-700'>
                  {item.date.split('T')[0]}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-gray-700'>
                  {item.description}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-gray-700'>
                  {item.category}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                  <div className='flex space-x-2'>
                    <button
                      onClick={() => deleteIncome(item._id)}
                      className='font-medium text-red-600 hover:text-red-700'
                    >
                      <FaTrash className='w-5 h-5' />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        totalItems={income.length}
        totalPagesCount={totalPages}
        itemsPerPage={limit}
        currentPage={currentPage}
        onPageChange={(page) => setCurrentPage(page)}
        onLimitChange={(limit) => setLimit(limit)}
      />

      <IncomeModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        initialData={newIncome}
        categories={categories}
      />
    </div>
  );
}
