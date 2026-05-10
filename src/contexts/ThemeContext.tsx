import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appearance, useColorScheme } from 'react-native';
import { lightColors, darkColors, incognitoColors, ColorPalette } from '../theme/colors';
import { typography, TypographyConfig } from '../theme/typography';
import { preferencesStorage } from '../services/PreferencesStorage';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeColors extends ColorPalette, TypographyConfig {}

const lightTheme: ThemeColors = {
  ...lightColors,
  ...typography,
};

const darkTheme: ThemeColors = {
  ...darkColors,
  ...typography,
};

const incognitoTheme: ThemeColors = {
  ...incognitoColors,
  ...typography,
};

interface ThemeContextType {
  theme: Theme;
  colors: ThemeColors;
  isDark: boolean;
  isIncognito: boolean;
  setTheme: (theme: Theme) => void;
  setIncognito: (incognito: boolean) => void;
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
  const [theme, setTheme] = useState<Theme>(() => {
    return preferencesStorage.loadTheme();
  });
  const [isIncognito, setIsIncognito] = useState<boolean>(() => {
    return preferencesStorage.loadIncognitoMode();
  });
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
  const colors = isIncognito ? incognitoTheme : (effectiveTheme === 'dark' ? darkTheme : lightTheme);
  const isDark = effectiveTheme === 'dark';

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    preferencesStorage.saveTheme(newTheme);
  };

  const handleSetIncognito = (newIncognito: boolean) => {
    setIsIncognito(newIncognito);
    preferencesStorage.saveIncognitoMode(newIncognito);
  };

  const value: ThemeContextType = {
    theme,
    colors,
    isDark,
    isIncognito,
    setTheme: handleSetTheme,
    setIncognito: handleSetIncognito,
    systemTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
});

ThemeProvider.displayName = 'ThemeProvider';
