// ==============================================================================
// 🎨 COMPONENTES UI LOGITRACK - DESIGN PROFISSIONAL
// ==============================================================================

// Arquivo: mobile/src/components/ui/index.tsx
// SUBSTITUA o conteúdo atual por esta versão profissional

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
// 🔘 INPUT COMPONENT - DESIGN PROFISSIONAL
// ==============================================================================

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  containerClassName?: string;
  inputClassName?: string;
}

export function Input({
  label,
  error,
  hint,
  required = false,
  leftIcon,
  rightIcon,
  onRightIconPress,
  secureTextEntry,
  variant = 'outlined',
  size = 'md',
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
  
  // Classes baseadas na variante
  const variantClasses = {
    default: 'bg-neutral-50 border border-neutral-200',
    filled: 'bg-neutral-100 border-0',
    outlined: 'bg-white border-2 border-neutral-200',
  };
  
  // Classes de tamanho
  const sizeClasses = {
    sm: 'px-3 py-2',
    md: 'px-4 py-3',
    lg: 'px-5 py-4',
  };
  
  const iconSizes = {
    sm: 'text-base',
    md: 'text-lg', 
    lg: 'text-xl',
  };
  
  return (
    <View className={`mb-4 ${containerClassName}`}>
      {/* Label */}
      {label && (
        <View className="flex-row mb-2">
          <Text className="text-neutral-700 text-sm font-semibold">
            {label}
          </Text>
          {required && (
            <Text className="text-danger-500 ml-1 font-bold">*</Text>
          )}
        </View>
      )}
      
      {/* Input Container */}
      <View className={`
        flex-row items-center rounded-xl shadow-sm
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${isFocused 
          ? (error ? 'border-danger-500 shadow-danger-500/20' : 'border-primary-500 shadow-primary-500/20') 
          : (error ? 'border-danger-300' : 'border-neutral-200')
        }
      `}>
        {/* Left Icon */}
        {leftIcon && (
          <View className="mr-3">
            <Text className={`
              ${iconSizes[size]}
              ${isFocused ? 'text-primary-500' : 'text-neutral-400'}
            `}>
              {leftIcon}
            </Text>
          </View>
        )}
        
        {/* Text Input */}
        <TextInput
          className={`
            flex-1 text-neutral-900 font-medium
            ${size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'}
            ${inputClassName}
          `}
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
            className="ml-3 p-1 rounded-lg active:bg-neutral-100"
            activeOpacity={0.7}
          >
            <Text className={`
              ${iconSizes[size]}
              ${isFocused ? 'text-primary-500' : 'text-neutral-400'}
            `}>
              {finalRightIcon}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* Error Message */}
      {error && (
        <View className="flex-row items-center mt-2 ml-1">
          <Text className="text-danger-500 text-xs mr-1">⚠️</Text>
          <Text className="text-danger-500 text-xs font-medium flex-1">
            {error}
          </Text>
        </View>
      )}
      
      {/* Hint Message */}
      {hint && !error && (
        <View className="flex-row items-center mt-2 ml-1">
          <Text className="text-neutral-400 text-xs mr-1">💡</Text>
          <Text className="text-neutral-500 text-xs flex-1">
            {hint}
          </Text>
        </View>
      )}
    </View>
  );
}

