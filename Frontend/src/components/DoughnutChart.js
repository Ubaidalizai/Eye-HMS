import React from 'react';
import { Doughnut } from 'react-chartjs-2';

const DoughnutChart = ({ data, title }) => (
  <div className='p-4 border rounded-md bg-white'>
    <h2 className='text-xl font-bold mb-4'>{title}</h2>
    <div className='w-full max-w-md mx-auto'>
      <Doughnut data={data} />
    </div>
  </div>
);

export default DoughnutChart;
