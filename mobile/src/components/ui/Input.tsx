// mobile/src/components/Input.tsx - VERSÃO TAILWIND

import React, { useState } from 'react';
import {
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View
} from 'react-native';

// ==============================================================================
// 📋 TIPOS E INTERFACES
// ==============================================================================

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  containerClassName?: string;
  inputClassName?: string;
}

// ==============================================================================
// 🎨 COMPONENTE INPUT COM TAILWIND
// ==============================================================================

export function Input({
  label,
  error,
  hint,
  required = false,
  leftIcon,
  rightIcon,
  onRightIconPress,
  secureTextEntry,
  containerClassName = '',
  inputClassName = '',
  ...props
}: InputProps) {
  const [isSecureTextVisible, setIsSecureTextVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  // Se é campo de senha, mostrar ícone de olho
  const showPasswordToggle = secureTextEntry !== undefined;
  const finalRightIcon = showPasswordToggle 
    ? (isSecureTextVisible ? '👁️' : '🙈')
    : rightIcon;
  
  const handleRightIconPress = () => {
    if (showPasswordToggle) {
      setIsSecureTextVisible(!isSecureTextVisible);
    } else if (onRightIconPress) {
      onRightIconPress();
    }
  };
  
  return (
    <View className={`mb-4 ${containerClassName}`}>
      {/* Label */}
      {label && (
        <View className="flex-row mb-2">
          <Text className="text-gray-700 text-sm font-semibold">
            {label}
          </Text>
          {required && (
            <Text className="text-red-500 ml-1">*</Text>
          )}
        </View>
      )}
      
      {/* Input Container */}
      <View className={`
        flex-row items-center bg-white border rounded-lg px-3 py-3
        ${isFocused 
          ? (error ? 'border-red-500' : 'border-blue-500 shadow-sm') 
          : (error ? 'border-red-500' : 'border-gray-300')
        }
      `}>
        {/* Left Icon */}
        {leftIcon && (
          <Text className={`text-lg mr-3 ${isFocused ? 'text-blue-500' : 'text-gray-400'}`}>
            {leftIcon}
          </Text>
        )}
        
        {/* Text Input */}
        <TextInput
          className={`flex-1 text-gray-900 text-base ${inputClassName}`}
          placeholderTextColor="#9ca3af"
          secureTextEntry={showPasswordToggle ? !isSecureTextVisible : secureTextEntry}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        
        {/* Right Icon */}
        {finalRightIcon && (
          <TouchableOpacity
            onPress={handleRightIconPress}
            className="ml-3 p-1"
            activeOpacity={0.7}
          >
            <Text className={`text-lg ${isFocused ? 'text-blue-500' : 'text-gray-400'}`}>
              {finalRightIcon}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* Error Message */}
      {error && (
        <Text className="text-red-500 text-xs mt-1 ml-1">
          {error}
        </Text>
      )}
      
      {/* Hint Message */}
      {hint && !error && (
        <Text className="text-gray-500 text-xs mt-1 ml-1">
          {hint}
        </Text>
      )}
    </View>
  );
}

// ==============================================================================
// 🔘 COMPONENTE BUTTON COM TAILWIND
// ==============================================================================

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: string;
  rightIcon?: string;
  className?: string;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  className = '',
}: ButtonProps) {
  const isDisabled = disabled || loading;
  
  // Classes base
  const baseClasses = "flex-row items-center justify-center rounded-lg font-semibold";
  
  // Classes de variante
  const variantClasses = {
    primary: `bg-blue-500 ${isDisabled ? 'opacity-50' : 'active:bg-blue-600'}`,
    secondary: `bg-gray-500 ${isDisabled ? 'opacity-50' : 'active:bg-gray-600'}`,
    outline: `border-2 border-blue-500 bg-transparent ${isDisabled ? 'opacity-50' : 'active:bg-blue-50'}`,
    ghost: `bg-transparent ${isDisabled ? 'opacity-50' : 'active:bg-gray-100'}`,
  };
  
  // Classes de tamanho
  const sizeClasses = {
    small: 'px-3 py-2',
    medium: 'px-4 py-3',
    large: 'px-6 py-4',
  };
  
  // Classes de texto baseadas na variante
  const textVariantClasses = {
    primary: 'text-white',
    secondary: 'text-white',
    outline: 'text-blue-500',
    ghost: 'text-gray-700',
  };
  
  // Classes de tamanho do texto
  const textSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
  };
  
  // Classes finais
  const buttonClasses = `
    ${baseClasses} 
    ${variantClasses[variant]} 
    ${sizeClasses[size]} 
    ${className}
  `.replace(/\s+/g, ' ').trim();
  
  const textClasses = `
    font-semibold
    ${textVariantClasses[variant]}
    ${textSizeClasses[size]}
    ${loading ? 'ml-2' : ''}
  `.replace(/\s+/g, ' ').trim();
  
  // Tamanho dos ícones baseado no size
  const iconSize = size === 'small' ? 'text-sm' : size === 'large' ? 'text-xl' : 'text-base';
  
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      className={buttonClasses}
      activeOpacity={0.8}
    >
      {/* Loading Indicator */}
      {loading && (
        <Text className={`${iconSize} mr-2`}>⏳</Text>
      )}
      
      {/* Left Icon */}
      {leftIcon && !loading && (
        <Text className={`${iconSize} mr-2`}>
          {leftIcon}
        </Text>
      )}
      
      {/* Title */}
      <Text className={textClasses}>
        {loading ? 'Carregando...' : title}
      </Text>
      
      {/* Right Icon */}
      {rightIcon && !loading && (
        <Text className={`${iconSize} ml-2`}>
          {rightIcon}
        </Text>
      )}
    </TouchableOpacity>
  );
}

