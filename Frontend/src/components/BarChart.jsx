import { Bar } from 'react-chartjs-2';

const BarChart = ({ data, title }) => (
  <div className='p-5 sm:p-6 border border-gray-100 rounded-xl shadow-md bg-white h-full'>
    <div className='flex items-center mb-5'>
      <h2 className='text-lg sm:text-xl font-semibold mb-4 text-gray-700'>
        {title}
      </h2>
    </div>
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
                color: '#374151',
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
                color: '#6B7280',
              },
              grid: {
                color: 'rgba(37, 99, 235, 0.1)',
              },
            },
            x: {
              ticks: {
                font: {
                  size: 11,
                },
                color: '#6B7280',
              },
              grid: {
                color: 'rgba(37, 99, 235, 0.1)',
              },
            },
          },
        }}
      />
    </div>
  </div>
);

export default BarChart;
