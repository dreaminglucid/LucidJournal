import React, { createContext, useState } from 'react';
import { DefaultTheme } from '@react-navigation/native';

export const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(darkTheme);

  const changeTheme = (themeType) => {
    switch (themeType) {
      case 'light':
        setTheme(lightTheme);
        break;
      case 'forest':
        setTheme(forestTheme);
        break;
      case 'galaxy':
        setTheme(galaxyTheme);
        break;
      case 'woodland':
        setTheme(woodlandTheme);
        break;
        case 'royal':
          setTheme(royalTheme);
          break;
          case 'cipherProxy':
            setTheme(cipherProxyTheme);
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
  themeName: 'light',
  dark: false,
  colors: {
    ...DefaultTheme.colors,
    background: "#F8F8F8",  // Light gray for background
    primary: "#3C3C3C",  // Dark gray for primary actions and emphasis
    text: "#3C3C3C",  // Dark gray for text
    card: "#E8E8E8",  // Slightly darker than background for cards
    button: "#3C3C3C",  // Dark gray for buttons
  },
};

const darkTheme = {
  ...DefaultTheme,
  dark: true,
  themeName: 'dark',
  colors: {
    ...DefaultTheme.colors,
    background: "#121212",  // Dark gray almost black for background
    primary: "#E0E0E0",  // Light gray for primary actions and emphasis
    text: "#E0E0E0",  // Light gray for text
    card: "#1F1F1F",  // Slightly lighter than background for cards
    button: "#E0E0E0",  // Light gray for buttons
  },
};

const forestTheme = {
  ...DefaultTheme,
  dark: true,
  themeName: 'forest',
  colors: {
    ...DefaultTheme.colors,
    background: "#00331A", // Deep evergreen
    primary: "#4C9A2A", // Fresh green
    text: "#D9EAD3", // Soft Green
    card: "#1E5631", // Darker leaf green
    button: "#6ABC45", // Slightly brighter green for contrast
  },
};

const galaxyTheme = {
  ...DefaultTheme,
  themeName: 'galaxy',
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    background: "#1D2951", // Deep Space Blue
    primary: "#8797D6", // Soft Pastel Indigo
    text: "#F0F0F3", // Soft White
    card: "#303A52", // Darker Space Blue
    button: "#98A4D3", // A bit more saturated indigo for contrast
  },
};

const woodlandTheme = {
  ...DefaultTheme,
  themeName: 'woodland',
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    background: "#3C2F2F", // Deep Brown, reminiscent of a dark mahogany wood
    primary: "#705D56", // Medium Brown, similar to walnut wood
    text: "#D9C3B0", // Light Cream, like parchment or dried birch bark
    card: "#5D4C46", // Darker Brown, like a shadowy oak wood
    button: "#967259", // Warm Brown, like the glow of a campfire or autumn leaves
  },
};

const royalTheme = {
  ...DefaultTheme,
  themeName: 'royal',
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    background: "#1A1334", // Deeper Royal Blue
    primary: "#2A225A", // Darker Royal Blue
    text: "#F0E6D2", // Soft Gold
    card: "#241663", // Original Deep Royal Blue
    button: "#BFA431", // More realistic gold
  },
};

const cipherProxyTheme = {
  ...DefaultTheme,
  themeName: 'cipherProxy',
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    background: "#131314", // Deep Black
    primary: "#42dbf9", // Neon Blue
    text: "#F0E6D2", // Cyber Yellow
    card: "#101010", // Deep Black
    button: "#f9d342", // Neon Blue, same as primary
  },
};