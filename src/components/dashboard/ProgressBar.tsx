import React from 'react';

interface ProgressBarProps {
  value: number;
  label: string;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ 
  value, 
  label, 
  className = '' 
}) => {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <span className="text-sm font-bold text-slate-900">{value}%</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-3 relative overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500 ease-out relative"
          style={{ width: `${value}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-medium text-white mix-blend-difference">
            {value}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;