import React, { useContext, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ImageBackground, Animated } from 'react-native';
import { AppleAuthContext } from '../Contexts/AppleAuthContext';
import { ThemeContext } from '../Contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';

export default function LoginScreen() {
  const { user, handleAppleLogin } = useContext(AppleAuthContext);
  const { theme } = useContext(ThemeContext);
  const navigation = useNavigation();

  const [scaleValue] = useState(new Animated.Value(1));

  const handleButtonPressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handleButtonPressOut = async () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();

    await handleAppleLogin();
    navigation.navigate('App', { screen: 'Dreams' });
  };

  if (user) {
    return null;
  }

  return (
    <ImageBackground source={require('../../assets/image_background.png')} style={styles(theme).backgroundImage}>
      <View style={styles(theme).overlay}>
        <View style={styles(theme).logoContainer}>
          <Image source={require('../../assets/icon.png')} style={styles(theme).logo} />
        </View>
        <View style={styles(theme).heroCard}>
          <Text style={styles(theme).heroTitle}>Lucid Journal</Text>
          <Text style={styles(theme).heroSubtitle}>Your AI Dream Journal Guide</Text>
        </View>
        <Animated.View style={[styles(theme).loginButton, { transform: [{ scale: scaleValue }] }]}>
          <TouchableOpacity
            activeOpacity={1}
            onPressIn={handleButtonPressIn}
            onPressOut={handleButtonPressOut}
            style={styles(theme).loginButtonTouchable}
          >
            <Text style={styles(theme).loginButtonText}>Login with Apple</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </ImageBackground>
  );
}

const styles = (theme) => StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
    backgroundColor: '#e1e9ff',  // Gentle gradient
  },
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',  // Soft overlay for depth
  },
  logoContainer: {
    width: 140,
    height: 140,
    marginBottom: 40,
    borderRadius: 70,
    backgroundColor: '#f0f4ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
    borderRadius: 70,
  },
  heroCard: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 25,
    padding: 24,
    marginBottom: 40,
    width: '90%',
    shadowColor: '#aaa',
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 5,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 19,
    color: 'white',
    marginTop: 20,
    textAlign: 'center',
    lineHeight: 24,
  },
  loginButton: {
    backgroundColor: theme.colors.button,
    borderRadius: 35,
    width: '90%',
    shadowColor: '#aaa',
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 5,
  },
  loginButtonTouchable: {
    paddingVertical: 18,
    borderRadius: 35,
    alignItems: 'center',
    width: '100%',
  },
  loginButtonText: {
    color: theme.colors.background,
    fontSize: 20,
    fontWeight: "bold",
  },
});
