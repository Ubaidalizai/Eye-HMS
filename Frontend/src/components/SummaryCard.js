import React from 'react';
import { HiArrowUp, HiArrowDown } from 'react-icons/hi2';

const formatCurrency = (value) => `${value.toLocaleString()}`;

function SummaryCard({ title, value, trend, trendDirection }) {
  return (
    <article className='flex flex-col gap-4 rounded-lg border mt-2 mb-10 bg-white p-6'>
      <div
        className={`inline-flex gap-2 self-end rounded ${
          trendDirection === 'up'
            ? 'bg-green-100 text-green-600'
            : 'bg-red-100 text-red-600'
        } p-1`}
      >
        {trendDirection === 'up' ? (
          <HiArrowUp className='h-4 w-4' />
        ) : (
          <HiArrowDown className='h-4 w-4' />
        )}
        <span className='text-xs font-medium'>{trend}%</span>
      </div>
      <div>
        <strong className='block text-sm font-medium text-gray-500'>
          {title}
        </strong>
        <p>
          <span className='text-2xl font-medium text-gray-900'>
            {formatCurrency(value)}
          </span>
        </p>
      </div>
    </article>
  );
}
export default SummaryCard;
