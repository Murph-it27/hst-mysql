import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
} from 'react';

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
  backgroundGradient?: readonly [string, string, string];
}

const lightTheme: Theme = {
  backgroundColor: colors.cream,
  textColor: colors.ink,
  buttonColor: colors.olive,
  buttonTextColor: colors.white,
  inputBackground: colors.white,
  inputTextColor: colors.ink,
  highlightColor: colors.beige,
  buttonBorderRadius: 16,
  accentColor: colors.olive,
};

const darkTheme: Theme = {
  backgroundColor: '#20251D',
  textColor: '#F5F1E8',
  buttonColor: '#879B62',
  buttonTextColor: colors.white,
  inputBackground: '#30382B',
  inputTextColor: '#FFFFFF',
  highlightColor: '#424B37',
  buttonBorderRadius: 16,
  accentColor: colors.sage,
};

interface ThemeContextType {
  theme: Theme;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext =
  createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      'useTheme must be used within ThemeProvider'
    );
  }

  return context;
};

export const ThemeProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const theme = isDarkMode ? darkTheme : lightTheme;

  const toggleTheme = () => {
    setIsDarkMode(previous => !previous);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDarkMode,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};