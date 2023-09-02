import React, { useContext, useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Alert, ScrollView, Linking } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
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
  const [currentImageQuality, setImageQuality] = useState('low');
  const [showImageQualityOptions, setShowImageQualityOptions] = useState(false);
  const [currentIntelligenceLevel, setIntelligenceLevel] = useState('general');
  const [showIntelligenceLevelOptions, setShowIntelligenceLevelOptions] = useState(false);

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
    { style: '3d-model', icon: 'cube-outline', description: '3D Model' },
    { style: 'analog-film', icon: 'film-outline', description: 'Analog Film' },
    { style: 'anime', icon: 'face-outline', description: 'Anime' },
    { style: 'cinematic', icon: 'video-outline', description: 'Cinematic' },
    { style: 'comic-book', icon: 'book-outline', description: 'Comic Book' },
    { style: 'digital-art', icon: 'brush-outline', description: 'Digital Art' },
    { style: 'enhance', icon: 'flash-outline', description: 'Enhance' },
    { style: 'fantasy-art', icon: 'rose-outline', description: 'Fantasy Art' },
    { style: 'isometric', icon: 'grid-outline', description: 'Isometric' },
    { style: 'line-art', icon: 'vector-line', description: 'Line Art' },
    { style: 'low-poly', icon: 'triangle-outline', description: 'Low-Poly' },
    { style: 'modeling-compound', icon: 'sculpture', description: 'Modeling Compound' },
    { style: 'neon-punk', icon: 'lightning-bolt-outline', description: 'Neon Punk' },
    { style: 'origami', icon: 'layers-outline', description: 'Origami' },
    { style: 'photographic', icon: 'camera-outline', description: 'Photographic' },
    { style: 'pixel-art', icon: 'pixelate', description: 'Pixel Art' },
    { style: 'tile-texture', icon: 'view-grid-outline', description: 'Tile Texture' },
  ];  

  const imageQualities = [
    { quality: 'low', resolution: '256x256', description: 'Low', icon: 'blur' },
    { quality: 'medium', resolution: '512x512', description: 'Medium', icon: 'blur-linear' },
    { quality: 'high', resolution: '1024x1024', description: 'High', icon: 'brightness-6' },
  ];
  // Intelligence level options
  const intelligenceLevels = [
    { level: 'simplified', description: 'Simplified' },
    { level: 'general', description: 'General' },
    { level: 'detailed', description: 'Detailed' },
    { level: 'expert', description: 'Expert' },
    { level: 'research', description: 'Research' },
  ];

  useEffect(() => {
    const fetchInitialData = async () => {
      // Fetch user token
      const userJson = await SecureStore.getItemAsync('appleUser');
      const user = JSON.parse(userJson);
      setUserToken(user.id_token);

      // Fetch the saved image style
      const savedImageStyle = await SecureStore.getItemAsync('selectedImageStyle');
      if (savedImageStyle) {
        setImageStyle(savedImageStyle);
      }

      // Fetch the saved image quality
      const savedImageQuality = await SecureStore.getItemAsync('selectedImageQuality');
      if (savedImageQuality) {
        setImageQuality(savedImageQuality);
      }

      // Fetch the saved intelligence level
      const savedIntelligenceLevel = await SecureStore.getItemAsync('selectedIntelligenceLevel');
      if (savedIntelligenceLevel) {
        setIntelligenceLevel(savedIntelligenceLevel);
      }
    };

    fetchInitialData();
  }, []);

  const toggleThemeOptions = () => {
    setShowThemeOptions(prev => !prev);
    setShowImageStyleOptions(false);
    setShowImageQualityOptions(false);
    setShowIntelligenceLevelOptions(false);
  };

  const toggleImageStyleOptions = () => {
    setShowImageStyleOptions(prev => !prev);
    setShowThemeOptions(false);
    setShowImageQualityOptions(false);
    setShowIntelligenceLevelOptions(false);
  };

  const toggleImageQualityOptions = () => {
    setShowImageQualityOptions(prev => !prev);
    setShowThemeOptions(false);
    setShowImageStyleOptions(false);
    setShowIntelligenceLevelOptions(false);
  };

  const toggleIntelligenceLevelOptions = () => {
    setShowIntelligenceLevelOptions(prev => !prev);
    setShowThemeOptions(false);
    setShowImageStyleOptions(false);
    setShowImageQualityOptions(false);
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

  const updateImageQuality = async (quality) => {
    if (!userToken) {
      Alert.alert("Error", "Failed to fetch user token.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/user/image-quality`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({ quality })
      });

      if (!response.ok) {
        throw new Error("Network response was not ok.");
      }

      // Save the selected quality to SecureStore
      await SecureStore.setItemAsync('selectedImageQuality', quality);

      setImageQuality(quality);
      Alert.alert("Success", "Image quality updated successfully.");
    } catch (error) {
      Alert.alert("Error", "Failed to update image quality.");
    }
  };

  const exportDreamsToPDF = async () => {
    console.log("Starting exportDreamsToPDF...");

    if (!userToken) {
      console.error("User token not found!");
      Alert.alert("Error", "Failed to fetch user token.");
      return;
    }

    console.log("User token found, initiating fetch request...");

    try {
      const response = await fetch(`${API_URL}/api/dreams/export/pdf`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userToken}`
        },
      });

      if (!response.ok) {
        console.error(`Fetch failed with status: ${response.status}`);
        throw new Error("Network response was not ok.");
      }

      console.log("Response received, fetching blob...");
      const blob = await response.blob();

      console.log("Blob received, converting to file...");
      const uri = FileSystem.cacheDirectory + 'dreams.pdf';
      const reader = new FileReader();
      reader.onload = async () => {
        const base64data = reader.result.split(',')[1];
        await FileSystem.writeAsStringAsync(uri, base64data, {
          encoding: FileSystem.EncodingType.Base64,
        });
        console.log("File written successfully to:", uri);

        // Check if sharing is available
        if (!(await Sharing.isAvailableAsync())) {
          Alert.alert(`Uh oh, sharing isn't available on your platform`);
          return;
        }

        // Share the file
        const sharingResult = await Sharing.shareAsync(uri);

        // If the user dismissed the sharing dialog, delete the temporary file
        if (sharingResult.dismissedAction) {
          await FileSystem.deleteAsync(uri);
          console.log("Sharing dismissed. Temporary file deleted.");
          return;
        }

        Alert.alert("Success", "Dreams exported successfully.");
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error("An error occurred:", error);
      Alert.alert("Error", "Failed to export dreams to PDF.");
    }

    console.log("exportDreamsToPDF finished.");
  };

  const updateIntelligenceLevel = async (level) => {
    if (!userToken) {
      Alert.alert("Error", "Failed to fetch user token.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/user/intelligence-level`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({ level })
      });

      if (!response.ok) {
        throw new Error("Network response was not ok.");
      }

      await SecureStore.setItemAsync('selectedIntelligenceLevel', level);
      setIntelligenceLevel(level);
      Alert.alert("Success", "Intelligence level updated successfully.");
    } catch (error) {
      Alert.alert("Error", "Failed to update intelligence level.");
    }
  };


  return (
    <ScrollView style={styles.container}>
      <Text style={[styles.header, { color: theme.colors.text }]}>Settings</Text>

      <Text style={[styles.subHeader, { color: theme.colors.text }]}>Appearance</Text>

      {/* Theme Options */}
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

      {/* Image Settings */}
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

      {/* Image Quality */}
      <TouchableOpacity onPress={toggleImageQualityOptions} style={styles.listItem}>
        <MaterialCommunityIcons name="quality-high" color={theme.colors.text} size={24} style={styles.icon} />
        <Text style={[styles.listItemText, { color: theme.colors.text }]}>Image Quality</Text>
        <MaterialCommunityIcons name={showImageQualityOptions ? "chevron-up" : "chevron-down"} color={theme.colors.button} size={24} />
      </TouchableOpacity>
      {showImageQualityOptions && imageQualities.map(({ quality, description, icon }) => (
        <TouchableOpacity key={quality} style={styles.optionItem} onPress={() => updateImageQuality(quality)}>
          <MaterialCommunityIcons name={icon} color={theme.colors.button} size={28} />
          <Text style={[
            styles.optionText,
            { color: theme.colors.text, fontWeight: quality === currentImageQuality ? '900' : 'normal' }
          ]}>
            {description}
          </Text>
        </TouchableOpacity>
      ))}

      {/* Intelligence Level */}
      <Text style={[styles.subHeader, { color: theme.colors.text, marginTop: 30 }]}>Personality Settings</Text>
      <TouchableOpacity onPress={toggleIntelligenceLevelOptions} style={styles.listItem}>
        <MaterialCommunityIcons name="brain" color={theme.colors.text} size={24} style={styles.icon} />
        <Text style={[styles.listItemText, { color: theme.colors.text }]}>Intelligence Level</Text>
        <MaterialCommunityIcons name={showIntelligenceLevelOptions ? "chevron-up" : "chevron-down"} color={theme.colors.button} size={24} />
      </TouchableOpacity>
      {showIntelligenceLevelOptions && intelligenceLevels.map(({ level, description }) => (
        <TouchableOpacity key={level} style={styles.optionItem} onPress={() => updateIntelligenceLevel(level)}>
          <MaterialCommunityIcons name="brain" color={theme.colors.button} size={28} />
          <Text style={[
            styles.optionText,
            { color: theme.colors.text, fontWeight: level === currentIntelligenceLevel ? '900' : 'normal' }
          ]}>
            {description}
          </Text>
        </TouchableOpacity>
      ))}
      
      {/* Export Options */}
      <Text style={[styles.subHeader, { color: theme.colors.text, marginTop: 30 }]}>Export Options</Text>
      <TouchableOpacity onPress={exportDreamsToPDF} style={styles.listItem}>
        <MaterialCommunityIcons name="file" color={theme.colors.text} size={24} style={styles.icon} />
        <Text style={[styles.listItemText, { color: theme.colors.text }]}>Export Dreams to PDF</Text>
      </TouchableOpacity>
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