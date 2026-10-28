import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Theme {
  backgroundColor: string;
  backgroundGradient?: readonly [string, string, string]; // for gradient backgrounds
  textColor: string;
  buttonColor: string;
  buttonTextColor: string;
  inputBackground: string;
  inputTextColor: string;
  highlightColor: string; // for expiring items
  buttonBorderRadius: number;
  accentColor: string; // for highlights and icons
}

const lightTheme: Theme = {
  backgroundColor: '#E8F5E8',
  backgroundGradient: ['#E8F5E8', '#F1F8E9', '#E8F5E8'],
  textColor: '#000000',
  buttonColor: '#00BCD4',
  buttonTextColor: '#FFFFFF',
  inputBackground: '#FFF8E1',
  inputTextColor: '#000000ff',
  highlightColor: '#FFE0B2',
  buttonBorderRadius: 20,
  accentColor: '#FF9800',
};

const darkTheme: Theme = {
  backgroundColor: '#1B1B1B',
  backgroundGradient: ['#1B1B1B', '#263238', '#1B1B1B'],
  textColor: '#E0E0E0',
  buttonColor: '#2196F3',
  buttonTextColor: '#FFFFFF',
  inputBackground: '#424242',
  inputTextColor: '#E0E0E0',
  highlightColor: '#FFF59D',
  buttonBorderRadius: 20,
  accentColor: '#FFC107',
};

interface ThemeContextType {
  theme: Theme;
  isDarkMode: boolean;
  toggleTheme: () => void;
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
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const theme = isDarkMode ? darkTheme : lightTheme;

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
