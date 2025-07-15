import React from 'react';

interface DonutChartSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutChartSegment[];
  className?: string;
  size?: number;
}

const DonutChart: React.FC<DonutChartProps> = ({ 
  data, 
  className = '', 
  size = 120 
}) => {
  const total = data.reduce((sum, segment) => sum + segment.value, 0);
  const radius = 45;
  const strokeWidth = 10;
  const center = size / 2;
  
  let cumulativePercentage = 0;

  const createPath = (percentage: number, cumulativePercentage: number) => {
    const startAngle = cumulativePercentage * 3.6 - 90; // Start from top
    const endAngle = (cumulativePercentage + percentage) * 3.6 - 90;
    
    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;
    
    const largeArcFlag = percentage > 50 ? 1 : 0;
    
    const x1 = center + radius * Math.cos(startAngleRad);
    const y1 = center + radius * Math.sin(startAngleRad);
    const x2 = center + radius * Math.cos(endAngleRad);
    const y2 = center + radius * Math.sin(endAngleRad);
    
    return `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative">
        <svg 
          width={size} 
          height={size} 
          className="transform -rotate-90"
          aria-label="Donut chart showing relationship adoption breakdown"
        >
          {data.map((segment, index) => {
            const percentage = (segment.value / total) * 100;
            const path = createPath(percentage, cumulativePercentage);
            cumulativePercentage += percentage;
            
            return (
              <path
                key={index}
                d={path}
                fill={segment.color}
                className="hover:opacity-80 transition-opacity duration-200"
              >
                <title>{segment.label}: {segment.value}%</title>
              </path>
            );
          })}
          
          {/* Center circle to create donut effect */}
          <circle
            cx={center}
            cy={center}
            r={radius - strokeWidth}
            fill="white"
          />
        </svg>
      </div>
      
      {/* Legend */}
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        {data.map((segment, index) => (
          <div key={index} className="flex items-center gap-1">
            <div 
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: segment.color }}
            />
            <span className="text-slate-600 truncate">{segment.label}</span>
            <span className="text-slate-900 font-medium">{segment.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DonutChart;