import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'nav';
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}

const Button: React.FC<ButtonProps> = React.memo(({ 
  variant = 'primary', 
  size = 'medium', 
  children, 
  onPress,
  disabled = false,
  style
}) => {
  const getButtonStyle = () => {
    const baseStyle = styles.button;
    
    const variantStyles = {
      primary: styles.buttonPrimary,
      secondary: styles.buttonSecondary,
      nav: styles.navButton
    };
    
    const sizeStyles = {
      small: styles.buttonSmall,
      medium: styles.buttonMedium,
      large: styles.buttonLarge
    };
    
    return [
      baseStyle,
      variantStyles[variant],
      sizeStyles[size],
      style
    ];
  };

  const getTextStyle = () => {
    const baseTextStyle = styles.buttonText;
    
    const variantTextStyles = {
      primary: styles.buttonTextPrimary,
      secondary: styles.buttonTextSecondary,
      nav: styles.navButtonText
    };
    
    const sizeTextStyles = {
      small: styles.buttonTextSmall,
      medium: styles.buttonTextMedium,
      large: styles.buttonTextLarge
    };
    
    return [
      baseTextStyle,
      variantTextStyles[variant],
      sizeTextStyles[size]
    ];
  };

  return (
    <TouchableOpacity 
      style={getButtonStyle()} 
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={getTextStyle()}>{children}</Text>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  buttonPrimary: {
    backgroundColor: '#1a73e8',
    borderColor: '#1a73e8',
  },
  buttonSecondary: {
    backgroundColor: '#f8f9fa',
    borderColor: '#dadce0',
  },
  navButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    borderColor: 'rgba(0, 0, 0, 0.08)',
    borderRadius: 999,
  },
  buttonSmall: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    minHeight: 32,
  },
  buttonMedium: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 40,
  },
  buttonLarge: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    minHeight: 48,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  buttonTextPrimary: {
    color: '#ffffff',
  },
  buttonTextSecondary: {
    color: '#202124',
  },
  navButtonText: {
    color: 'rgba(0, 0, 0, 0.72)',
    fontSize: 14,
  },
  buttonTextSmall: {
    fontSize: 12,
  },
  buttonTextMedium: {
    fontSize: 14,
  },
  buttonTextLarge: {
    fontSize: 16,
  },
});

export default Button;
