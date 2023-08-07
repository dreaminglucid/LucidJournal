import React, { useContext, useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Alert, ScrollView } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { ThemeContext } from '../Contexts/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Text } from 'react-native-paper';
import { API_URL } from "../../config";

const SettingsScreen = () => {
  const { theme, changeTheme } = useContext(ThemeContext);
  const styles = getStyles(theme);
  const [currentImageStyle, setImageStyle] = useState('renaissance');
  const [userToken, setUserToken] = useState(null);
  const [showThemeOptions, setShowThemeOptions] = useState(false);
  const [showImageStyleOptions, setShowImageStyleOptions] = useState(false);

  const themeSwitches = [
    { theme: 'dark', icon: 'weather-night' },
    { theme: 'light', icon: 'weather-sunny' },
    { theme: 'forest', icon: 'pine-tree' },
    { theme: 'galaxy', icon: 'space-station' },
    { theme: 'woodland', icon: 'pine-tree-box' },
    { theme: 'royal', icon: 'crown' },
    { theme: 'cipherProxy', icon: 'eye' },
  ];

  const imageStyles = [
    { style: 'renaissance', icon: 'artstation', description: 'Renaissance' },
    { style: 'abstract', icon: 'shape-outline', description: 'Abstract' },
    { style: 'modern', icon: 'image-filter-hdr', description: 'Modern' },
  ];

  useEffect(() => {
    const fetchInitialData = async () => {
      const userJson = await SecureStore.getItemAsync('appleUser');
      const user = JSON.parse(userJson);
      setUserToken(user.id_token);

      // Fetch the saved image style
      const savedImageStyle = await SecureStore.getItemAsync('selectedImageStyle');
      if (savedImageStyle) {
        setImageStyle(savedImageStyle);
      }
    };

    fetchInitialData();
  }, []);

  const toggleThemeOptions = () => {
    setShowThemeOptions(prev => !prev);
    setShowImageStyleOptions(false);
  };

  const toggleImageStyleOptions = () => {
    setShowImageStyleOptions(prev => !prev);
    setShowThemeOptions(false);
  };

  const updateImageStyle = async (style) => {
    if (!userToken) {
      Alert.alert("Error", "Failed to fetch user token.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/user/image-style`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({ style })
      });

      if (!response.ok) {
        throw new Error("Network response was not ok.");
      }

      // Save the selected style to SecureStore
      await SecureStore.setItemAsync('selectedImageStyle', style);

      setImageStyle(style);
      Alert.alert("Success", "Image style updated successfully.");

    } catch (error) {
      Alert.alert("Error", "Failed to update image style.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={[styles.header, { color: theme.colors.text }]}>Settings</Text>

      <Text style={[styles.subHeader, { color: theme.colors.text }]}>Appearance</Text>

      <TouchableOpacity onPress={toggleThemeOptions} style={styles.listItem}>
        <MaterialCommunityIcons name="palette" color={theme.colors.text} size={24} style={styles.icon} />
        <Text style={[styles.listItemText, { color: theme.colors.text }]}>Theme</Text>
        <MaterialCommunityIcons name={showThemeOptions ? "chevron-up" : "chevron-down"} color={theme.colors.button} size={24} />
      </TouchableOpacity>

      {showThemeOptions && themeSwitches.map(({ theme: themeName, icon }) => (
        <TouchableOpacity key={themeName} style={styles.optionItem} onPress={() => changeTheme(themeName)}>
          <MaterialCommunityIcons name={icon} color={theme.colors.button} size={28} />
          <Text style={[
            styles.optionText,
            { color: theme.colors.text, fontWeight: themeName === theme.themeName ? '900' : 'normal' }
          ]}>
            {themeName.charAt(0).toUpperCase() + themeName.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}

      <Text style={[styles.subHeader, { color: theme.colors.text, marginTop: 30 }]}>Image Settings</Text>

      <TouchableOpacity onPress={toggleImageStyleOptions} style={styles.listItem}>
        <MaterialCommunityIcons name="image" color={theme.colors.text} size={24} style={styles.icon} />
        <Text style={[styles.listItemText, { color: theme.colors.text }]}>Image Style</Text>
        <MaterialCommunityIcons name={showImageStyleOptions ? "chevron-up" : "chevron-down"} color={theme.colors.button} size={24} />
      </TouchableOpacity>

      {showImageStyleOptions && imageStyles.map(({ style, icon, description }) => (
        <TouchableOpacity key={style} style={styles.optionItem} onPress={() => updateImageStyle(style)}>
          <MaterialCommunityIcons name={icon} color={theme.colors.button} size={28} />
          <Text style={[
            styles.optionText,
            { color: theme.colors.text, fontWeight: style === currentImageStyle ? '900' : 'normal' }
          ]}>
            {description}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    marginLeft: 20,
    marginRight: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    paddingBottom: 16,
    paddingTop: 16,
  },
  subHeader: {
    fontSize: 18,
    fontWeight: '500',
    paddingBottom: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.background,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderColor: theme.colors.button,
  },
  listItemText: {
    fontSize: 16,
    flex: 1,
    fontWeight: 700,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderColor: theme.colors.button,
  },
  optionText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  icon: {
    marginRight: 8,
  }
});

export default SettingsScreen;