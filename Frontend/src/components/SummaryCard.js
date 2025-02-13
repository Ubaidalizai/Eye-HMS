import React from 'react';

const formatCurrency = (value) => `${value.toLocaleString()}`;

function SummaryCard({ title, value, trend, trendDirection }) {
  return (
    <article className='flex flex-col gap-2 rounded-lg border mt-2 mb-20 bg-white p-6'>
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