// ==============================================================================
// 🔘 BUTTON COMPONENT - DESIGN PROFISSIONAL
// ==============================================================================

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'danger' | 'warning' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: string;
  rightIcon?: string;
  fullWidth?: boolean;
  className?: string;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
}: ButtonProps) {
  const isDisabled = disabled || loading;
  
  // Classes base
  const baseClasses = `
    flex-row items-center justify-center rounded-xl font-semibold
    shadow-sm active:scale-95 transition-all duration-150
    ${fullWidth ? 'w-full' : 'self-start'}
  `;
  
  // Classes de variante
  const variantClasses = {
    primary: `bg-primary-500 shadow-primary-500/30 ${isDisabled ? 'opacity-50' : 'active:bg-primary-600 active:shadow-primary-600/40'}`,
    secondary: `bg-neutral-500 shadow-neutral-500/30 ${isDisabled ? 'opacity-50' : 'active:bg-neutral-600 active:shadow-neutral-600/40'}`,
    accent: `bg-accent-500 shadow-accent-500/30 ${isDisabled ? 'opacity-50' : 'active:bg-accent-600 active:shadow-accent-600/40'}`,
    success: `bg-success-500 shadow-success-500/30 ${isDisabled ? 'opacity-50' : 'active:bg-success-600 active:shadow-success-600/40'}`,
    danger: `bg-danger-500 shadow-danger-500/30 ${isDisabled ? 'opacity-50' : 'active:bg-danger-600 active:shadow-danger-600/40'}`,
    warning: `bg-warning-500 shadow-warning-500/30 ${isDisabled ? 'opacity-50' : 'active:bg-warning-600 active:shadow-warning-600/40'}`,
    outline: `bg-transparent border-2 border-primary-500 ${isDisabled ? 'opacity-50' : 'active:bg-primary-50'}`,
    ghost: `bg-transparent ${isDisabled ? 'opacity-50' : 'active:bg-neutral-100'}`,
  };
  
  // Classes de tamanho
  const sizeClasses = {
    sm: 'px-3 py-2',
    md: 'px-5 py-3',
    lg: 'px-6 py-4',
    xl: 'px-8 py-5',
  };
  
  // Classes de texto baseadas na variante
  const textVariantClasses = {
    primary: 'text-white',
    secondary: 'text-white',
    accent: 'text-white',
    success: 'text-white',
    danger: 'text-white',
    warning: 'text-white',
    outline: 'text-primary-500',
    ghost: 'text-neutral-700',
  };
  
  // Classes de tamanho do texto
  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };
  
  // Tamanho dos ícones
  const iconSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };
  
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      activeOpacity={0.8}
    >
      {/* Loading Indicator */}
      {loading && (
        <ActivityIndicator 
          size={size === 'sm' ? 'small' : 'small'} 
          color={variant === 'outline' || variant === 'ghost' ? '#3b82f6' : 'white'}
          style={{ marginRight: 8 }}
        />
      )}
      
      {/* Left Icon */}
      {leftIcon && !loading && (
        <Text className={`${iconSizeClasses[size]} mr-2 ${textVariantClasses[variant]}`}>
          {leftIcon}
        </Text>
      )}
      
      {/* Title */}
      <Text className={`font-semibold ${textSizeClasses[size]} ${textVariantClasses[variant]}`}>
        {loading ? 'Carregando...' : title}
      </Text>
      
      {/* Right Icon */}
      {rightIcon && !loading && (
        <Text className={`${iconSizeClasses[size]} ml-2 ${textVariantClasses[variant]}`}>
          {rightIcon}
        </Text>
      )}
    </TouchableOpacity>
  );
}

// ==============================================================================
// 📱 CARD COMPONENT - DESIGN PROFISSIONAL
// ==============================================================================

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onPress?: () => void;
}

export function Card({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  onPress
}: CardProps) {
  const variantClasses = {
    default: 'bg-white border border-neutral-200 shadow-sm',
    elevated: 'bg-white shadow-lg shadow-neutral-900/10',
    outlined: 'bg-white border-2 border-neutral-300',
    filled: 'bg-neutral-50 border border-neutral-200',
  };
  
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  };
  
  const Component = onPress ? TouchableOpacity : View;
  
  return (
    <Component
      onPress={onPress}
      className={`
        rounded-2xl
        ${variantClasses[variant]}
        ${paddingClasses[padding]}
        ${className}
      `}
      activeOpacity={onPress ? 0.95 : 1}
    >
      {children}
    </Component>
  );
}

// ==============================================================================
// 📄 SCREEN CONTAINER - DESIGN PROFISSIONAL
// ==============================================================================

interface ScreenContainerProps {
  children: React.ReactNode;
  showBackButton?: boolean;
  title?: string;
  subtitle?: string;
  onBackPress?: () => void;
  headerActions?: React.ReactNode;
  className?: string;
  scrollable?: boolean;
  safeArea?: boolean;
}

