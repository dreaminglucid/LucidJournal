// LoginScreen.js
import React, { useContext } from 'react';
import { Button, View, StyleSheet } from 'react-native';
import { GitHubAuthContext } from '../Contexts/GithubAuthContext';

export default function LoginScreen() {
  const { user, promptAsync } = useContext(GitHubAuthContext);

  if (user) {
    return null; // If user is already logged in, don't show login screen
  }

  return (
    <View style={styles.container}>
      <Button
        title="Login with GitHub"
        color="#00ADB5"
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
    backgroundColor: '#0C0E17',
  },
});
