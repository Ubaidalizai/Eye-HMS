import React, { useState, useEffect } from "react";
import { Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import { MdOutlineDeleteOutline } from "react-icons/md";
import { FaRegEdit } from "react-icons/fa";

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

const categories = ["drug", "sunglasses", "frame"];

const monthLabels = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

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
                htmlFor='totalIncome'
                className='block mb-2 text-sm font-medium text-gray-900'
              >
                Total Income
              </label>
              <input
                type='number'
                name='totalIncome'
                id='totalIncome'
                className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg w-full p-2.5'
                value={newIncome.totalIncome}
                onChange={handleChange}
                required
              />
            </div>
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
                htmlFor='reason'
                className='block mb-2 text-sm font-medium text-gray-900'
              >
                Reason
              </label>
              <input
                type='text'
                name='reason'
                id='reason'
                className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg w-full p-2.5'
                value={newIncome.reason}
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
    totalIncome: "",
    totalNetIncome: "",
    date: "",
    reason: "",
    category: "",
  });
  const [summaryType, setSummaryType] = useState("monthly");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [summary, setSummary] = useState({
    totalIncome: [],
    totalNetIncome: [],
  });
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const limit = 10;

  useEffect(() => {
    fetchIncome();
    fetchSummary();
  }, [currentPage, selectedCategory, selectedMonth, selectedYear, summaryType]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewIncome({ ...newIncome, [name]: value });
  };

  const fetchIncome = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `http://localhost:4000/api/v1/income?page=${currentPage}&limit=${limit}&category=${selectedCategory}`,
        { credentials: "include" }
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

  const fetchSummary = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const url =
        summaryType === "monthly"
          ? `http://localhost:4000/api/v1/income/${selectedYear}/${selectedMonth}?category=${selectedCategory}`
          : `http://localhost:4000/api/v1/income/${selectedYear}?category=${selectedCategory}`;

      const response = await fetch(url, { credentials: "include" });

      if (!response.ok) throw new Error(`Error: ${response.status}`);

      const data = await response.json();
      setSummary(data.data);
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
        : "http://localhost:4000/api/v1/income";

      const response = await fetch(url, {
        method: newIncome._id ? "PATCH" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newIncome),
      });

      if (!response.ok) throw new Error("Failed to save income");

      setNewIncome({
        totalIncome: "",
        totalNetIncome: "",
        date: "",
        reason: "",
        category: "",
      });
      setShowModal(false);
      fetchIncome();
      fetchSummary();
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
    if (!window.confirm("Are you sure you want to delete this income?")) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `http://localhost:4000/api/v1/income/${id}`,
        { method: "DELETE", credentials: "include" }
      );

      if (!response.ok) throw new Error("Failed to delete income");

      fetchIncome();
      fetchSummary();
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

  const handleSummaryTypeChange = (e) => {
    setSummaryType(e.target.value);
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(Number(e.target.value));
  };

  const handleYearChange = (e) => {
    setSelectedYear(Number(e.target.value));
  };

  const getBarChartData = () => {
    const labels =
      summaryType === "yearly"
        ? monthLabels
        : Array.from({ length: 31 }, (_, i) => `Day ${i + 1}`);

    return {
      labels,
      datasets: [
        {
          label: "Total Income",
          data: summary.totalIncome || [],
          backgroundColor: "rgba(75, 192, 192, 0.6)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
        {
          label: "Total Net Income",
          data: summary.totalNetIncome || [],
          backgroundColor: "rgba(255, 99, 132, 0.6)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 1,
        },
      ],
    };
  };

  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='text-3xl font-bold mb-8'>Income Management</h1>

      <div className='mb-8'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-2xl font-semibold'>Income List</h2>
          <button
            className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
            onClick={() => setShowModal(true)}
          >
            Add Income
          </button>
        </div>

        {isLoading && <p>Loading...</p>}
        {error && <p className='text-red-500'>{error}</p>}

        <table className='w-full border-collapse border border-gray-300'>
          <thead>
            <tr className='bg-gray-100'>
              <th className='border p-2'>Amount</th>
              <th className='border p-2'>Net Amount</th>
              <th className='border p-2'>Date</th>
              <th className='border p-2'>Reason</th>
              <th className='border p-2'>Category</th>
              <th className='border p-2'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {income.map((item) => (
              <tr key={item._id} className='hover:bg-gray-50'>
                <td className='border p-2'>{item.totalIncome}</td>
                <td className='border p-2'>{item.totalNetIncome}</td>
                <td className='border p-2'>
                  {new Date(item.date).toLocaleDateString()}
                </td>
                <td className='border p-2'>{item.reason}</td>
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
      </div>

      <div className='mb-8'>
        <h2 className='text-2xl font-semibold mb-4'>Income Summary</h2>
        <div className='flex gap-4 mb-4'>
          <select
            className='border p-2 rounded'
            onChange={handleCategoryChange}
            value={selectedCategory}
          >
            <option value=''>All Categories</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>
                {category}
              </option>
            ))}
          </select>
          <select
            className='border p-2  rounded'
            onChange={handleSummaryTypeChange}
            value={summaryType}
          >
            <option value='monthly'>Monthly Summary</option>
            <option value='yearly'>Yearly Summary</option>
          </select>
          {summaryType === "monthly" && (
            <select
              className='border p-2 rounded'
              onChange={handleMonthChange}
              value={selectedMonth}
            >
              {monthLabels.map((label, index) => (
                <option key={index} value={index + 1}>
                  {label}
                </option>
              ))}
            </select>
          )}
          <input
            type='number'
            value={selectedYear}
            onChange={handleYearChange}
            min='2000'
            max={new Date().getFullYear()}
            className='border p-2 rounded'
          />
        </div>
        <Bar
          data={getBarChartData()}
          options={{
            responsive: true,
            plugins: {
              legend: { position: "top" },
              title: {
                display: true,
                text: `${
                  summaryType.charAt(0).toUpperCase() + summaryType.slice(1)
                } Summary for ${selectedCategory || "All Categories"}`,
              },
            },
          }}
        />
      </div>

      <div>
        <h2 className='text-2xl font-semibold mb-4'>Income by Category</h2>
        <div className='w-1/2 mx-auto'>
          <Doughnut
            data={{
              labels: categories,
              datasets: [
                {
                  data: categories.map((category) =>
                    income
                      .filter((inc) => inc.category === category)
                      .reduce(
                        (sum, inc) => sum + parseFloat(inc.totalIncome),
                        0
                      )
                  ),
                  backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
                },
              ],
            }}
          />
        </div>
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
