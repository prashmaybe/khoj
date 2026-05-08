import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface IconProps {
  name: string;
  size?: 'small' | 'medium' | 'large';
  style?: any;
}

const Icon: React.FC<IconProps> = React.memo(({ name, size = 'medium', style }) => {
  const { colors } = useTheme();

  const getIconStyle = () => {
    const baseStyle = [styles.icon, { color: colors.text }];
    
    const sizeStyles = {
      small: styles.iconSmall,
      medium: styles.iconMedium,
      large: styles.iconLarge
    };
    
    return [
      baseStyle,
      sizeStyles[size],
      style
    ];
  };

  return <Text style={getIconStyle()}>{name}</Text>;
});

const styles = StyleSheet.create({
  icon: {
    textAlign: 'center',
  },
  iconSmall: {
    fontSize: 12,
  },
  iconMedium: {
    fontSize: 14,
  },
  iconLarge: {
    fontSize: 18,
  },
});

export default Icon;
