import React from 'react';
import { Bar } from 'react-chartjs-2';

const BarChart = ({ data, title }) => (
  <div className='p-4 mt-4 border rounded-md bg-white'>
    <h2 className='text-xl font-bold mb-4'>{title}</h2>
    <Bar
      data={data}
      options={{
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          title: { display: true, text: title },
        },
      }}
    />
  </div>
);

export default BarChart;
