import React from 'react';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

const formatCurrency = (value) => `${value.toLocaleString()}`;

// Get color scheme based on card title
const getCardColors = (title) => {
  const titleLower = title.toLowerCase();
  if (titleLower.includes('sales')) {
    return {
      borderColor: '#2563eb',
      bgGradient: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)',
      valueColor: '#2563eb',
      accentColor: '#2563eb'
    };
  } else if (titleLower.includes('purchase')) {
    return {
      borderColor: '#4f46e5',
      bgGradient: 'linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(79, 70, 229, 0.05) 100%)',
      valueColor: '#4f46e5',
      accentColor: '#4f46e5'
    };
  } else if (titleLower.includes('product')) {
    return {
      borderColor: '#3b82f6',
      bgGradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
      valueColor: '#3b82f6',
      accentColor: '#3b82f6'
    };
  } else if (titleLower.includes('expense')) {
    return {
      borderColor: '#2563eb',
      bgGradient: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)',
      valueColor: '#2563eb',
      accentColor: '#2563eb'
    };
  } else if (titleLower.includes('income')) {
    return {
      borderColor: '#4f46e5',
      bgGradient: 'linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(79, 70, 229, 0.05) 100%)',
      valueColor: '#4f46e5',
      accentColor: '#4f46e5'
    };
  }
  // Default colors
  return {
    borderColor: '#2563eb',
    bgGradient: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)',
    valueColor: '#2563eb',
    accentColor: '#2563eb'
  };
};

function SummaryCard({ title, value, trend, trendDirection }) {
  const colors = getCardColors(title);
  
  return (
    <article 
      className='flex flex-col h-full rounded-xl shadow-md bg-white p-5 sm:p-6 transition-all hover:shadow-xl hover:-translate-y-1 relative overflow-hidden border border-gray-100'
    >
      {/* Colored left border accent */}
      <div 
        className='absolute left-0 top-0 bottom-0 w-1 rounded-l-xl'
        style={{ background: `linear-gradient(180deg, ${colors.accentColor} 0%, ${colors.borderColor} 100%)` }}
      />
      
      <div className='flex flex-col h-full justify-between pl-2'>
        <strong 
          className='block text-xs font-medium mb-3 uppercase tracking-wider'
          style={{ color: colors.accentColor }}
        >
          {title}
        </strong>
        <p className='mt-2'>
          <span 
            className='text-2xl sm:text-3xl font-bold'
            style={{ color: colors.valueColor }}
          >
            {formatCurrency(value)}
          </span>
        </p>

        {trend && (
          <div className='flex items-center mt-4 pt-3 border-t border-gray-100 text-sm'>
            <span
              className={`flex items-center font-medium ${
                trendDirection === 'up' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {trendDirection === 'up' ? (
                <FaArrowUp className='mr-1.5' />
              ) : (
                <FaArrowDown className='mr-1.5' />
              )}
              {trend}%
            </span>
            <span className='text-gray-500 ml-2 text-xs'>vs last period</span>
          </div>
        )}
      </div>
    </article>
  );
}

export default SummaryCard;
