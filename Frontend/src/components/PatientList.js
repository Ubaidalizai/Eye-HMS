/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import { useTable } from "react-table";

const PatientList = ({
  patients,
  columns,
  handleEdit,
  handlePrescriptionClick,
  addPrescription,
}) => {
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({ columns, data: patients });

  return (
    <table
      {...getTableProps()}
      style={{ width: "100%", borderCollapse: "collapse" }}
    >
      <thead>
        {headerGroups.map((headerGroup) => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column) => (
              <th
                {...column.getHeaderProps()}
                style={{ border: "1px solid black", padding: "8px" }}
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
            <tr {...row.getRowProps()}>
              {row.cells.map((cell) => (
                <td
                  {...cell.getCellProps()}
                  style={{ border: "1px solid black", padding: "8px" }}
                >
                  {cell.render("Cell")}
                </td>
              ))}
              <td style={{ border: "1px solid black", padding: "8px" }}>
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
                  onClick={() => addPrescription(row.original.id)} // Add prescription
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
                <div>
                  {row.original.prescriptions.length > 0 && (
                    <div>
                      {/* <h4>Prescriptions:</h4> */}
                      {/* <ul> */}
                      {/* {row.original.prescriptions.map(
                          (prescription, index) => (
                            <li key={index}>
                              <a
                                href="#"
                                onClick={() =>
                                  handlePrescriptionClick(row.original.id)
                                }
                                style={{
                                  color: "#2196F3",
                                  textDecoration: "underline",
                                }}
                              >
                                {prescription}
                              </a>
                            </li>
                          )
                        )}
                      </ul> */}
                    </div>
                  )}
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default PatientList;
