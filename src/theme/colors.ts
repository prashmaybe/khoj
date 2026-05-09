export interface ColorPalette {
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
  
  // Gradient colors (matching logo)
  gradientPrimary: string[];
  gradientSecondary: string[];
  gradientAccent: string[];
}

export const lightColors: ColorPalette = {
  // Background colors
  background: '#ffffff',
  surface: '#fafbff',
  card: '#ffffff',
  overlay: 'rgba(0, 0, 0, 0.5)',
  
  // Text colors
  text: '#1a1a2e',
  textSecondary: '#6b7280',
  textTertiary: 'rgba(107, 70, 193, 0.6)',
  textInverse: '#ffffff',
  
  // Border colors
  border: '#e5e7eb',
  borderSecondary: 'rgba(107, 70, 193, 0.1)',
  borderFocus: '#6b46c1',
  
  // Button colors
  // Keep brand color for primary actions, but make browser chrome neutral.
  buttonPrimary: '#6b46c1',
  buttonPrimaryText: '#ffffff',
  buttonSecondary: '#fafbff',
  buttonSecondaryText: '#1a1a2e',
  buttonNav: 'rgba(60, 64, 67, 0.08)',
  buttonNavText: '#3c4043',
  
  // Input colors
  inputBackground: '#ffffff',
  inputBorder: '#e5e7eb',
  inputText: '#1a1a2e',
  inputPlaceholder: 'rgba(107, 70, 193, 0.5)',
  
  // Status colors
  error: '#ef4444',
  warning: '#f97316',
  success: '#10b981',
  info: '#3b82f6',
  
  // Navigation colors (Chrome-like)
  tabBar: '#f1f3f4',
  toolbar: '#f1f3f4',
  activeTab: '#ffffff',
  inactiveTab: '#e8eaed',
  
  // Shadow colors
  shadow: 'rgba(107, 70, 193, 0.15)',
  shadowLight: 'rgba(107, 70, 193, 0.05)',
  
  // Gradient colors (matching logo)
  gradientPrimary: ['#6b46c1', '#3b82f6'],
  gradientSecondary: ['#f97316', '#ec4899'],
  gradientAccent: ['#8b5cf6', '#f59e0b'],
};

export const darkColors: ColorPalette = {
  // Background colors
  background: '#0f0f0f',
  surface: '#1a1a2e',
  card: '#16213e',
  overlay: 'rgba(0, 0, 0, 0.8)',
  
  // Text colors
  text: '#ffffff',
  textSecondary: '#a78bfa',
  textTertiary: 'rgba(167, 139, 250, 0.6)',
  textInverse: '#0f0f0f',
  
  // Border colors
  border: '#374151',
  borderSecondary: 'rgba(167, 139, 250, 0.15)',
  borderFocus: '#a78bfa',
  
  // Button colors
  buttonPrimary: '#a78bfa',
  buttonPrimaryText: '#0f0f0f',
  buttonSecondary: '#16213e',
  buttonSecondaryText: '#ffffff',
  buttonNav: 'rgba(232, 234, 237, 0.10)',
  buttonNavText: '#e8eaed',
  
  // Input colors
  inputBackground: '#16213e',
  inputBorder: '#374151',
  inputText: '#ffffff',
  inputPlaceholder: 'rgba(167, 139, 250, 0.5)',
  
  // Status colors
  error: '#f87171',
  warning: '#fb923c',
  success: '#34d399',
  info: '#60a5fa',
  
  // Navigation colors (Chrome-like)
  tabBar: '#202124',
  toolbar: '#202124',
  activeTab: '#303134',
  inactiveTab: '#202124',
  
  // Shadow colors
  shadow: 'rgba(167, 139, 250, 0.25)',
  shadowLight: 'rgba(167, 139, 250, 0.1)',
  
  // Gradient colors (matching logo)
  gradientPrimary: ['#a78bfa', '#60a5fa'],
  gradientSecondary: ['#fb923c', '#f472b6'],
  gradientAccent: ['#c084fc', '#fbbf24'],
};
