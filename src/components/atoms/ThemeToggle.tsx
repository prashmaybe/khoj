import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface ThemeToggleProps {
  style?: any;
}

const ThemeToggle: React.FC<ThemeToggleProps> = React.memo(({ style }) => {
  const { theme, setTheme, isDark, colors } = useTheme();

  const handleToggle = () => {
    if (theme === 'system') {
      setTheme('light');
    } else if (theme === 'light') {
      setTheme('dark');
    } else {
      setTheme('system');
    }
  };

  const getThemeIcon = () => {
    if (theme === 'system') {
      return isDark ? '🌙' : '☀️';
    }
    return theme === 'dark' ? '🌙' : '☀️';
  };

  const getThemeLabel = () => {
    if (theme === 'system') {
      return `System (${isDark ? 'Dark' : 'Light'})`;
    }
    return theme === 'dark' ? 'Dark' : 'Light';
  };

  return (
    <TouchableOpacity 
      style={[styles.themeToggle, { backgroundColor: colors.buttonSecondary, borderColor: colors.border }, style]} 
      onPress={handleToggle}
    >
      <View style={styles.themeToggleContent}>
        <Text style={[styles.themeIcon, { color: colors.text }]}>{getThemeIcon()}</Text>
        <Text style={[styles.themeLabel, { color: colors.buttonSecondaryText }]}>{getThemeLabel()}</Text>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  themeToggle: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 120,
  },
  themeToggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  themeIcon: {
    fontSize: 16,
  },
  themeLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ThemeToggle;
