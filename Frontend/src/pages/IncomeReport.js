import { useState, useEffect } from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { HiSearch } from 'react-icons/hi';
import Select from 'react-select';
import Pagination from '../components/Pagination';
import IncomeModal from '../components/IncomeModal';
import { useAuth } from '../AuthContext';
import { BASE_URL } from '../config';

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { categories } = useAuth();

  const constantCategories = [
    'drug',
    'sunglasses',
    'glass',
    'frame',
    'oct',
    'opd',
    'laboratory',
    'bedroom',
    'ultrasound',
    'operation',
    'yeglizer',
  ];

  // Combine constant categories with dynamic ones from useAuth
  const allCategories = [
    ...constantCategories,
    ...categories.map((cat) => cat.name),
  ];

  // Convert to react-select format
  const categoryOptions = allCategories.map((cat) => ({
    label: cat,
    value: cat,
  }));

  useEffect(() => {
    fetchIncome();
  }, [currentPage, selectedCategory, searchTerm, limit]);

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(1);
  };

  const fetchIncome = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${BASE_URL}/income?page=${currentPage}&limit=${limit}&fieldName=date&searchTerm=${searchTerm}&category=${selectedCategory}`,
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
    setIsSubmitting(true); // Set submitting state to true
    setIsLoading(true);
    setError(null);

    try {
      const url = formData._id
        ? `${BASE_URL}/income/${formData._id}`
        : `${BASE_URL}/income`;

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
      setIsSubmitting(false);
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
      const response = await fetch(`${BASE_URL}/income/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to delete income');

      fetchIncome();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='container mx-auto p-4'>
      <h2 className='font-semibold text-xl mb-4'>Income List</h2>
      <div className='border sm:rounded-lg my-4 sm:my-6 overflow-hidden'>
        {/* Responsive filters and add button */}
        <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-4'>
          <div className='w-full sm:w-auto relative'>
            <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
              <HiSearch className='text-gray-400' size={20} />
            </div>
            <input
              type='date'
              placeholder='Search by date'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='pl-10 pr-4 py-2 border border-gray-300 rounded w-full sm:w-64 focus:outline-none focus:ring-1 focus:ring-blue-500 h-10'
            />
          </div>

          <div className='flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto'>
            <div className='w-full sm:w-auto'>
              <label
                htmlFor='category'
                className='block mb-1 sm:mb-0 sm:mr-2 text-sm font-medium text-gray-900'
              >
                Category
              </label>
              <Select
                id='category'
                name='category'
                options={categoryOptions}
                value={
                  categoryOptions.find(
                    (option) => option.value === selectedCategory
                  ) || null
                }
                onChange={(option) => {
                  setSelectedCategory(option ? option.value : '');
                  setCurrentPage(1);
                }}
                placeholder='Select Category'
                isClearable
                className='basic-single w-full sm:w-48'
                classNamePrefix='select'
                required
              />
            </div>

            <button
              className='inline-flex items-center justify-center px-5 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 w-full sm:w-auto mt-2 sm:mt-0'
              onClick={() => {
                setNewIncome({
                  totalNetIncome: '',
                  date: '',
                  description: '',
                  category: '',
                });
                setShowModal(true);
              }}
              disabled={showModal} // Disable the button when the modal is open
            >
              <FaPlus className='mr-2' /> Add Income
            </button>
          </div>
        </div>

        {isLoading && (
          <div className='flex justify-center p-4'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600'></div>
          </div>
        )}

        {error && (
          <div className='p-4 text-center'>
            <p className='text-red-500'>{error}</p>
          </div>
        )}

        {/* Responsive table with horizontal scroll */}
        <div className='overflow-x-auto'>
          <table className='w-full text-sm text-left text-gray-500'>
            <thead className='text-xs text-gray-700 uppercase bg-gray-50'>
              <tr>
                <th className='px-4 py-3 font-bold tracking-wider'>
                  Total Net Income
                </th>
                <th className='px-4 py-3 font-bold tracking-wider'>Date</th>
                <th className='px-4 py-3 font-bold tracking-wider'>
                  Description
                </th>
                <th className='px-4 py-3 font-bold tracking-wider'>Category</th>
                <th className='px-4 py-3 font-bold tracking-wider'>Actions</th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {income.length > 0 ? (
                income.map((item) => (
                  <tr key={item._id} className='hover:bg-gray-50'>
                    <td className='px-4 py-3 whitespace-nowrap text-gray-900'>
                      {item.totalNetIncome}
                    </td>
                    <td className='px-4 py-3 whitespace-nowrap text-gray-700'>
                      {item.date.split('T')[0]}
                    </td>
                    <td className='px-4 py-3 whitespace-nowrap text-gray-700'>
                      {item.description}
                    </td>
                    <td className='px-4 py-3 whitespace-nowrap text-gray-700'>
                      {item.category}
                    </td>
                    <td className='px-4 py-3 whitespace-nowrap text-sm font-medium'>
                      <div className='flex space-x-2'>
                        <button
                          onClick={() => deleteIncome(item._id)}
                          className='font-medium text-red-600 hover:text-red-700'
                          aria-label='Delete income'
                        >
                          <FaTrash className='w-4 h-4' />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan='5'
                    className='px-4 py-3 text-center text-gray-500'
                  >
                    No income records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Responsive pagination */}
      <div className='mt-4'>
        <Pagination
          totalItems={income.length}
          totalPagesCount={totalPages}
          itemsPerPage={limit}
          currentPage={currentPage}
          onPageChange={(page) => setCurrentPage(page)}
          onLimitChange={(limit) => setLimit(limit)}
        />
      </div>

      <IncomeModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        initialData={newIncome}
        categories={allCategories}
        isSubmitting={isSubmitting} // Pass the isSubmitting state
      />
    </div>
  );
}
