// import React, { useState, useEffect } from 'react';
// import { Doughnut, Bar } from 'react-chartjs-2';
// import './newManagement.css';
// import {
//   Chart as ChartJS,
//   ArcElement,
//   Tooltip,
//   Legend,
//   CategoryScale,
//   LinearScale,
//   BarElement,
// } from 'chart.js';
// import { MdOutlineDeleteOutline } from 'react-icons/md';
// import { FaRegEdit } from 'react-icons/fa';

// // Register Chart.js components
// ChartJS.register(
//   ArcElement,
//   Tooltip,
//   Legend,
//   CategoryScale,
//   LinearScale,
//   BarElement
// );

// const categories = ['drug', 'sunglasses', 'frame'];

// const monthLabels = [
//   'January',
//   'February',
//   'March',
//   'April',
//   'May',
//   'June',
//   'July',
//   'August',
//   'September',
//   'October',
//   'November',
//   'December',
// ];

// const Modal = ({ isOpen, onClose, onSubmit, newIncome, handleChange }) => {
//   return (
//     <div className="fixed inset-0 flex items-center justify-center z-50">
//       <div className="overlay" onClick={onClose}></div>
//       <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg z-60">
//         <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
//           <div className="sm:flex sm:items-start">
//             <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 strokeWidth="1.5"
//                 stroke="currentColor"
//                 className="h-6 w-6 text-blue-400"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   d="M12 4.5v15m7.5-7.5h-15"
//                 />
//               </svg>
//             </div>
//             <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
//               <h3 className="text-lg font-semibold leading-6 text-gray-900">
//                 Add Expense
//               </h3>
//               <form onSubmit={onSubmit}>
//                 <div className="grid gap-4 mb-4 sm:grid-cols-2">
//                   <div>
//                     <label
//                       htmlFor="amount"
//                       className="block mb-2 text-sm font-medium text-gray-900"
//                     >
//                       totalIncome
//                     </label>
//                     <input
//                       type="number"
//                       name="totalIncome"
//                       id="totalIncome"
//                       className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg"
//                       value={newIncome.totalIncome}
//                       onChange={handleChange}
//                       required
//                     />
//                   </div>
//                   <div>
//                     <label
//                       htmlFor="totalNetIncome"
//                       className="block mb-2 text-sm font-medium text-gray-900"
//                     >
//                       totalNetIncome
//                     </label>
//                     <input
//                       type="number"
//                       name="totalNetIncome"
//                       id="totalNetIncome"
//                       className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg"
//                       value={newIncome.totalNetIncome}
//                       onChange={handleChange}
//                       required
//                     />
//                   </div>
//                   <div>
//                     <label
//                       htmlFor="date"
//                       className="block mb-2 text-sm font-medium text-gray-900"
//                     >
//                       Date
//                     </label>
//                     <input
//                       type="date"
//                       name="date"
//                       id="date"
//                       className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5"
//                       value={newIncome.date}
//                       onChange={handleChange}
//                       required
//                     />
//                   </div>
//                 </div>
//                 <div className="grid gap-4 mb-4 sm:grid-cols-2">
//                   <div className="mt-4">
//                     <label
//                       htmlFor="reason"
//                       className="block mb-2 text-sm font-medium text-gray-900"
//                     >
//                       Reason
//                     </label>
//                     <input
//                       type="text"
//                       name="reason"
//                       id="reason"
//                       className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg"
//                       value={newIncome.reason}
//                       onChange={handleChange}
//                       required
//                     />
//                   </div>
//                   <div className="mt-4">
//                     <label
//                       htmlFor="category"
//                       className="block mb-2 text-sm font-medium text-gray-900"
//                     >
//                       Category
//                     </label>
//                     <select
//                       name="category"
//                       id="category"
//                       className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg"
//                       value={newIncome.category}
//                       onChange={handleChange}
//                       required
//                     >
//                       <option value="">Select Category</option>
//                       {categories.map((category, index) => (
//                         <option key={index} value={category}>
//                           {category}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 </div>
//                 <div className="mt-4">
//                   <button type="button" className="cancel" onClick={onClose}>
//                     Cancel
//                   </button>
//                   <button type="submit" className="UpdateBtn">
//                     Add Expense
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };
// const IncomeReport = () => {
//   const [income, setIncome] = useState([]);
//   const [newIncome, setNewIncome] = useState({
//     totalIncome: '',
//     totalNetIncome: '',
//     date: '',
//     reason: '',
//     category: '',
//   });
//   const [summaryType, setSummaryType] = useState('monthly');
//   const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
//   const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
//   const [summary, setSummary] = useState([]);
//   const [selectedCategory, setSelectedCategory] = useState('');
//   const [showForm, setShowForm] = useState(false);
//   const [showModal, setShowModal] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const limit = 10; // Number of items per page

//   useEffect(() => {
//     if (summaryType === 'monthly') {
//       fetchMonthlyIncome();
//     } else {
//       fetchYearlyIncome();
//     }
//     fetchIncome(); // Fetch paginated income for the list
//   }, [currentPage, selectedCategory, selectedMonth, selectedYear, summaryType]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setNewIncome({ ...newIncome, [name]: value });
//   };

