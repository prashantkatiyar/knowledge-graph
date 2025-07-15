import React from 'react';

interface RadialGaugeProps {
  value: number;
  label: string;
  className?: string;
  size?: number;
}

const RadialGauge: React.FC<RadialGaugeProps> = ({ 
  value, 
  label, 
  className = '', 
  size = 120 
}) => {
  const radius = 45;
  const strokeWidth = 8;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (value / 100) * circumference;
  
  // Determine color based on thresholds
  const getColor = (value: number) => {
    if (value >= 80) return '#10B981'; // Green
    if (value >= 50) return '#F59E0B'; // Amber
    return '#EF4444'; // Red
  };

  const color = getColor(value);

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative">
        <svg
          height={size}
          width={size}
          className="transform -rotate-90"
          aria-label={`${label}: ${value}%`}
        >
          {/* Background circle */}
          <circle
            stroke="#E5E7EB"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={size / 2}
            cy={size / 2}
          />
          {/* Progress circle */}
          <circle
            stroke={color}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={size / 2}
            cy={size / 2}
            className="transition-all duration-500 ease-in-out"
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900">{value}%</div>
          </div>
        </div>
      </div>
      <div className="mt-2 text-sm text-slate-600 text-center">{label}</div>
    </div>
  );
};

export default RadialGauge;