// src/components/ui/Input.tsx

import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
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
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  containerClassName?: string;
  inputClassName?: string;
  required?: boolean;
}

// ==============================================================================
// 🎨 COMPONENTE INPUT
// ==============================================================================

export function Input({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerClassName = '',
  inputClassName = '',
  required = false,
  secureTextEntry,
  ...props
}: InputProps) {
  const [isSecureTextVisible, setIsSecureTextVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  // Se é campo de senha, mostrar ícone de olho
  const showPasswordToggle = secureTextEntry !== undefined;
  const finalRightIcon = showPasswordToggle 
    ? (isSecureTextVisible ? 'eye-outline' : 'eye-off-outline')
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
        <Text className="text-gray-700 text-sm font-medium mb-2">
          {label}
          {required && <Text className="text-red-500 ml-1">*</Text>}
        </Text>
      )}
      
      {/* Input Container */}
      <View 
        className={`
          flex-row items-center
          bg-white border rounded-lg px-3 py-3
          ${isFocused ? 'border-blue-500 shadow-sm' : 'border-gray-300'}
          ${error ? 'border-red-500' : ''}
        `}
      >
        {/* Left Icon */}
        {leftIcon && (
          <Ionicons 
            name={leftIcon} 
            size={20} 
            color={isFocused ? '#3b82f6' : '#9ca3af'} 
            style={{ marginRight: 12 }}
          />
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
            className="ml-2 p-1"
            activeOpacity={0.7}
          >
            <Ionicons 
              name={finalRightIcon} 
              size={20} 
              color={isFocused ? '#3b82f6' : '#9ca3af'} 
            />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Error Message */}
      {error && (
        <Text className="text-red-500 text-sm mt-1 ml-1">
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
// 🔘 COMPONENTE BUTTON
// ==============================================================================

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
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
  
  // Estilos baseados na variante
  const variantStyles = {
    primary: `bg-blue-500 ${isDisabled ? 'opacity-50' : 'active:bg-blue-600'}`,
    secondary: `bg-gray-500 ${isDisabled ? 'opacity-50' : 'active:bg-gray-600'}`,
    outline: `border-2 border-blue-500 bg-transparent ${isDisabled ? 'opacity-50' : 'active:bg-blue-50'}`,
    ghost: `bg-transparent ${isDisabled ? 'opacity-50' : 'active:bg-gray-100'}`,
  };
  
  // Estilos baseados no tamanho
  const sizeStyles = {
    small: 'px-3 py-2',
    medium: 'px-4 py-3',
    large: 'px-6 py-4',
  };
  
  // Cores do texto
  const textColors = {
    primary: 'text-white',
    secondary: 'text-white',
    outline: 'text-blue-500',
    ghost: 'text-gray-700',
  };
  
  // Tamanhos do texto
  const textSizes = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
  };
  
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      className={`
        flex-row items-center justify-center
        rounded-lg
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {/* Loading Spinner */}
      {loading && (
        <LoadingSpinner 
          size="small" 
          color={variant === 'outline' || variant === 'ghost' ? '#3b82f6' : '#ffffff'} 
        />
      )}
      
      {/* Left Icon */}
      {leftIcon && !loading && (
        <Ionicons 
          name={leftIcon} 
          size={size === 'small' ? 16 : size === 'large' ? 24 : 20}
          color={variant === 'outline' || variant === 'ghost' ? '#3b82f6' : '#ffffff'}
          style={{ marginRight: 8 }}
        />
      )}
      
      {/* Title */}
      <Text 
        className={`
          font-semibold
          ${textColors[variant]}
          ${textSizes[size]}
          ${loading ? 'ml-2' : ''}
        `}
      >
        {loading ? 'Carregando...' : title}
      </Text>
      
      {/* Right Icon */}
      {rightIcon && !loading && (
        <Ionicons 
          name={rightIcon} 
          size={size === 'small' ? 16 : size === 'large' ? 24 : 20}
          color={variant === 'outline' || variant === 'ghost' ? '#3b82f6' : '#ffffff'}
          style={{ marginLeft: 8 }}
        />
      )}
    </TouchableOpacity>
  );
}

// ==============================================================================
// ⏳ COMPONENTE LOADING SPINNER
// ==============================================================================

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  className?: string;
}

export function LoadingSpinner({ 
  size = 'large', 
  color = '#3b82f6',
  className = ''
}: LoadingSpinnerProps) {
  return (
    <View className={`items-center justify-center ${className}`}>
      <ActivityIndicator 
        size={size} 
        color={color} 
      />
    </View>
  );
}

// ==============================================================================
// 📱 COMPONENTE SCREEN CONTAINER
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
        <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
          {showBackButton ? (
            <TouchableOpacity
              onPress={onBackPress}
              className="p-2 -ml-2"
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color="#374151" />
            </TouchableOpacity>
          ) : (
            <View />
          )}
          
          {title && (
            <Text className="text-lg font-semibold text-gray-900">
              {title}
            </Text>
          )}
          
          <View style={{ width: 40 }} />
        </View>
      )}
      
      {/* Content */}
      {children}
    </View>
  );
}

// ==============================================================================
// 📋 COMPONENTE FORM CONTAINER
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
    <View className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <View className="mb-6">
        <Text className="text-2xl font-bold text-gray-900 mb-2">
          {title}
        </Text>
        {subtitle && (
          <Text className="text-gray-600">
            {subtitle}
          </Text>
        )}
      </View>
      
      {/* Form Content */}
      {children}
    </View>
  );
}