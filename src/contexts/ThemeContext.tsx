import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appearance, useColorScheme } from 'react-native';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeColors {
  // Background colors
  background: string;
  surface: string;
  card: string;
  overlay: string;
  
  // Text colors
  text: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  
  // Border colors
  border: string;
  borderSecondary: string;
  borderFocus: string;
  
  // Button colors
  buttonPrimary: string;
  buttonPrimaryText: string;
  buttonSecondary: string;
  buttonSecondaryText: string;
  buttonNav: string;
  buttonNavText: string;
  
  // Input colors
  inputBackground: string;
  inputBorder: string;
  inputText: string;
  inputPlaceholder: string;
  
  // Status colors
  error: string;
  warning: string;
  success: string;
  info: string;
  
  // Navigation colors
  tabBar: string;
  toolbar: string;
  activeTab: string;
  inactiveTab: string;
  
  // Shadow colors
  shadow: string;
  shadowLight: string;
}

const lightTheme: ThemeColors = {
  // Background colors
  background: '#ffffff',
  surface: '#f8f9fa',
  card: '#ffffff',
  overlay: 'rgba(0, 0, 0, 0.5)',
  
  // Text colors
  text: '#202124',
  textSecondary: '#5f6368',
  textTertiary: 'rgba(0, 0, 0, 0.45)',
  textInverse: '#ffffff',
  
  // Border colors
  border: '#dadce0',
  borderSecondary: 'rgba(0, 0, 0, 0.08)',
  borderFocus: '#1a73e8',
  
  // Button colors
  buttonPrimary: '#1a73e8',
  buttonPrimaryText: '#ffffff',
  buttonSecondary: '#f8f9fa',
  buttonSecondaryText: '#202124',
  buttonNav: 'rgba(0, 0, 0, 0.04)',
  buttonNavText: 'rgba(0, 0, 0, 0.72)',
  
  // Input colors
  inputBackground: '#ffffff',
  inputBorder: '#dadce0',
  inputText: '#202124',
  inputPlaceholder: 'rgba(0, 0, 0, 0.45)',
  
  // Status colors
  error: '#ea4335',
  warning: '#fbbc04',
  success: '#34a853',
  info: '#1a73e8',
  
  // Navigation colors
  tabBar: '#f5f5f5',
  toolbar: '#f8f8f8',
  activeTab: '#f8f9fa',
  inactiveTab: 'rgba(255, 255, 255, 0.45)',
  
  // Shadow colors
  shadow: 'rgba(0, 0, 0, 0.1)',
  shadowLight: 'rgba(0, 0, 0, 0.04)',
};

const darkTheme: ThemeColors = {
  // Background colors
  background: '#1a1a1a',
  surface: '#2d2d2d',
  card: '#2d2d2d',
  overlay: 'rgba(0, 0, 0, 0.7)',
  
  // Text colors
  text: '#ffffff',
  textSecondary: '#9e9e9e',
  textTertiary: 'rgba(255, 255, 255, 0.45)',
  textInverse: '#000000',
  
  // Border colors
  border: '#404040',
  borderSecondary: 'rgba(255, 255, 255, 0.08)',
  borderFocus: '#8ab4f8',
  
  // Button colors
  buttonPrimary: '#8ab4f8',
  buttonPrimaryText: '#000000',
  buttonSecondary: '#2d2d2d',
  buttonSecondaryText: '#ffffff',
  buttonNav: 'rgba(255, 255, 255, 0.08)',
  buttonNavText: 'rgba(255, 255, 255, 0.72)',
  
  // Input colors
  inputBackground: '#2d2d2d',
  inputBorder: '#404040',
  inputText: '#ffffff',
  inputPlaceholder: 'rgba(255, 255, 255, 0.45)',
  
  // Status colors
  error: '#f28b82',
  warning: '#fdd663',
  success: '#81c995',
  info: '#8ab4f8',
  
  // Navigation colors
  tabBar: '#2d2d2d',
  toolbar: '#333333',
  activeTab: '#404040',
  inactiveTab: 'rgba(45, 45, 45, 0.45)',
  
  // Shadow colors
  shadow: 'rgba(0, 0, 0, 0.3)',
  shadowLight: 'rgba(0, 0, 0, 0.1)',
};

interface ThemeContextType {
  theme: Theme;
  colors: ThemeColors;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
  systemTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = React.memo(({ children }) => {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState<Theme>('system');
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(
    systemColorScheme === 'dark' || systemColorScheme === 'light' ? systemColorScheme : 'light'
  );

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      const newTheme = colorScheme === 'dark' || colorScheme === 'light' ? colorScheme : 'light';
      setSystemTheme(newTheme);
    });

    return () => subscription.remove();
  }, []);

  const getEffectiveTheme = (): 'light' | 'dark' => {
    if (theme === 'system') {
      return systemTheme;
    }
    return theme;
  };

  const effectiveTheme = getEffectiveTheme();
  const colors = effectiveTheme === 'dark' ? darkTheme : lightTheme;
  const isDark = effectiveTheme === 'dark';

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  const value: ThemeContextType = {
    theme,
    colors,
    isDark,
    setTheme: handleSetTheme,
    systemTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
});

ThemeProvider.displayName = 'ThemeProvider';
