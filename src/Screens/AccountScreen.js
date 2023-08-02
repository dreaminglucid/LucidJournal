import React, { useContext, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
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
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <Text style={{color: theme.colors.text}}>Email: {email}</Text>
      <Button title="Logout" onPress={handleUserLogout} color={theme.colors.text} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
});