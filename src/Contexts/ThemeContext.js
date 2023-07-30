import React, { createContext, useState } from 'react';
import { DefaultTheme } from '@react-navigation/native';

export const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true); // Set initial state to true

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

const lightTheme = {
  ...DefaultTheme,
  dark: false,
  colors: {
    ...DefaultTheme.colors,
    background: "#F0F0F0",
    primary: "#00ADB5",
    text: "#333333",
    card: "#D0D0D0", // Slightly darker color for light theme
  },
};

const darkTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    background: "#0C0E17",
    primary: "#00ADB5",
    text: "#A0AEC0",
    card: "#1C1E27", // Slightly lighter color for dark theme
  },
};