// ==============================================================================
// 📱 COMPONENTE SCREEN CONTAINER COM TAILWIND
// ==============================================================================

interface ScreenContainerProps {
  children: React.ReactNode;
  showBackButton?: boolean;
  title?: string;
  onBackPress?: () => void;
  className?: string;
}

export function ScreenContainer({
  children,
  showBackButton = false,
  title,
  onBackPress,
  className = ''
}: ScreenContainerProps) {
  return (
    <View className={`flex-1 bg-gray-50 ${className}`}>
      {/* Header */}
      {(showBackButton || title) && (
        <View className="flex-row items-center justify-between px-4 py-4 pt-12 bg-white border-b border-gray-200">
          {showBackButton ? (
            <TouchableOpacity
              onPress={onBackPress}
              className="p-2 -ml-2"
              activeOpacity={0.7}
            >
              <Text className="text-blue-500 text-lg font-semibold">← Voltar</Text>
            </TouchableOpacity>
          ) : (
            <View />
          )}
          
          {title && (
            <Text className="text-lg font-bold text-gray-900">
              {title}
            </Text>
          )}
          
          <View className="w-16" />
        </View>
      )}
      
      {/* Content */}
      {children}
    </View>
  );
}

// ==============================================================================
// 📋 COMPONENTE FORM CONTAINER COM TAILWIND
// ==============================================================================

interface FormContainerProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  className?: string;
}

export function FormContainer({
  children,
  title,
  subtitle,
  className = ''
}: FormContainerProps) {
  return (
    <View className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}>
      {/* Header */}
      <View className="mb-6">
        <Text className="text-2xl font-bold text-gray-900 mb-2">
          {title}
        </Text>
        {subtitle && (
          <Text className="text-gray-600 text-center">
            {subtitle}
          </Text>
        )}
      </View>
      
      {/* Form Content */}
      {children}
    </View>
  );
}

// ==============================================================================
// ⏳ COMPONENTE LOADING SPINNER COM TAILWIND
// ==============================================================================

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  className?: string;
  text?: string;
}

export function LoadingSpinner({ 
  size = 'large', 
  className = '',
  text = 'Carregando...'
}: LoadingSpinnerProps) {
  return (
    <View className={`items-center justify-center ${className}`}>
      <Text className={`mb-2 ${size === 'large' ? 'text-2xl' : 'text-lg'}`}>
        ⏳
      </Text>
      {text && (
        <Text className="text-gray-600 text-sm">
          {text}
        </Text>
      )}
    </View>
  );
}