export function ScreenContainer({
  children,
  showBackButton = false,
  title,
  subtitle,
  onBackPress,
  headerActions,
  className = '',
  scrollable = false,
  safeArea = true
}: ScreenContainerProps) {
  const Container = scrollable ? require('react-native').ScrollView : View;
  
  return (
    <View className={`flex-1 bg-neutral-50 ${className}`}>
      {/* Status Bar Space */}
      {safeArea && <View className="h-12 bg-neutral-50" />}
      
      {/* Header */}
      {(showBackButton || title || headerActions) && (
        <View className="bg-white border-b border-neutral-200 shadow-sm">
          <View className="flex-row items-center justify-between px-4 py-4">
            {/* Left Side */}
            <View className="flex-row items-center flex-1">
              {showBackButton && (
                <TouchableOpacity
                  onPress={onBackPress}
                  className="mr-4 p-2 -ml-2 rounded-xl active:bg-neutral-100"
                  activeOpacity={0.7}
                >
                  <Text className="text-primary-500 text-lg font-semibold">← Voltar</Text>
                </TouchableOpacity>
              )}
              
              {title && (
                <View className="flex-1">
                  <Text className="text-neutral-900 text-xl font-bold">
                    {title}
                  </Text>
                  {subtitle && (
                    <Text className="text-neutral-500 text-sm mt-1">
                      {subtitle}
                    </Text>
                  )}
                </View>
              )}
            </View>
            
            {/* Right Side */}
            {headerActions && (
              <View className="ml-4">
                {headerActions}
              </View>
            )}
          </View>
        </View>
      )}
      
      {/* Content */}
      <Container
        style={{ flex: 1 }}
        contentContainerStyle={scrollable ? { flexGrow: 1 } : undefined}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </Container>
    </View>
  );
}

// ==============================================================================
// ⚡ STATUS BADGE COMPONENT
// ==============================================================================

interface StatusBadgeProps {
  status: 'iniciada' | 'em_carregamento' | 'em_transito' | 'entregue' | 'cancelada' | 'pendente';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export function StatusBadge({ status, size = 'md', showIcon = true }: StatusBadgeProps) {
  const statusConfig = {
    iniciada: { 
      label: 'Iniciada', 
      color: 'bg-warning-100 text-warning-700 border-warning-200', 
      icon: '🟡' 
    },
    em_carregamento: { 
      label: 'Em Carregamento', 
      color: 'bg-primary-100 text-primary-700 border-primary-200', 
      icon: '🔵' 
    },
    em_transito: { 
      label: 'Em Trânsito', 
      color: 'bg-accent-100 text-accent-700 border-accent-200', 
      icon: '🚛' 
    },
    entregue: { 
      label: 'Entregue', 
      color: 'bg-success-100 text-success-700 border-success-200', 
      icon: '✅' 
    },
    cancelada: { 
      label: 'Cancelada', 
      color: 'bg-danger-100 text-danger-700 border-danger-200', 
      icon: '❌' 
    },
    pendente: { 
      label: 'Pendente', 
      color: 'bg-neutral-100 text-neutral-700 border-neutral-200', 
      icon: '⏳' 
    },
  };
  
  const config = statusConfig[status];
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };
  
  return (
    <View className={`
      inline-flex flex-row items-center rounded-full border font-medium
      ${config.color}
      ${sizeClasses[size]}
    `}>
      {showIcon && (
        <Text className="mr-1">
          {config.icon}
        </Text>
      )}
      <Text className={`font-semibold ${config.color.split(' ')[1]}`}>
        {config.label}
      </Text>
    </View>
  );
}

// ==============================================================================
// 📊 LOADING SCREEN PROFISSIONAL
// ==============================================================================

interface LoadingScreenProps {
  message?: string;
  submessage?: string;
}

export function LoadingScreen({ 
  message = 'Carregando...', 
  submessage = 'Aguarde um momento'
}: LoadingScreenProps) {
  return (
    <View className="flex-1 bg-neutral-50 items-center justify-center px-8">
      {/* Logo */}
      <View className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl items-center justify-center mb-8 shadow-lg shadow-primary-500/30">
        <Text className="text-white text-4xl">🚛</Text>
      </View>
      
      {/* Brand */}
      <Text className="text-3xl font-bold text-neutral-900 mb-2">
        LogiTrack
      </Text>
      
      <Text className="text-neutral-600 text-center mb-8 leading-6">
        Sistema de Gerenciamento de Transporte
      </Text>
      
      {/* Loading */}
      <View className="items-center mb-8">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-neutral-500 text-center mt-4 font-medium">
          {message}
        </Text>
        <Text className="text-neutral-400 text-center text-sm mt-1">
          {submessage}
        </Text>
      </View>
      
      {/* Footer */}
      <View className="absolute bottom-8 left-8 right-8">
        <Text className="text-neutral-400 text-xs text-center">
          Versão 1.0.0 • Feito com ❤️ para logística
        </Text>
      </View>
    </View>
  );
}