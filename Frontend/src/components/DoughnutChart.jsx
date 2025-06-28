import React from 'react';
import { Doughnut } from 'react-chartjs-2';

const DoughnutChart = ({ data, title }) => (
  <div className='p-4 sm:p-6 border rounded-lg shadow-sm bg-white h-full'>
    <h2 className='text-lg sm:text-xl font-semibold mb-4 text-gray-700'>
      {title}
    </h2>
    <div className='w-full h-[300px] sm:h-[350px] lg:h-[400px] flex items-center justify-center'>
      <div className='w-full max-w-xs sm:max-w-sm md:max-w-md'>
        <Doughnut
          data={data}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  boxWidth: 12,
                  padding: 15,
                  font: {
                    size: 11,
                  },
                },
              },
            },
            cutout: '65%',
          }}
        />
      </div>
    </div>
  </div>
);

export default DoughnutChart;
