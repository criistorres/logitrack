// src/components/ui/index.tsx

'use client';

import React, { forwardRef, InputHTMLAttributes, ButtonHTMLAttributes } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

// ==============================================================================
// 🎨 BUTTON COMPONENT
// ==============================================================================

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    loading = false,
    fullWidth = false,
    disabled,
    children, 
    ...props 
  }, ref) => {
    
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
    
    const variants = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500',
      secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus-visible:ring-gray-500',
      outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus-visible:ring-blue-500',
      ghost: 'text-gray-700 hover:bg-gray-100 focus-visible:ring-blue-500',
      destructive: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
    };
    
    const sizes = {
      sm: 'h-9 rounded-md px-3 text-sm',
      md: 'h-11 rounded-md px-4 text-base',
      lg: 'h-12 rounded-lg px-6 text-lg',
    };
    
    return (
      <button
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

// ==============================================================================
// 📝 INPUT COMPONENT
// ==============================================================================

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type, 
    label, 
    error, 
    hint, 
    leftIcon, 
    rightIcon,
    ...props 
  }, ref) => {
    
    const [showPassword, setShowPassword] = React.useState(false);
    const isPassword = type === 'password';
    
    return (
      <div className="space-y-2">
        {/* Label */}
        {label && (
          <label className="text-sm font-medium text-gray-700">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}
          
          {/* Input */}
          <input
            type={isPassword && showPassword ? 'text' : type}
            className={cn(
              'flex h-11 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50',
              leftIcon && 'pl-10',
              (rightIcon || isPassword) && 'pr-10',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
              className
            )}
            ref={ref}
            {...props}
          />
          
          {/* Right Icon / Password Toggle */}
          {(rightIcon || isPassword) && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {isPassword ? (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              ) : (
                <div className="text-gray-400">{rightIcon}</div>
              )}
            </div>
          )}
        </div>
        
        {/* Error Message */}
        {error && (
          <p className="text-sm text-red-600 flex items-center">
            <span className="mr-1">⚠️</span>
            {error}
          </p>
        )}
        
        {/* Hint Message */}
        {hint && !error && (
          <p className="text-sm text-gray-500 flex items-center">
            <span className="mr-1">💡</span>
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// ==============================================================================
// 📄 CARD COMPONENT
// ==============================================================================

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({ children, className, padding = 'md' }: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };
  
  return (
    <div
      className={cn(
        'rounded-lg border border-gray-200 bg-white shadow-sm',
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </div>
  );
}

// ==============================================================================
// ⏳ LOADING SPINNER
// ==============================================================================

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export function LoadingSpinner({ size = 'md', text = 'Carregando...' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };
  
  return (
    <div className="flex items-center justify-center p-4">
      <div className="flex items-center space-x-2">
        <Loader2 className={cn('animate-spin text-blue-600', sizeClasses[size])} />
        <span className="text-gray-600">{text}</span>
      </div>
    </div>
  );
}

// ==============================================================================
// 🚨 ALERT COMPONENT
// ==============================================================================

interface AlertProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Alert({ type = 'info', title, children, className }: AlertProps) {
  const typeClasses = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };
  
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  };
  
  return (
    <div className={cn('rounded-md border p-4', typeClasses[type], className)}>
      <div className="flex">
        <div className="flex-shrink-0">
          <span className="text-lg">{icons[type]}</span>
        </div>
        <div className="ml-3">
          {title && (
            <h3 className="text-sm font-medium mb-1">{title}</h3>
          )}
          <div className="text-sm">{children}</div>
        </div>
      </div>
    </div>
  );
}