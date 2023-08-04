import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AppleAuthContext } from '../Contexts/AppleAuthContext';
import { ThemeContext } from '../Contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';

export default function LoginScreen() {
  const { user, handleAppleLogin } = useContext(AppleAuthContext);
  const { theme } = useContext(ThemeContext);
  const navigation = useNavigation();

  const handleLogin = async () => {
    await handleAppleLogin();
    navigation.navigate('App', { screen: 'Dreams' });  // Navigate to the 'Dreams' tab
  };

  if (user) {
    return null; // If user is already logged in, don't show login screen
  }

  return (
    <View style={styles(theme).container}>
      <View style={styles(theme).heroCard}>
        <Text style={styles(theme).heroTitle}>Lucid Journal</Text>
        <Text style={styles(theme).heroSubtitle}>Your AI Dream Journal Guide</Text>
      </View>
      <TouchableOpacity style={styles(theme).loginButton} onPress={handleLogin}>
        <Text style={styles(theme).loginButtonText}>Login with Apple</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  heroCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    width: '90%',
    shadowColor: "#123",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.26,
    shadowRadius: 2,
    elevation: 4,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 18,
    color: theme.colors.text,
    marginTop: 10,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: theme.colors.button,
    padding: 15,
    borderRadius: 20,
    width: '90%',
    alignItems: 'center',
  },
  loginButtonText: {
    color: theme.colors.background,
    fontSize: 18,
    fontWeight: "bold",
  },
});
