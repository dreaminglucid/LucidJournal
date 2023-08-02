import React, { createContext, useState } from 'react';
import { DefaultTheme } from '@react-navigation/native';

export const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(darkTheme);

  const changeTheme = (themeType) => {
    switch(themeType) {
      case 'light':
        setTheme(lightTheme);
        break;
      case 'forest':
        setTheme(forestTheme);
        break;
      case 'galaxy':
        setTheme(galaxyTheme);
        break;
      default:  // default is 'dark'
        setTheme(darkTheme);
        break;
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

const lightTheme = {
  ...DefaultTheme,
  dark: false,
  colors: {
    ...DefaultTheme.colors,
    background: "#F8F8F8",
    primary: "#00ADB5",
    text: "#333333",
    card: "#E8E8E8",
  },
};

const darkTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    background: "#000000",
    primary: "#00ADB5",
    text: "#A0AEC0",
    card: "#222222",
  },
};

const forestTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    background: "#063537", // Deep evergreen
    primary: "#387D38", // Fresh green
    text: "#E8F4E1", // Dappled sunlight
    card: "#305A30", // Darker leaf green
  },
};

const galaxyTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    background: "#1B2735", // dark blue
    primary: "#6F9CBB", // light blue
    text: "#E0E5EC", // almost white
    card: "#4F517D", // purple
  },
};
