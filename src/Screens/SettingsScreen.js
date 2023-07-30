import React, { useContext } from 'react';
import { StyleSheet, View, Animated } from 'react-native';
import { ThemeContext } from '../Contexts/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Text, Switch } from 'react-native-paper';

const SettingsScreen = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.text, { color: theme.colors.text }]}>Settings</Text>
      <View style={styles.switchContainer}>
        <MaterialCommunityIcons
          name={theme.dark ? "weather-night" : "weather-sunny"}
          color={theme.colors.text}
          size={32}
        />
        <Switch
          color={theme.colors.text}
          value={theme.dark}
          onValueChange={toggleTheme}
          trackColor={{ true: theme.colors.text, false: '#767577' }}
          thumbColor={theme.colors.background}
          style={styles.switch}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  text: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 10,
  },
  switch: {
    marginLeft: 10,
  },
});

export default SettingsScreen;
