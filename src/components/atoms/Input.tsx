import React, { forwardRef } from 'react';
import { TextInput, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface InputProps {
  variant?: 'default' | 'url' | 'search';
  inputSize?: 'small' | 'medium' | 'large';
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  disabled?: boolean;
  style?: ViewStyle;
  onKeyPress?: (e: any) => void;
}

const Input = React.memo(forwardRef<any, InputProps>(({ 
  variant = 'default', 
  inputSize = 'medium', 
  style,
  ...props 
}, ref) => {
  const { colors } = useTheme();

  const getInputStyle = () => {
    const baseStyle = {
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      fontSize: 14,
      color: colors.inputText,
      backgroundColor: colors.inputBackground,
    };
    
    const variantStyles = {
      default: {},
      url: {
        borderColor: colors.borderSecondary,
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 6,
        fontSize: 13.5,
        backgroundColor: 'transparent',
      },
      search: {}
    };
    
    const sizeStyles = {
      small: {
        fontSize: 12,
        paddingHorizontal: 8,
        paddingVertical: 6,
        minHeight: 32,
      },
      medium: {},
      large: {
        fontSize: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        minHeight: 48,
      }
    };
    
    return [
      baseStyle,
      variantStyles[variant],
      sizeStyles[inputSize],
      style
    ];
  };

  return (
    <TextInput
      ref={ref}
      style={getInputStyle()}
      placeholderTextColor={colors.inputPlaceholder}
      {...props}
    />
  );
}));


export default Input;
