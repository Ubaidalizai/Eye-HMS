import { useRef, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';

const PrintModal = ({ title, selectedRecord, fields, onClose }) => {
  const componentRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: 'Print Document',
    removeAfterPrint: true,
    onBeforeGetContent: () => {
      return new Promise((resolve) => {
        resolve();
      });
    },
  });

  const printContent = (
    <div className='print:p-0'>
      <h2 className='text-center mb-8 font-semibold print:text-xl'>
        السید د سترګو روغتون
      </h2>
      <h4 className='text-lg font-semibold mb-4 ml-2 print:text-base'>
        {title} Record Details
      </h4>
      <table className='w-full text-1xl border-collapse'>
        <tbody>
          {fields.map(
            (field, idx) =>
              field.name !== 'percentage' &&
              field.name !== 'totalAmount' && (
                <tr key={idx} className='border-b'>
                  <th className='text-left px-2 py-1 font-semibold'>
                    {field.label}
                  </th>
                  <td className='px-2 py-1'>
                    {formatFieldValue(field.name, selectedRecord[field.name])}
                  </td>
                </tr>
              )
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-75'
      onClick={onClose}
    >
      <div
        className='bg-white rounded-md shadow-lg p-6 w-full max-w-md'
        onClick={(e) => e.stopPropagation()}
      >
        <div ref={componentRef}>{printContent}</div>
        <div className='flex justify-end mt-4 print:hidden'>
          <button
            onClick={onClose}
            className='bg-gray-300 text-gray-700 px-4 py-2 rounded-md mr-2 hover:bg-gray-400 transition-colors'
          >
            Close
          </button>
          <button
            onClick={() => {
              if (componentRef.current) {
                handlePrint();
              } else {
                console.error('❌ No content available to print');
              }
            }}
            className='bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors'
          >
            Print
          </button>
        </div>
      </div>
    </div>
  );
};

const formatFieldValue = (fieldName, value) => {
  if (fieldName === 'date' && value) {
    return value.split('T')[0];
  }
  if (fieldName === 'patientId' || fieldName === 'doctor') {
    return typeof value === 'object'
      ? value?.name || `${value?.firstName} ${value?.lastName}` || 'N/A'
      : value;
  }
  if (fieldName === 'discount') {
    return `${value}%`;
  }
  return typeof value === 'object' ? value?.name : value;
};

export default PrintModal;
