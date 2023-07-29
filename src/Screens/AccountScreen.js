// AccountScreen.js
import React, { useContext } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { GitHubAuthContext } from '../Contexts/GithubAuthContext';

export default function AccountScreen() {
  const { user, handleLogout } = useContext(GitHubAuthContext);

  if (!user) {
    return null; // If user is not logged in, don't show account screen
  }

  return (
    <View style={styles.container}>
      <Text>Email: {user.email}</Text>
      <Text>Name: {user.login}</Text>
      <Button title="Logout" onPress={handleLogout} />
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