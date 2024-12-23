import React, { useState, useMemo } from "react";
import { useTable } from "react-table";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const peopleData = [
  {
    id: "1",
    name: "Alice",
    records: [
      { date: "2023-05-15", numOperations: 5, income: 1000, outcome: 400 },
      { date: "2023-05-16", numOperations: 4, income: 800, outcome: 300 },
    ],
  },
  {
    id: "2",
    name: "Bob",
    records: [
      { date: "2023-05-15", numOperations: 3, income: 750, outcome: 250 },
      { date: "2023-05-16", numOperations: 6, income: 1200, outcome: 600 },
    ],
  },
  {
    id: "3",
    name: "Charlie",
    records: [
      { date: "2023-05-17", numOperations: 7, income: 1500, outcome: 700 },
      { date: "2023-05-18", numOperations: 5, income: 1000, outcome: 500 },
    ],
  },
];

function Dashboard() {
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [newOutcome, setNewOutcome] = useState({ date: "", amount: "" });
  const [viewType, setViewType] = useState("Outcome");

  const handlePersonSelect = (event) => {
    const personId = event.target.value;
    const person = peopleData.find((p) => p.id === personId);
    setSelectedPerson(person || null);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewOutcome({ ...newOutcome, [name]: value });
  };

  const handleAddOutcome = () => {
    if (newOutcome.date && newOutcome.amount && selectedPerson) {
      const outcomeAmount = parseFloat(newOutcome.amount);
      const totalIncome = selectedPerson.records.reduce(
        (sum, record) => sum + record.income,
        0
      );
      const totalOutcome = selectedPerson.records.reduce(
        (sum, record) => sum + record.outcome,
        0
      );

      if (totalOutcome + outcomeAmount > totalIncome) {
        toast.error("Outcome cannot exceed total income!");
        return;
      }

      const updatedRecords = [
        ...selectedPerson.records,
        {
          date: newOutcome.date,
          numOperations: 0,
          income: 0,
          outcome: outcomeAmount,
        },
      ];

      const updatedPerson = { ...selectedPerson, records: updatedRecords };
      setSelectedPerson(updatedPerson);

      const personIndex = peopleData.findIndex(
        (p) => p.id === selectedPerson.id
      );
      if (personIndex !== -1) {
        peopleData[personIndex] = updatedPerson;
      }

      setNewOutcome({ date: "", amount: "" });
      toast.success("Outcome added successfully!");
    } else {
      toast.error("Please fill in all fields!");
    }
  };

  const columns = useMemo(
    () => [
      { Header: "Date", accessor: "date" },
      {
        Header: viewType === "Outcome" ? "Outcome ($)" : "Income ($)",
        accessor: viewType.toLowerCase(),
      },
    ],
    [viewType]
  );

  const data = useMemo(
    () =>
      selectedPerson
        ? selectedPerson.records.map((record) => ({
            date: record.date,
            [viewType.toLowerCase()]: record[viewType.toLowerCase()],
          }))
        : [],
    [selectedPerson, viewType]
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({
      columns,
      data,
    });

  const totalIncome = selectedPerson
    ? selectedPerson.records.reduce((sum, record) => sum + record.income, 0)
    : 0;
  const totalOutcome = selectedPerson
    ? selectedPerson.records.reduce((sum, record) => sum + record.outcome, 0)
    : 0;
  const netBalance = totalIncome - totalOutcome;

  return (
    <div className='max-w-4xl mx-auto p-6 bg-gray-50'>
      <ToastContainer
        position='top-right'
        autoClose={3000}
        hideProgressBar={false}
      />
      <h1 className='text-3xl font-bold text-center mb-8 text-gray-800'>
        Operations Dashboard
      </h1>

      <select
        onChange={handlePersonSelect}
        className='w-full p-3 mb-6 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
      >
        <option value=''>Select a person</option>
        {peopleData.map((person) => (
          <option key={person.id} value={person.id}>
            {person.name}
          </option>
        ))}
      </select>

      {selectedPerson && (
        <div>
          <h2 className='text-2xl font-semibold mb-4 text-gray-700'>
            {selectedPerson.name}'s Records
          </h2>
          <div className='flex justify-between mb-6 p-4 bg-white rounded-lg shadow-md'>
            <div>
              <span className='font-bold text-green-600'>Total Income:</span> $
              {totalIncome}
            </div>
            <div>
              <span className='font-bold text-red-600'>Total Outcome:</span> $
              {totalOutcome}
            </div>
            <div>
              <span className='font-bold text-blue-600'>Net Balance:</span> $
              {netBalance}
            </div>
          </div>

          <div className='mb-6 p-4 bg-white rounded-lg shadow-md'>
            <h3 className='text-xl font-semibold mb-4 text-gray-700'>
              Add New Outcome
            </h3>
            <div className='flex gap-4'>
              <input
                type='date'
                name='date'
                value={newOutcome.date}
                onChange={handleInputChange}
                className='flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
              <input
                type='number'
                name='amount'
                value={newOutcome.amount}
                onChange={handleInputChange}
                placeholder='Outcome Amount ($)'
                className='flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
              <button
                onClick={handleAddOutcome}
                className='px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50'
              >
                Add Outcome
              </button>
            </div>
          </div>

          <div className='mb-6 flex gap-4'>
            <button
              onClick={() => setViewType("Income")}
              className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                viewType === "Income"
                  ? "bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-400"
              }`}
            >
              Show Income
            </button>
            <button
              onClick={() => setViewType("Outcome")}
              className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                viewType === "Outcome"
                  ? "bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-400"
              }`}
            >
              Show Outcome
            </button>
          </div>

          <div className='overflow-x-auto'>
            <table
              {...getTableProps()}
              className='w-full bg-white rounded-lg shadow-md'
            >
              <thead>
                {headerGroups.map((headerGroup) => (
                  <tr
                    {...headerGroup.getHeaderGroupProps()}
                    className='bg-gray-100'
                  >
                    {headerGroup.headers.map((column) => (
                      <th
                        {...column.getHeaderProps()}
                        className='p-3 text-left font-semibold text-gray-600'
                      >
                        {column.render("Header")}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody {...getTableBodyProps()}>
                {rows.map((row) => {
                  prepareRow(row);
                  return (
                    <tr
                      {...row.getRowProps()}
                      className='border-t border-gray-200'
                    >
                      {row.cells.map((cell) => (
                        <td {...cell.getCellProps()} className='p-3'>
                          {cell.render("Cell")}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