//   const fetchIncome = async () => {
//     try {
//       const response = await fetch(
//         `http://localhost:4000/api/v1/income?page=${currentPage}&limit=${limit}`,
//         {
//           method: 'GET',
//           credentials: 'include',
//         }
//       );

//       if (!response.ok) {
//         throw new Error(`Error: ${response.status}`);
//       }

//       const data = await response.json();
//       console.log(data);
//       setIncome(data.data.results);
//       setTotalPages(data.totalPages || Math.ceil(data.results / limit));
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   const fetchMonthlyIncome = async () => {
//     try {
//       const response = await fetch(
//         `http://localhost:4000/api/v1/income/${selectedYear}/${selectedMonth}?category=${selectedCategory}`,
//         {
//           method: 'GET',
//           credentials: 'include',
//         }
//       );

//       if (!response.ok) {
//         throw new Error(`Error: ${response.status}`);
//       }

//       const data = await response.json();
//       console.log(data);
//       // Set summary to the data object directly
//       setSummary(data.data); // Now summary should be { totalIncome, totalNetIncome }
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   const fetchYearlyIncome = async () => {
//     try {
//       const response = await fetch(
//         `http://localhost:4000/api/v1/income/${selectedYear}?category=${selectedCategory}`,
//         {
//           method: 'GET',
//           credentials: 'include',
//         }
//       );

//       if (!response.ok) {
//         throw new Error(`Error: ${response.status}`);
//       }

//       const data = await response.json();
//       // Set summary to the data object directly
//       setSummary(data.data); // Now summary should be { totalIncome, totalNetIncome }
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     let baseUrl = `http://localhost:4000/api/v1/income`;
//     const url = newIncome?._id
//       ? baseUrl +
//         `/${newIncome._id}?page=${currentPage}&limit=${limit}&category=${selectedCategory}`
//       : baseUrl +
//         `?page=${currentPage}&limit=${limit}&category=${selectedCategory}`; // Update URL for editing or adding new income
//     const method = newIncome?._id ? 'PATCH' : 'POST';

//     try {
//       const response = await fetch(url, {
//         method,
//         credentials: 'include',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(newIncome),
//       });

//       if (!response.ok) {
//         throw new Error(
//           newIncome._id ? 'Failed to update income' : 'Failed to add income'
//         );
//       }

//       // Reset form and refetch income
//       setNewIncome({
//         totalIncome: '',
//         totalNetIncome: '',
//         date: '',
//         reason: '',
//         category: '',
//       });
//       setShowForm(false);
//       fetchIncome(); // Refresh the list after adding/updating
//     } catch (error) {
//       console.error('Error:', error.message);
//     }
//   };
//   const editIncome = (income) => {
//     setNewIncome(income);
//     setShowForm(true);
//   };

//   const deleteIncome = async (id) => {
//     try {
//       const response = await fetch(
//         `http://localhost:4000/api/v1/income/${id}`,
//         {
//           method: 'DELETE',
//           credentials: 'include',
//         }
//       );

//       if (!response.ok) {
//         throw new Error('Failed to delete income');
//       }

//       fetchIncome();
//     } catch (error) {
//       console.error('Error:', error.message);
//     }
//   };

//   const aggregateIncome = () => {
//     const monthlyData = Array(12).fill(0);
//     const yearlyData = {};

//     income.forEach((income) => {
//       const date = new Date(income.date);
//       const amount = parseFloat(income.amount);
//       const month = date.getMonth(); // Zero-based index
//       const year = date.getFullYear();

//       // Aggregate for yearly summary
//       if (summaryType === 'yearly') {
//         if (!yearlyData[year]) {
//           yearlyData[year] = Array(12).fill(0); // Initialize months for the year
//         }
//         yearlyData[year][month] += amount; // Sum amount for the respective month
//       }

//       // Aggregate for monthly summary
//       if (
//         summaryType === 'monthly' &&
//         month + 1 === selectedMonth &&
//         year === selectedYear
//       ) {
//         monthlyData[month] += amount; // Sum amount for the respective day
//       }
//     });

//     return summaryType === 'yearly' ? yearlyData : monthlyData;
//   };

//   const updateSummary = () => {
//     const newSummary = aggregateIncome();
//     setSummary(newSummary);
//   };

//   const handleCategoryChange = (e) => {
//     setSelectedCategory(e.target.value);
//     updateSummary();
//   };

//   const handleSummaryTypeChange = (e) => {
//     setSummaryType(e.target.value);
//     updateSummary();
//   };

//   const handleMonthChange = (e) => {
//     const month = Number(e.target.value);
//     setSelectedMonth(month);
//     updateSummary();
//   };

//   const handleYearChange = (e) => {
//     const year = Number(e.target.value);
//     setSelectedYear(year);
//     updateSummary();
//   };

//   const getBarChartData = () => {
//     let labels, incomeData, netIncomeData;

//     if (summaryType === 'yearly') {
//       labels = monthLabels;
//       // Add default empty arrays if data is undefined
//       incomeData = summary?.totalIncome || Array(12).fill(0);
//       netIncomeData = summary?.totalNetIncome || Array(12).fill(0);
//     } else {
//       // For monthly view
//       labels = Array.from({ length: 31 }, (_, i) => `Day ${i + 1}`);
//       // Add default empty arrays if data is undefined
//       incomeData = summary?.totalIncome || Array(31).fill(0);
//       netIncomeData = summary?.totalNetIncome || Array(31).fill(0);
//     }

//     return {
//       labels,
//       datasets: [
//         {
//           label: 'Total Income',
//           data: incomeData,
//           backgroundColor: 'rgba(75, 192, 192, 0.6)',
//           borderColor: 'rgba(75, 192, 192, 1)',
//           borderWidth: 1,
//         },
//         {
//           label: 'Total Net Income',
//           data: netIncomeData,
//           backgroundColor: 'rgba(255, 99, 132, 0.6)',
//           borderColor: 'rgba(255, 99, 132, 1)',
//           borderWidth: 1,
//         },
//       ],
//     };
//   };

//   return (
//     <div className="parent">
//       <h1>Expense Management</h1>

//       <div className="expense-list-detail">
//         <div className="summary-display">
//           <div className="Add-btn">
//             <h2 className="list-header">Expense List</h2>
//             <button
//               className="add-expense-button"
//               onClick={() => setShowModal(true)}
//             >
//               Add Expense
//             </button>

//             {/* Modal for adding expense */}
//             <Modal
//               isOpen={showModal}
//               onClose={() => setShowModal(false)}
//               onSubmit={handleSubmit}
//               newExpense={newIncome}
//               handleChange={handleChange}
//             />
//           </div>

//           <table className="expense-table">
//             <thead>
//               <tr>
//                 <th>Amount</th>
//                 <th>Date</th>
//                 <th>Reason</th>
//                 <th>Category</th>
//                 <th>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {income.length === 0 ? (
//                 <tr>
//                   <td>No expenses added yet.</td>
//                 </tr>
//               ) : (
//                 income.map((expense) => (
//                   <tr key={expense.id}>
//                     <td>{expense.amount}</td>
//                     <td>{new Date(expense.date).toLocaleDateString()}</td>
//                     <td>{expense.reason}</td>
//                     <td>{expense.category}</td>
//                     <td>
//                       <div className="edit-parent">
//                         <button
//                           onClick={() => editIncome(expense)}
//                           className="edit-button"
//                         >
//                           <FaRegEdit />
//                         </button>

//                         <button
//                           onClick={() => deleteIncome(expense.id)}
//                           className="edit-button"
//                         >
//                           <div className="del-icon">
//                             <MdOutlineDeleteOutline />
//                           </div>
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>

//         <div className="general-div">
//           <div className="filter-category">
//             <select
//               className="dropdown"
//               onChange={handleCategoryChange}
//               value={selectedCategory}
//             >
//               <option value="All Categories">All Categories</option>
//               {categories.map((category, index) => (
//                 <option key={index} value={category}>
//                   {category}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="summery-type">
//             <select
//               className="dropdown"
//               onChange={handleSummaryTypeChange}
//               value={summaryType}
//             >
//               <option value="monthly">Monthly Summary</option>
//               <option value="yearly">Yearly Summary</option>
//             </select>
//           </div>

//           {summaryType === 'monthly' && (
//             <div className="month-selection">
//               <select
//                 className="dropdown"
//                 onChange={handleMonthChange}
//                 value={selectedMonth}
//               >
//                 {monthLabels.map((label, index) => (
//                   <option key={index} value={index + 1}>
//                     {label}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           )}

//           {summaryType === 'yearly' && (
//             <div className="year-selection">
//               <h2 className="year-label">Select Year</h2>
//               <input
//                 className="year-input"
//                 type="number"
//                 value={selectedYear}
//                 onChange={handleYearChange}
//                 min="2000"
//                 max={new Date().getFullYear()}
//               />
//             </div>
//           )}
//         </div>

//         <div className="summary-display">
//           <h2>
//             {summaryType.charAt(0).toUpperCase() + summaryType.slice(1)} Summary
//             for {selectedCategory}
//           </h2>
//           <Bar
//             data={getBarChartData()}
//             options={{
//               responsive: true,
//               plugins: {
//                 legend: {
//                   position: 'top',
//                 },
//                 title: {
//                   display: true,
//                   text: `${
//                     summaryType.charAt(0).toUpperCase() + summaryType.slice(1)
//                   } Summary for ${selectedCategory}`,
//                 },
//               },
//             }}
//           />
//         </div>

//         <div className="chart">
//           <h2>Expense by Category</h2>
//           <div className="graph">
//             <Doughnut
//               data={{
//                 labels: categories,
//                 datasets: [
//                   {
//                     data: categories.map((category) =>
//                       income
//                         .filter((exp) => exp.category === category)
//                         .reduce((sum, exp) => sum + parseFloat(exp.amount), 0)
//                     ),
//                     backgroundColor: [
//                       '#FF6384',
//                       '#36A2EB',
//                       '#FFCE56',
//                       '#4BC0C0',
//                     ],
//                   },
//                 ],
//               }}
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };
// export default IncomeReport;
