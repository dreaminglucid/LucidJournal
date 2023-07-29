import React, { useContext } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { GitHubAuthContext } from '../Contexts/GithubAuthContext';
import { ThemeContext } from '../Contexts/ThemeContext';

export default function AccountScreen() {
  const { user, handleLogout } = useContext(GitHubAuthContext);
  const { theme } = useContext(ThemeContext);

  if (!user) {
    return null; // If user is not logged in, don't show account screen
  }

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <Text style={{color: theme.colors.text}}>Email: {user.email}</Text>
      <Text style={{color: theme.colors.text}}>Name: {user.login}</Text>
      <Button title="Logout" onPress={handleLogout} color={theme.colors.text} />
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