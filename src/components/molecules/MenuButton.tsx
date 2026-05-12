import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import Icon from '../atoms/Icon';

interface MenuButtonProps {
  onPress: () => void;
  style?: any;
}

const MenuButton: React.FC<MenuButtonProps> = React.memo(({ onPress, style }) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.menuButton, { backgroundColor: colors.buttonSecondary }, style]}
      onPress={onPress}
      accessibilityLabel="Menu"
      accessibilityRole="button"
    >
      <Icon name="ellipsis-vertical" size="medium" />
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  menuButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});

export default MenuButton;
