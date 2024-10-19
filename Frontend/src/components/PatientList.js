import React, { useState, useMemo } from "react";
import { useTable } from "react-table";
import { Link } from "react-router-dom";

const PatientList = ({
  patients,
  columns,
  handleEdit,
  handlePrescriptionClick,
  addPrescription,
}) => {
  // Add any additional state or memoized values here
  const enhancedColumns = useMemo(
    () => [
      ...columns,
      {
        Header: "Actions",
        Cell: ({ row }) => (
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button
              onClick={() => handleEdit(row.original)}
              style={{
                padding: "6px 12px",
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                marginRight: "10px",
              }}
            >
              Edit
            </button>
            <button
              onClick={() => addPrescription(row.original.id)}
              style={{
                padding: "6px 12px",
                backgroundColor: "#2196F3",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Make Prescription
            </button>
          </div>
        ),
      },
    ],
    [columns]
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({ columns: enhancedColumns, data: patients });

  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='text-2xl font-semibold mb-6'>Patient List</h1>
      <div className='overflow-x-auto bg-white shadow-md rounded-lg'>
        <table
          {...getTableProps()}
          style={{ width: "100%", borderCollapse: "collapse" }}
          className='min-w-full divide-y divide-gray-200'
        >
          <thead className='bg-gray-50'>
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <th
                    {...column.getHeaderProps()}
                    style={{ border: "1px solid black", padding: "8px" }}
                    className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                  >
                    {column.render("Header")}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody
            {...getTableBodyProps()}
            className='bg-white divide-y divide-gray-200'
          >
            {rows.map((row) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()}>
                  {row.cells.map((cell) => (
                    <td
                      {...cell.getCellProps()}
                      style={{ border: "1px solid black", padding: "8px" }}
                      className='px-6 py-4 whitespace-nowrap'
                    >
                      {cell.render("Cell")}
                    </td>
                  ))}
                  <td style={{ border: "1px solid black", padding: "8px" }}>
                    <div>
                      {row.original.prescriptions &&
                        row.original.prescriptions.length > 0 && (
                          <div>
                            <h4>Prescriptions:</h4>
                            <ul className='list-disc list-inside'>
                              {row.original.prescriptions.map(
                                (prescription, index) => (
                                  <li key={index}>
                                    <Link
                                      to={`/patients/${row.original.id}/prescriptions`}
                                      onClick={() =>
                                        handlePrescriptionClick(row.original.id)
                                      }
                                      className='text-blue-600 hover:text-blue-800 underline'
                                    >
                                      {prescription}
                                    </Link>
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PatientList;
