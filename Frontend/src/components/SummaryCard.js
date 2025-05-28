import React from 'react';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

const formatCurrency = (value) => `${value.toLocaleString()}`;

function SummaryCard({ title, value, trend, trendDirection }) {
  return (
    <article className='flex flex-col h-full rounded-lg border shadow-sm bg-white p-4 sm:p-6 transition-all hover:shadow-md'>
      <div className='flex flex-col h-full justify-between'>
        <strong className='block text-sm font-medium text-gray-500 mb-1'>
          {title}
        </strong>
        <p className='mt-1'>
          <span className='text-xl sm:text-2xl font-medium text-gray-900'>
            {formatCurrency(value)}
          </span>
        </p>

        {trend && (
          <div className='flex items-center mt-2 text-sm'>
            <span
              className={`flex items-center ${
                trendDirection === 'up' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {trendDirection === 'up' ? (
                <FaArrowUp className='mr-1' />
              ) : (
                <FaArrowDown className='mr-1' />
              )}
              {trend}%
            </span>
            <span className='text-gray-500 ml-1 text-xs'>vs last period</span>
          </div>
        )}
      </div>
    </article>
  );
}

export default SummaryCard;
