import React, { useContext, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AppleAuthContext } from '../Contexts/AppleAuthContext';
import { ThemeContext } from '../Contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function AccountScreen() {
  const { user, handleLogout } = useContext(AppleAuthContext);
  const { theme } = useContext(ThemeContext);
  const navigation = useNavigation();

  useEffect(() => {
    console.log("User in AccountScreen: ", user);
  }, [user]);

  if (!user) {
    return null; // If user is not logged in, don't show account screen
  }

  const handleUserLogout = async () => {
    await handleLogout();
    navigation.navigate('Login');
  };

  const email = user.email || "No email available";

  return (
    <View style={styles(theme).container}>
      <View style={styles(theme).header}>
        <MaterialCommunityIcons name="account-circle" size={120} color={theme.colors.primary} style={styles(theme).iconShadow} />
        <Text style={styles(theme).headerText}>Account</Text>
      </View>
      <View style={styles(theme).infoContainer}>
        <Text style={styles(theme).label}>Email</Text>
        <Text style={styles(theme).emailText}>{email}</Text>
      </View>
      <TouchableOpacity style={styles(theme).button} onPress={handleUserLogout}>
        <Text style={styles(theme).buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: 50,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
  },
  headerText: {
    fontSize: 30,
    fontWeight: '900',
    color: theme.colors.text,
    marginTop: 15,
  },
  iconShadow: {
    shadowColor: "#aaa",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  infoContainer: {
    paddingBottom: 25,
    marginBottom: 25,
    alignItems: 'center',
  },
  label: {
    fontSize: 18,
    color: theme.colors.text,
    marginBottom: 10,
  },
  emailText: {
    fontSize: 22,
    fontWeight: '900',
    color: theme.colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: theme.colors.button,
    paddingVertical: 15,
    width: '100%',
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },  
  buttonText: {
    color: theme.colors.background,
    fontSize: 19,
    fontWeight: "bold",
  },
});