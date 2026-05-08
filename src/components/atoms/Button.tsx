import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

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
  const { colors } = useTheme();

  const getButtonStyle = () => {
    const baseStyle = styles.button;
    
    const variantStyles = {
      primary: { backgroundColor: colors.buttonPrimary, borderColor: colors.buttonPrimary },
      secondary: { backgroundColor: colors.buttonSecondary, borderColor: colors.border },
      nav: { backgroundColor: colors.buttonNav, borderColor: colors.borderSecondary }
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
      primary: { color: colors.buttonPrimaryText },
      secondary: { color: colors.buttonSecondaryText },
      nav: { color: colors.buttonNavText }
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
