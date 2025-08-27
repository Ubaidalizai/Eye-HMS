import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';

const PrintModal = ({ title, selectedRecord, fields, onClose, isMultipleRecords = false, calculatePrintTotal }) => {
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

  // Custom format function that uses correct total calculation for printing
  const formatFieldValueForPrint = (fieldName, value, record = null) => {
    // For totalAmount field, use the corrected calculation
    if (fieldName === 'totalAmount' && record && calculatePrintTotal) {
      const correctedTotal = calculatePrintTotal(record);
      return correctedTotal.toFixed(2);
    }

    // Use the existing formatFieldValue for other fields
    return formatFieldValue(fieldName, value);
  };

  const printContent = isMultipleRecords ? (
    <div className='print:p-0'>
      <h2 className='text-center mb-4 font-semibold print:text-base'>
        السید د سترګو روغتون
      </h2>
      <h4 className='text-base font-semibold mb-3 print:text-sm'>
        {title}
      </h4>

      {/* Common Information */}
      <div className='mb-4 print:mb-2 bg-gray-50 p-3 rounded print:bg-transparent print:p-1'>
        <div className='grid grid-cols-2 gap-2 text-sm print:text-xs'>
          <p><strong>Patient:</strong> {selectedRecord.patientName}</p>
          <p><strong>Doctor:</strong> {selectedRecord.records[0]?.doctor?.firstName} {selectedRecord.records[0]?.doctor?.lastName}</p>
          <p><strong>Date:</strong> {new Date(selectedRecord.records[0]?.date).toLocaleDateString()}</p>
          <p><strong>Time:</strong> {selectedRecord.records[0]?.time}</p>
        </div>
      </div>

      {/* Records Table - Only Different Fields */}
      <div className='mb-3'>
        <table className='w-full text-sm border-collapse border border-gray-300 print:text-xs'>
          <thead>
            <tr className='bg-gray-100 print:bg-gray-200'>
              <th className='border border-gray-300 px-2 py-1 text-left font-semibold print:px-1 print:py-0.5'>Type</th>
              <th className='border border-gray-300 px-2 py-1 text-left font-semibold print:px-1 print:py-0.5'>Price</th>
              <th className='border border-gray-300 px-2 py-1 text-left font-semibold print:px-1 print:py-0.5'>Discount</th>
              <th className='border border-gray-300 px-2 py-1 text-left font-semibold print:px-1 print:py-0.5'>Total</th>
            </tr>
          </thead>
          <tbody>
            {selectedRecord.records.map((record, recordIdx) => (
              <tr key={recordIdx}>
                <td className='border border-gray-300 px-2 py-1 print:px-1 print:py-0.5'>
                  {record.type?.name || 'N/A'}
                </td>
                <td className='border border-gray-300 px-2 py-1 print:px-1 print:py-0.5'>
                  {record.price || 0}
                </td>
                <td className='border border-gray-300 px-2 py-1 print:px-1 print:py-0.5'>
                  {record.discount?.toFixed(2) || 0}
                </td>
                <td className='border border-gray-300 px-2 py-1 print:px-1 print:py-0.5 font-semibold'>
                  {formatFieldValueForPrint('totalAmount', record.totalAmount, record)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className='bg-gray-50 print:bg-gray-100'>
              <td colSpan="3" className='border border-gray-300 px-2 py-1 print:px-1 print:py-0.5 font-semibold text-right'>
                Grand Total:
              </td>
              <td className='border border-gray-300 px-2 py-1 print:px-1 print:py-0.5 font-bold'>
                {selectedRecord.totalAmount.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  ) : (
    <div className='print:p-0'>
      <h2 className='text-center mb-6 font-semibold print:text-lg'>
        السید د سترګو روغتون
      </h2>
      <h4 className='text-lg font-semibold mb-4 print:text-base'>
        {title} Record Details
      </h4>
      <div className='grid grid-cols-2 gap-x-6 gap-y-3 print:grid-cols-2 print:gap-x-4 print:gap-y-2'>
        {fields
          .filter(field => field.name !== 'percentage') // Exclude percentage field
          .map((field, idx) => (
            <div key={idx} className='print:text-sm'>
              <span className='font-medium text-gray-600 print:text-black block'>{field.label}:</span>
              <span className='text-gray-800 print:text-black'>
                {formatFieldValueForPrint(field.name, selectedRecord[field.name], selectedRecord)}
              </span>
            </div>
          ))}
      </div>
    </div>
  );

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-75 p-4'
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-md shadow-lg p-4 w-full ${
          isMultipleRecords
            ? 'max-w-2xl max-h-[85vh] overflow-hidden flex flex-col'
            : 'max-w-md'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          ref={componentRef}
          className={`${isMultipleRecords ? 'overflow-auto flex-1 mb-4' : ''}`}
        >
          {printContent}
        </div>
        <div className='flex justify-end mt-4 print:hidden flex-shrink-0'>
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
    return `${value}`;
  }
  return typeof value === 'object' ? value?.name : value;
};

export default PrintModal;
