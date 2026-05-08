import React, { forwardRef } from 'react';
import { TextInput, StyleSheet, ViewStyle } from 'react-native';

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

const Input = forwardRef<any, InputProps>(({ 
  variant = 'default', 
  inputSize = 'medium', 
  style,
  ...props 
}, ref) => {
  const getInputStyle = () => {
    const baseStyle = styles.input;
    
    const variantStyles = {
      default: styles.inputDefault,
      url: styles.urlInput,
      search: styles.searchInput
    };
    
    const sizeStyles = {
      small: styles.inputSmall,
      medium: styles.inputMedium,
      large: styles.inputLarge
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
      placeholderTextColor="rgba(0, 0, 0, 0.45)"
      {...props}
    />
  );
});

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#dadce0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#202124',
    backgroundColor: '#ffffff',
  },
  inputDefault: {
    borderColor: '#dadce0',
  },
  urlInput: {
    borderColor: 'rgba(0, 0, 0, 0.12)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 13.5,
    backgroundColor: 'transparent',
  },
  searchInput: {
    borderColor: '#dadce0',
  },
  inputSmall: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
    minHeight: 32,
  },
  inputMedium: {
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 40,
  },
  inputLarge: {
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
  },
});

export default Input;
