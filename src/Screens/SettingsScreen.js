import React, { useContext } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { ThemeContext } from '../Contexts/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Text } from 'react-native-paper';

const SettingsScreen = () => {
  const { theme, changeTheme } = useContext(ThemeContext);

  const themeSwitches = [
    { theme: 'dark', icon: 'weather-night' },
    { theme: 'light', icon: 'weather-sunny' },
    { theme: 'forest', icon: 'pine-tree' },
    { theme: 'galaxy', icon: 'space-station' },
    { theme: 'woodland', icon: 'pine-tree-box' },
    { theme: 'royal', icon: 'crown' },
    { theme: 'cipherProxy', icon: 'eye' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.text, { color: theme.colors.text }]}>Settings</Text>
      {themeSwitches.map(({ theme: themeName, icon }) => (
        <TouchableOpacity
          style={styles.themeContainer}
          key={themeName}
          onPress={() => changeTheme(themeName)}
        >
          <MaterialCommunityIcons
            name={icon}
            color={theme.colors.button}
            size={32}
          />
          <Text style={[
            styles.themeName, 
            { color: theme.colors.text },
            themeName === theme.themeName ? styles.selectedTheme : null, // New line
          ]}>
            {themeName.charAt(0).toUpperCase() + themeName.slice(1)} {/* Capitalize first letter */}
          </Text>
        </TouchableOpacity>
      ))}
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
    marginBottom: 20,
  },
  themeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', 
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 10,
    width: '60%', 
    height: 50, 
  },
  themeName: {
    fontSize: 18,
  },
  selectedTheme: { // New style
    fontWeight: '900',
  }
});

export default SettingsScreen;