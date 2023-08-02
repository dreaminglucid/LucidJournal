import React, { useContext } from 'react';
import { Button, View, StyleSheet } from 'react-native';
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
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <Button
        title="Login with Apple"
        color={theme.colors.text}
        onPress={handleLogin}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
});
