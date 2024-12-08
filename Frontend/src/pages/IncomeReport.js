import React, { useState, useEffect } from 'react';
import { MdOutlineDeleteOutline } from 'react-icons/md';
import { FaPlus, FaRegEdit } from 'react-icons/fa';
import { HiSearch } from 'react-icons/hi';

const categories = ['drug', 'sunglasses', 'glass', 'frame'];

const Modal = ({ isOpen, onClose, onSubmit, newIncome, handleChange }) => {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 flex items-center justify-center z-50'>
      <div
        className='overlay absolute inset-0 bg-black opacity-50'
        onClick={onClose}
      ></div>
      <div className='relative bg-white rounded-lg shadow-xl p-6 w-full max-w-lg z-60'>
        <h3 className='text-lg font-semibold mb-4'>Add Income</h3>
        <form onSubmit={onSubmit}>
          <div className='grid gap-4 mb-4 sm:grid-cols-2'>
            <div>
              <label
                htmlFor='totalNetIncome'
                className='block mb-2 text-sm font-medium text-gray-900'
              >
                Total Net Income
              </label>
              <input
                type='number'
                name='totalNetIncome'
                id='totalNetIncome'
                className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg w-full p-2.5'
                value={newIncome.totalNetIncome}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label
                htmlFor='date'
                className='block mb-2 text-sm font-medium text-gray-900'
              >
                Date
              </label>
              <input
                type='date'
                name='date'
                id='date'
                className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg w-full p-2.5'
                value={newIncome.date}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label
                htmlFor='description'
                className='block mb-2 text-sm font-medium text-gray-900'
              >
                Description
              </label>
              <input
                type='text'
                name='description'
                id='description'
                className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg w-full p-2.5'
                value={newIncome.description}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label
                htmlFor='category'
                className='block mb-2 text-sm font-medium text-gray-900'
              >
                Category
              </label>
              <select
                name='category'
                id='category'
                className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg w-full p-2.5'
                value={newIncome.category}
                onChange={handleChange}
                required
              >
                <option value=''>Select Category</option>
                {categories.map((category, index) => (
                  <option key={index} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className='flex justify-end gap-4'>
            <button
              type='button'
              className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300'
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type='submit'
              className='px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700'
            >
              Add Income
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function IncomeReport() {
  const [income, setIncome] = useState([]);
  const [newIncome, setNewIncome] = useState({
    totalNetIncome: 0,
    date: '',
    description: '',
    category: '',
  });
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const limit = 10;

  useEffect(() => {
    fetchIncome();
  }, [currentPage, selectedCategory, searchTerm]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewIncome({ ...newIncome, [name]: value });
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const url = newIncome._id
        ? `http://localhost:4000/api/v1/income/${newIncome._id}`
        : 'http://localhost:4000/api/v1/income';

      const response = await fetch(url, {
        method: newIncome._id ? 'PATCH' : 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newIncome),
      });

      if (!response.ok) throw new Error('Failed to save income');

      setNewIncome({
        totalNetIncome: '',
        date: '',
        description: '',
        category: '',
      });
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

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className='container mx-auto px-4 py-8'>
      <h2 className='font-semibold text-xl '> Income List</h2>
      <div className='mb-8 border sm:rounded-lg'>
        <div className='flex justify-between items-center mb-4'>
          <div className='flex items-center justify-center z-0'>
            <HiSearch className=' translate-x-7 text-gray-400' size={20} />
            <input
              type='date'
              placeholder='Search by date'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='pl-10 pr-4 py-2 border border-gray-300 rounded w-64 focus:outline-none focus:ring-1 focus:ring-blue-500 h-9'
            />
          </div>
          <button
            className='inline-flex items-center px-5 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none mr-17 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
            onClick={() => setShowModal(true)}
          >
            <FaPlus className='mr-2' /> Add Income
          </button>
        </div>

        {isLoading && <p>Loading...</p>}
        {error && <p className='text-red-500'>{error}</p>}

        <table className='w-full border-collapse shadow rounded-md'>
          <thead>
            <tr className='bg-gray-50'>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider'
              >
                Total Net Income
              </th>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider'
              >
                Date
              </th>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider'
              >
                Description
              </th>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider'
              >
                Category
              </th>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider'
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {income.map((item) => (
              <tr key={item._id} className='hover:bg-gray-50'>
                <td className='border p-2'>{item.totalNetIncome}</td>
                <td className='border p-2'>{item.date.split('T')[0]}</td>
                <td className='border p-2'>{item.description}</td>
                <td className='border p-2'>{item.category}</td>
                <td className='border p-2'>
                  <button
                    onClick={() => editIncome(item)}
                    className='text-blue-600 hover:text-blue-800 mr-2'
                  >
                    <FaRegEdit />
                  </button>
                  <button
                    onClick={() => deleteIncome(item._id)}
                    className='text-red-600 hover:text-red-800'
                  >
                    <MdOutlineDeleteOutline />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className='mt-4 flex justify-between items-center'>
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className='bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-l'
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          className='bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-r'
        >
          Next
        </button>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        newIncome={newIncome}
        handleChange={handleChange}
      />
    </div>
  );
}
