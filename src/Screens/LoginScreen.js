import React, { useContext } from 'react';
import { Button, View, StyleSheet } from 'react-native';
import { GitHubAuthContext } from '../Contexts/GithubAuthContext';
import { ThemeContext } from '../Contexts/ThemeContext';

export default function LoginScreen() {
  const { user, promptAsync } = useContext(GitHubAuthContext);
  const { theme } = useContext(ThemeContext);

  if (user) {
    return null; // If user is already logged in, don't show login screen
  }

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <Button
        title="Login with GitHub"
        color={theme.colors.text}
        disabled // DISABLED UNTILL APPLE DEV IS APPROVED
        onPress={() => {
          promptAsync();
        }}
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