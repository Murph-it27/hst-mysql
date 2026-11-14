import React, { createContext, useContext, useState, ReactNode } from 'react';
import { colors } from '../theme/colors';

export interface Theme {
  backgroundColor: string;
  textColor: string;
  buttonColor: string;
  buttonTextColor: string;
  inputBackground: string;
  inputTextColor: string;
  highlightColor: string;
  buttonBorderRadius: number;
  accentColor: string;
  mutedColor: string;
  cardBorder: string;
  successBackground: string;
  successText: string;
  warningBackground: string;
  warningText: string;
  dangerBackground: string;
  dangerText: string;
}

const lightTheme: Theme = {
  backgroundColor: colors.background,
  textColor: colors.text,
  buttonColor: colors.brand,
  buttonTextColor: colors.white,
  inputBackground: colors.surface,
  inputTextColor: colors.text,
  highlightColor: colors.border,
  buttonBorderRadius: 12,
  accentColor: colors.brand,
  mutedColor: colors.muted,
  cardBorder: colors.border,
  successBackground: colors.successBg,
  successText: colors.successText,
  warningBackground: colors.warningBg,
  warningText: colors.warningText,
  dangerBackground: colors.dangerBg,
  dangerText: colors.dangerText,
};

const darkTheme: Theme = {
  backgroundColor: colors.darkBackground,
  textColor: colors.darkText,
  buttonColor: colors.brand,
  buttonTextColor: colors.white,
  inputBackground: colors.darkSurface,
  inputTextColor: colors.darkText,
  highlightColor: colors.darkBorder,
  buttonBorderRadius: 12,
  accentColor: '#10B981',
  mutedColor: colors.darkMuted,
  cardBorder: colors.darkBorder,
  successBackground: '#123326',
  successText: '#86EFAC',
  warningBackground: '#3B2F16',
  warningText: '#FCD34D',
  dangerBackground: '#3B1D25',
  dangerText: '#FCA5A5',
};

interface ThemeContextType {
  theme: Theme;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const theme = isDarkMode ? darkTheme : lightTheme;
  const toggleTheme = () => setIsDarkMode(previous => !previous);

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
