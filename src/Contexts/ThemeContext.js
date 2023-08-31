import React, { createContext, useState, useEffect, useContext } from 'react';
import { Animated, View, Easing } from 'react-native';
import { DefaultTheme } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Gyroscope } from 'expo-sensors';

export const ThemeContext = createContext(null);

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

const GlassBackground = ({ children }) => {
  const { theme } = useContext(ThemeContext);
  const animatedValue = new Animated.Value(0);
  const [gyroData, setGyroData] = useState({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    const gyroscopeSubscription = Gyroscope.addListener(data => {
      setGyroData(data);
    });
    Gyroscope.setUpdateInterval(500);

    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 5000,
          easing: Easing.inOut(Easing.exp),
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 5000,
          easing: Easing.inOut(Easing.exp),
          useNativeDriver: false,
        }),
      ])
    ).start();

    return () => {
      gyroscopeSubscription && gyroscopeSubscription.remove();
    };
  }, []);

  const dynamicColors = animatedValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [
      theme.colors.primary,
      theme.colors.button,
      theme.colors.primary,
    ],
  });

  const blurIntensity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [50, 100],
  });

  const modifiedColors = [
    `rgba(${Math.abs(gyroData.x * 255)}, ${Math.abs(gyroData.y * 255)}, ${Math.abs(gyroData.z * 255)}, 0.2)`,
    dynamicColors,
    `rgba(${Math.abs(gyroData.z * 255)}, ${Math.abs(gyroData.x * 255)}, ${Math.abs(gyroData.y * 255)}, 0.2)`
  ];

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <AnimatedLinearGradient
        colors={modifiedColors}
        start={{ x: gyroData.x, y: gyroData.y }}
        end={{ x: gyroData.z, y: gyroData.x }}
        locations={[0, 0.5, 1]}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.4)', 'rgba(255, 255, 255, 0.1)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          flex: 1,
          borderRadius: 20,
          overflow: 'hidden',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.5,
          shadowRadius: 16,
        }}
      >
        <AnimatedBlurView
          intensity={blurIntensity}
          tint="light"
          style={{ flex: 1 }}
        >
          {children}
        </AnimatedBlurView>
      </LinearGradient>
    </View>
  );
};

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
      default:
        setTheme(darkTheme);
        break;
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, changeTheme }}>
      <GlassBackground>
        {children}
      </GlassBackground>
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