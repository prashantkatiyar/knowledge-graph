import React from 'react';

interface SparklineChartProps {
  data: number[];
  className?: string;
  color?: string;
}

const SparklineChart: React.FC<SparklineChartProps> = ({ 
  data, 
  className = '', 
  color = '#3B82F6' 
}) => {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className={`relative ${className}`}>
      <svg 
        width="100%" 
        height="40" 
        viewBox="0 0 100 100" 
        preserveAspectRatio="none"
        className="overflow-visible"
        aria-label={`Sparkline chart with ${data.length} data points`}
      >
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          points={points}
          vectorEffect="non-scaling-stroke"
        />
        {/* Data points */}
        {data.map((value, index) => {
          const x = (index / (data.length - 1)) * 100;
          const y = 100 - ((value - min) / range) * 100;
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="1"
              fill={color}
              className="hover:r-2 transition-all duration-200"
            >
              <title>Day {index + 1}: {value} edits</title>
            </circle>
          );
        })}
      </svg>
    </div>
  );
};

export default SparklineChart;