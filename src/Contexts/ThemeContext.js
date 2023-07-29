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
  dark: false, // Add this line
  colors: {
    ...DefaultTheme.colors,
    background: "#F0F0F0",
    primary: "#00ADB5",  // Add this line
    text: "#333333",
    card: "#FFFFFF", // Add this line for light theme card color
  },
};

const darkTheme = {
  ...DefaultTheme,
  dark: true, // Add this line
  colors: {
    ...DefaultTheme.colors,
    background: "#0C0E17",
    primary: "#00ADB5",  // Add this line
    text: "#A0AEC0",
    card: "#0C0E17", // Add this line for dark theme card color
  },
}; 