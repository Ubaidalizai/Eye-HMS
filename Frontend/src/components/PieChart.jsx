import { useMemo } from 'react';

const PieChart = ({ 
  data = [], 
  title = 'Pie Chart',
  className = '',
  showLegend = true,
  showLabels = true,
  size = 300
}) => {
  // Generate colors for each category
  const colors = [
    '#3B82F6', // Blue
    '#EF4444', // Red
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#84CC16', // Lime
    '#F97316', // Orange
    '#6366F1', // Indigo
    '#14B8A6', // Teal
    '#F43F5E', // Rose
    '#8B5A2B', // Brown
    '#6B7280', // Gray
    '#DC2626', // Red-600
  ];

  // Calculate total and percentages
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const total = data.reduce((sum, item) => sum + (item.total || 0), 0);
    
    if (total === 0) return [];

    let cumulativePercentage = 0;
    
    return data.map((item, index) => {
      const percentage = (item.total / total) * 100;
      const startAngle = cumulativePercentage * 3.6; // Convert to degrees
      const endAngle = (cumulativePercentage + percentage) * 3.6;
      
      cumulativePercentage += percentage;
      
      return {
        ...item,
        percentage: percentage.toFixed(1),
        startAngle,
        endAngle,
        color: colors[index % colors.length]
      };
    });
  }, [data]);

  // Create SVG path for pie slice
  const createPath = (centerX, centerY, radius, startAngle, endAngle) => {
    const start = polarToCartesian(centerX, centerY, radius, endAngle);
    const end = polarToCartesian(centerX, centerY, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    return [
      "M", centerX, centerY,
      "L", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
      "Z"
    ].join(" ");
  };

  // Convert polar coordinates to cartesian
  const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  // Get label position
  const getLabelPosition = (centerX, centerY, radius, startAngle, endAngle) => {
    const midAngle = (startAngle + endAngle) / 2;
    const labelRadius = radius * 0.7;
    return polarToCartesian(centerX, centerY, labelRadius, midAngle);
  };

  if (!processedData || processedData.length === 0) {
    return (
      <div className={`bg-white border rounded-lg shadow-sm p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-gray-400 mb-2">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">No data available</p>
            <p className="text-gray-400 text-sm mt-1">Income data will appear here when available</p>
          </div>
        </div>
      </div>
    );
  }

  const radius = size / 2 - 20;
  const centerX = size / 2;
  const centerY = size / 2;

  return (
    <div className={`bg-white border rounded-lg shadow-sm p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      
      <div className="flex flex-col lg:flex-row items-center gap-6">
        {/* Pie Chart */}
        <div className="flex-shrink-0">
          <svg width={size} height={size} className="drop-shadow-sm">
            {processedData.map((item, index) => {
              const path = createPath(centerX, centerY, radius, item.startAngle, item.endAngle);
              const labelPos = getLabelPosition(centerX, centerY, radius, item.startAngle, item.endAngle);
              
              return (
                <g key={index}>
                  {/* Pie slice */}
                  <path
                    d={path}
                    fill={item.color}
                    stroke="white"
                    strokeWidth="2"
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                    title={`${item.category}: $${item.total.toFixed(2)} (${item.percentage}%)`}
                  />
                  
                  {/* Label */}
                  {showLabels && parseFloat(item.percentage) > 5 && (
                    <text
                      x={labelPos.x}
                      y={labelPos.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-xs font-medium fill-white"
                      style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}
                    >
                      {item.percentage}%
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        {showLegend && (
          <div className="flex-1 min-w-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {processedData.map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-2 rounded hover:bg-gray-50">
                  <div 
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate capitalize">
                      {item.category}
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.total.toFixed(2)} ({item.percentage}%)
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PieChart;
