import React, { useContext, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AppleAuthContext } from '../Contexts/AppleAuthContext';
import { ThemeContext } from '../Contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';

export default function AccountScreen() {
  const { user, handleLogout } = useContext(AppleAuthContext);
  const { theme } = useContext(ThemeContext);
  const navigation = useNavigation();

  useEffect(() => {
    console.log("User in AccountScreen: ", user);
  }, [user]);

  console.log("User: ", user);

  if (!user) {
    return null; // If user is not logged in, don't show account screen
  }

  const handleUserLogout = async () => {
    await handleLogout();
    navigation.navigate('Login');  // replace 'Login' with your actual LoginScreen name in the navigation stack
  };

  const email = user.email || "No email available";

  return (
    <View style={styles(theme).container}>
      <View style={styles(theme).card}>
        <Text style={styles(theme).cardTitle}>Account Information</Text>
        <Text style={styles(theme).cardText}>Email: {email}</Text>
        <TouchableOpacity style={styles(theme).button} onPress={handleUserLogout}>
          <Text style={styles(theme).buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#123",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.26,
    shadowRadius: 2,
    elevation: 4,
    width: '90%',
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 20,
  },
  cardText: {
    fontSize: 18,
    color: theme.colors.text,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#00ADB5',
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: theme.colors.background,
    fontSize: 18,
  },
});
