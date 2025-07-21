import React from 'react';
import { cn } from '../../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  className,
  ...props
}) => {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium transition-colors rounded-lg disabled:opacity-50 disabled:cursor-not-allowed',
        {
          'bg-primary text-white hover:bg-primary-dark focus:ring-2 focus:ring-primary/20': variant === 'primary',
          'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 focus:ring-2 focus:ring-slate-200': variant === 'secondary',
          'bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-200': variant === 'danger',
          'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-2 focus:ring-yellow-200': variant === 'warning',
          'px-2.5 py-1.5 text-sm': size === 'sm',
          'px-4 py-2 text-sm': size === 'md',
          'px-6 py-3 text-base': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};