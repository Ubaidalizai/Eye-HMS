import React from 'react';
import { Bar } from 'react-chartjs-2';

const BarChart = ({ data, title }) => (
  <div className='p-4 sm:p-6 border rounded-lg shadow-sm bg-white h-full'>
    <h2 className='text-lg sm:text-xl font-semibold mb-4 text-gray-700'>
      {title}
    </h2>
    <div className='w-full h-[300px] sm:h-[350px] lg:h-[400px]'>
      <Bar
        data={data}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: {
                boxWidth: 12,
                padding: 15,
                font: {
                  size: 12,
                },
              },
            },
            title: {
              display: false,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                font: {
                  size: 11,
                },
              },
            },
            x: {
              ticks: {
                font: {
                  size: 11,
                },
              },
            },
          },
        }}
      />
    </div>
  </div>
);

export default BarChart;
