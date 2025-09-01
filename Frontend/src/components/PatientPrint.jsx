import { forwardRef } from 'react';

const PatientPrint = forwardRef(({ patient, formImageUrl }, ref) => {
  return (
    <div
      ref={ref}
      className='p-4 w-full max-w-[1000px] mx-auto text-sm print:w-full print:max-w-none'
      style={{
        pageBreakInside: 'avoid',
        fontFamily: 'Arial, sans-serif',
        lineHeight: '1.2',
        overflow: 'hidden',
      }}
    >
      <div className='w-full max-w-full'>
        <div className='text-center mb-3'>
          <h1 className='text-base font-bold mb-1'>السيد د سترګو روغتون</h1>
          <h2 className='text-sm font-semibold'>Al-Sayed Eye Hospital</h2>
        </div>

        <div className='flex items-start mb-1 justify-center'>
          {/* Logo on the left */}
          <div className='w-24 h-22 flex-shrink-0 mr-1'>
            <img
              src='/Al-Sayed-Logo.jpeg'
              alt='Hospital Logo'
              className='w-full h-full object-contain'
            />
          </div>

          <div className='flex flex-1 gap-1'>
            {/* Patient information table */}
            <div className='w-3/4'>
              <table className='w-full border-collapse border border-gray-400 text-xs'>
                <tbody>
                  <tr>
                    <td className='border border-gray-400 px-2 py-1 w-1/2'>
                      <span className='font-semibold'>Patient Name:</span>{' '}
                      {patient?.name || ''}
                    </td>
                    <td className='border border-gray-400 px-2 py-1 w-1/2'>
                      <span className='font-semibold'>Sex:</span>{' '}
                      {patient?.patientGender || ''}
                    </td>
                  </tr>

                  <tr>
                    <td className='border border-gray-400 px-2 py-1'>
                      <span className='font-semibold'>Father Name:</span>{' '}
                      {patient?.fatherName || ''}
                    </td>
                    <td className='border border-gray-400 px-2 py-1'>
                      <span className='font-semibold'>Date:</span>{' '}
                      {patient?.date?.split('T')[0] || ''}
                    </td>
                  </tr>

                  <tr>
                    <td className='border border-gray-400 px-2 py-1'>
                      <span className='font-semibold'>Insurance:</span>{' '}
                      {patient?.insuranceContact || ''}
                    </td>
                    <td className='border border-gray-400 px-2 py-1'>
                      <span className='font-semibold'>Tel's Contact:</span>{' '}
                      {patient?.contact || ''}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Card NO */}
            <div className='w-2/6 flex flex-col'>
              <div className='border border-gray-400 bg-gray-100 text-center py-1 px-1'>
                <div className='text-xs font-semibold'>Card NO</div>
              </div>
              <div className='border border-gray-400 border-t-0 flex-1 flex items-center justify-center bg-white tracking-normal'>
                <div className='text-center'>{patient?.patientID || ''}</div>
              </div>
            </div>
          </div>
        </div>
        {formImageUrl && (
          <div className='w-full flex justify-center'>
            <img
              src={formImageUrl || '/placeholder.svg'}
              alt='Patient Form'
              className='w-full max-w-[900px] h-auto object-contain'
              style={{ pageBreakInside: 'avoid', maxHeight: '80vh' }}
            />
          </div>
        )}
      </div>
    </div>
  );
});

export default PatientPrint;
