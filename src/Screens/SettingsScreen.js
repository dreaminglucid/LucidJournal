import React, { useContext, useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { ThemeContext } from '../Contexts/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Text } from 'react-native-paper';
import { API_URL } from "../../config";

const SettingsScreen = () => {
  const { theme, changeTheme } = useContext(ThemeContext);
  const [currentImageStyle, setImageStyle] = useState('renaissance');
  const [userToken, setUserToken] = useState(null);

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
    { style: 'renaissance', description: 'Renaissance' },
    { style: 'abstract', description: 'Abstract' },
    { style: 'modern', description: 'Modern' },
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
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.text, { color: theme.colors.text }]}>Settings</Text>

      {themeSwitches.map(({ theme: themeName, icon }) => (
        <TouchableOpacity
          style={styles.themeContainer}
          key={themeName}
          onPress={() => changeTheme(themeName)}
        >
          <MaterialCommunityIcons name={icon} color={theme.colors.button} size={32} />
          <Text style={[
            styles.themeName,
            { color: theme.colors.text },
            themeName === theme.themeName ? styles.selectedTheme : null,
          ]}>
            {themeName.charAt(0).toUpperCase() + themeName.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}

      <Text style={[styles.text, { color: theme.colors.text, marginTop: 20 }]}>Image Styles</Text>
      {imageStyles.map(({ style, description }) => (
        <TouchableOpacity
          style={styles.styleContainer}
          key={style}
          onPress={() => updateImageStyle(style)}
        >
          <Text style={[
            styles.styleName,
            { color: theme.colors.text },
            style === currentImageStyle ? styles.selectedStyle : null,
          ]}>
            {description}
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
  selectedTheme: {
    fontWeight: '900',
  },
  styleContainer: {
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
  styleName: {
    fontSize: 18,
  },
  selectedStyle: {
    fontWeight: '900',
  }
});

export default SettingsScreen;