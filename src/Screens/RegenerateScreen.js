// React and React Native Libraries
import React, { useState, useEffect, useContext } from "react";
import {
  StyleSheet,
  View,
  Text,
  Alert,
  Image,
  Animated,
  ActivityIndicator,
  ScrollView,
} from "react-native";

// UI Component Libraries
import { Button, Card, Subheading, FAB } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { ThemeContext } from '../Contexts/ThemeContext';
import * as SecureStore from 'expo-secure-store';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';

// Application Specific Imports
import { API_URL } from "../../config";

const RegenerateScreen = ({ route, navigation }) => {
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);
  const { dreamId } = route.params;
  const [dream, setDream] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [imageData, setImageData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [shouldRegenerateAnalysis, setShouldRegenerateAnalysis] = useState(false);
  const [shouldRegenerateImage, setShouldRegenerateImage] = useState(false);
  const [canSave, setCanSave] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState("");
  const [animation, setAnimation] = useState(new Animated.Value(0));

  useEffect(() => {
    if (route.params && route.params.dreamData) {
      let dreamData = route.params.dreamData;
      setDream(dreamData);
      if ("analysis" in dreamData) {
        let analysisText = dreamData.analysis;
        try {
          // Try to parse the string as JSON
          const parsedText = JSON.parse(analysisText);
          if (typeof parsedText === "string") {
            // If the parsed result is a string, use it
            analysisText = parsedText;
          }
        } catch (e) {
          // If parsing fails, it's not valid JSON, so we'll just use the original string
        }
        analysisText = analysisText.replace(/\\"/g, '"').replace(/\\n/g, "\n");
        setAnalysisResult(analysisText);
      }
      if ("image" in dreamData) {
        setImageData(dreamData.image);
      }
    } else {
      fetchDream();
    }
  }, []);

  useEffect(() => {
    if (dream && shouldRegenerateAnalysis) {
      handleRegenerateAnalysis();
    }
  }, [dream, shouldRegenerateAnalysis]);

  useEffect(() => {
    if (dream && shouldRegenerateImage) {
      handleRegenerateImage();
    }
  }, [dream, shouldRegenerateImage]);

  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Error', 'Media Library permissions are required to move images.');
      }
    })();
  }, []);

  useEffect(() => {
    if (isLoading) {
      const animate = Animated.loop(
        Animated.sequence([
          Animated.timing(animation, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(animation, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      );
      animate.start();
    } else {
      animation.stopAnimation();
    }
  }, [isLoading]);

  const fetchDream = async () => {
    try {
      const response = await fetch(`${API_URL}/api/dreams/${dreamId}`);
      if (response.ok) {
        let dreamData = await response.json();
        if ("analysis" in dreamData) {
          let analysisText = dreamData.analysis;
          try {
            // Try to parse the string as JSON
            const parsedText = JSON.parse(analysisText);
            if (typeof parsedText === "string") {
              // If the parsed result is a string, use it
              analysisText = parsedText;
            }
          } catch (e) {
            // If parsing fails, it's not valid JSON, so we'll just use the original string
          }
          analysisText = analysisText
            .replace(/\\"/g, '"')
            .replace(/\\n/g, "\n");
          setAnalysisResult(analysisText);
        }
        if ("image" in dreamData) {
          setImageData(dreamData.image);
        }
        setDream(dreamData);
      } else {
        Alert.alert("Error", "Failed to fetch dream details.");
      }
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", "An unexpected error occurred.");
    }
  };

  const handleRegenerateAnalysis = () => {
    setIsLoading(true);
    setLoadingStatus("Regenerating Analysis");
    generateDreamAnalysis()
      .then((newAnalysisResult) => {
        setAnalysisResult(newAnalysisResult);
        setShouldRegenerateAnalysis(false);
        setCanSave(true);
        setIsLoading(false);
        setLoadingStatus("");
      })
      .catch((error) => {
        console.error("Error during analysis regeneration:", error);
        Alert.alert(
          "Error",
          "An unexpected error occurred during analysis regeneration.",
        );
        setCanSave(false);
        setIsLoading(false);
        setLoadingStatus("");
      });
  };

  const handleRegenerateImage = () => {
    setIsLoading(true);
    setLoadingStatus("Regenerating Image");
    generateDreamImage()
      .then((newImageData) => {
        // Just set the new image data without overwriting the existing one
        setImageData(newImageData);
        setShouldRegenerateImage(false);
        setCanSave(true);
        setIsLoading(false);
        setLoadingStatus("");
      })
      .catch((error) => {
        console.error("Error during image regeneration:", error);
        Alert.alert(
          "Error",
          "An unexpected error occurred during image regeneration.",
        );
        setCanSave(false);
        setIsLoading(false);
        setLoadingStatus("");
      });
  };

  const overwriteSaveImage = async (dreamId, newImageData) => {
    // Define a temporary URI for downloading
    const tempUri = FileSystem.documentDirectory + `temp_image_${dreamId}.jpg`;

    // If it's a URL, download the image to a temporary URI
    let localUri = newImageData;
    if (newImageData.startsWith('http')) {
      const { uri } = await FileSystem.downloadAsync(newImageData, tempUri);
      localUri = uri;
    }

    // Fetch the existing URI for the dream image
    const oldImageURI = await fetchLocalImageURI(dreamId);
    if (oldImageURI) {
      // Move the old image to the "Old Dreams" album
      await moveOldImage(oldImageURI);

      // Copy the new image from the temporary URI to the old image URI
      await FileSystem.copyAsync({
        from: localUri,
        to: oldImageURI,
      });

      // Delete the temporary file if it was downloaded
      if (localUri !== newImageData) {
        await FileSystem.deleteAsync(tempUri);
      }

      // Create asset from the new image URI
      const newAsset = await MediaLibrary.createAssetAsync(oldImageURI);

      // Retrieve or create the "Dreams" album
      const dreamsAlbum = await MediaLibrary.getAlbumAsync('Dreams') || await MediaLibrary.createAlbumAsync('Dreams', newAsset, false);

      // Add the new asset to the "Dreams" album
      const success = await MediaLibrary.addAssetsToAlbumAsync([newAsset], dreamsAlbum, false);

      if (!success) {
        console.warn('Failed to add asset to "Dreams" album.');
      }

      console.log("New image saved to URI:", oldImageURI);
      return oldImageURI;
    } else {
      console.error("Error: Could not find existing image for dreamId:", dreamId);
      throw new Error("Failed to overwrite image. Existing image not found.");
    }
  };

  const generateDreamAnalysis = async () => {
    const userJson = await SecureStore.getItemAsync('appleUser');
    const user = JSON.parse(userJson);

    const response = await fetch(`${API_URL}/api/dreams/${dreamId}/analysis`, {
      headers: {
        "Authorization": `Bearer ${user.id_token}`,  // Add this line
      },
    });
    if (!response.ok) {
      throw new Error("Failed to generate dream analysis.");
    }
    let analysis = await response.text();
    try {
      // Try to parse the string as JSON
      const parsedText = JSON.parse(analysis);
      if (typeof parsedText === "string") {
        // If the parsed result is a string, use it
        analysis = parsedText;
      }
    } catch (e) {
      // If parsing fails, it's not valid JSON, so we'll just use the original string
    }
    analysis = analysis.replace(/\\"/g, '"').replace(/\\n/g, "\n");
    return analysis;
  };

  const generateDreamImage = async () => {
    const userJson = await SecureStore.getItemAsync('appleUser');
    const user = JSON.parse(userJson);

    const response = await fetch(`${API_URL}/api/dreams/${dreamId}/image`, {
      headers: {
        "Authorization": `Bearer ${user.id_token}`,  // Add this line
      },
    });
    if (!response.ok) {
      throw new Error("Failed to generate dream image.");
    }
    const imageData = await response.json();
    return imageData.image;
  };

  const handleOverwriteSave = async () => {
    Alert.alert(
      "Overwrite Confirmation",
      "Are you sure you want to overwrite the save? Old images will not be lost.",
      [
        { text: "Cancel", onPress: () => { }, style: "cancel" },
        {
          text: "Yes",
          onPress: async () => {
            try {
              // Overwrite the image with the new image data
              const newImageURI = await overwriteSaveImage(dreamId, imageData);

              // Update the server with new analysis and new image URI
              const userJson = await SecureStore.getItemAsync('appleUser');
              const user = JSON.parse(userJson);

              const response = await fetch(`${API_URL}/api/dreams/${dreamId}`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${user.id_token}`,
                },
                body: JSON.stringify({ analysis: analysisResult, image: newImageURI }), // Use the newly generated image URI
              });

              if (response.ok) {
                Alert.alert("Success", "Analysis and image overwritten successfully!");
                setDream({
                  ...dream,
                  analysis: analysisResult,
                  image: newImageURI, // The new URI now contains the new image
                });
                // Go back to DetailsScreen after successful save
                navigation.navigate("Details", { dreamId, dreamUpdated: true });
              } else {
                Alert.alert("Error", "Failed to overwrite analysis and image.");
              }
            } catch (error) {
              console.error("Error:", error);
              Alert.alert("Error", "An unexpected error occurred.");
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const fetchLocalImageURI = async (dreamId) => {
    try {
      const fileUri = FileSystem.documentDirectory + `image_${dreamId}.jpg`;
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (fileInfo.exists) {
        console.log("Image found at URI:", fileUri);
        return fileUri;
      } else {
        console.warn("Image does not exist at URI:", fileUri);
      }
    } catch (error) {
      console.error('Error fetching local image:', error);
    }
    return null;
  };

  const createOldDreamsAlbum = async () => {
    const albumName = 'Old Dreams';
    const oldDreamsAlbum = await MediaLibrary.getAlbumAsync(albumName);
    if (oldDreamsAlbum) {
      return oldDreamsAlbum;
    } else {
      return await MediaLibrary.createAlbumAsync(albumName, false);
    }
  };

  const moveOldImage = async (oldImageURI) => {
    try {
      // Create asset from the old image URI
      const asset = await MediaLibrary.createAssetAsync(oldImageURI);

      // Retrieve the "Dreams" album
      const dreamsAlbum = await MediaLibrary.getAlbumAsync('Dreams');
      if (!dreamsAlbum) {
        console.warn('Dreams album not found.');
        return null;
      }

      // Remove asset from the "Dreams" album
      const successRemove = await MediaLibrary.removeAssetsFromAlbumAsync([asset], dreamsAlbum);
      if (!successRemove) {
        console.warn('Failed to remove asset from "Dreams" album.');
      } else {
        console.log('Successfully removed asset from "Dreams" album.');
      }

      // Create (or find) the album for old dreams
      const oldDreamsAlbum = await createOldDreamsAlbum();

      // Add asset to the old dreams album
      const successAdd = await MediaLibrary.addAssetsToAlbumAsync([asset], oldDreamsAlbum, false);
      if (!successAdd) {
        console.warn('Failed to add asset to "Old Dreams" album:', oldDreamsAlbum.title);
        return null;
      }

      console.log("Old image moved to album:", oldDreamsAlbum.title);
      return oldImageURI;
    } catch (error) {
      console.error('Error moving old image:', error);
      return null;
    }
  };

  const dot1 = animation.interpolate({
    inputRange: [0, 0.4, 0.8, 1],
    outputRange: [0, 1, 0, 0],
  });
  const dot2 = animation.interpolate({
    inputRange: [0, 0.2, 0.6, 1],
    outputRange: [0, 1, 0, 0],
  });
  const dot3 = animation.interpolate({
    inputRange: [0, 0, 0.4, 0.8, 1],
    outputRange: [0, 1, 0, 0, 0],
  });

  const animationStyles = {
    dot1: { opacity: dot1 },
    dot2: { opacity: dot2 },
    dot3: { opacity: dot3 },
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.button} />
          <View style={styles.loadingMessageContainer}>
            <Text style={styles.loadingMessage}>{loadingStatus}</Text>
            <Animated.Text style={[styles.loadingDot, animationStyles.dot1]}>
              .
            </Animated.Text>
            <Animated.Text style={[styles.loadingDot, animationStyles.dot2]}>
              .
            </Animated.Text>
            <Animated.Text style={[styles.loadingDot, animationStyles.dot3]}>
              .
            </Animated.Text>
          </View>
        </View>
      ) : (
        <>
          {dream && (
            <>
              <Card style={styles.card}>
                <Card.Content>
                  <View style={[styles.infoBlock, { flexDirection: 'column' }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                      <MaterialCommunityIcons name="book" color={theme.colors.button} size={24} />
                      <Subheading style={[styles.subLabel, { marginLeft: 10, color: theme.colors.button }]}>Dream Title</Subheading>
                    </View>
                    <Text style={styles.dreamTitle}>{dream.metadata.title}</Text>
                  </View>
                </Card.Content>
              </Card>

              <Card style={styles.card}>
                <Card.Content>
                  <View style={[styles.infoBlock, { flexDirection: 'column' }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                      <MaterialCommunityIcons name="calendar" color={theme.colors.button} size={24} />
                      <Subheading style={[styles.subLabel, { marginLeft: 10, color: theme.colors.button }]}>Dream Date</Subheading>
                    </View>
                    <Text style={styles.dreamDate}>{dream.metadata.date}</Text>
                  </View>
                </Card.Content>
              </Card>

              <Card style={styles.card}>
                <Card.Content>
                  <View style={[styles.infoBlock, { flexDirection: 'column' }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                      <MaterialCommunityIcons name="note-text" color={theme.colors.button} size={24} />
                      <Subheading style={[styles.subLabel, { marginLeft: 10, color: theme.colors.button }]}>Dream Entry</Subheading>
                    </View>
                    <Text style={styles.dreamEntry}>{dream.metadata.entry}</Text>
                  </View>
                </Card.Content>
              </Card>

              <Card style={styles.card}>
                <Card.Content>
                  <View style={[styles.infoBlock, { flexDirection: 'column' }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                      <MaterialCommunityIcons name="brain" color={theme.colors.button} size={24} />
                      <Subheading style={[styles.analysisLabel, { marginLeft: 10, color: theme.colors.button }]}>Dream Analysis</Subheading>
                    </View>
                    <Text style={styles.analysisResult}>{analysisResult}</Text>
                  </View>
                </Card.Content>
              </Card>

              {imageData && (
                <View style={styles.imageContainer}>
                  <Image source={{ uri: imageData }} style={styles.image} />
                </View>
              )}
            </>
          )}
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={() => setShouldRegenerateAnalysis(true)}
              style={{ ...styles.regenerateButton, marginBottom: 10 }}
              labelStyle={styles.regenerateButtonText}
            >
              Regenerate Analysis
            </Button>
            <Button
              mode="contained"
              onPress={() => setShouldRegenerateImage(true)}
              style={{ ...styles.regenerateButton, marginBottom: 10 }}
              labelStyle={styles.regenerateButtonText}
            >
              Regenerate Image
            </Button>
            <Button
              mode="contained"
              onPress={handleOverwriteSave}
              disabled={!canSave}
              style={styles.overwriteButton}
              labelStyle={styles.overwriteButtonText}
            >
              Overwrite Save
            </Button>
          </View>
        </>
      )}
    </ScrollView>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: theme.colors.background,
  },
  card: {
    backgroundColor: theme.colors.card,
    marginBottom: 20,
    borderRadius: 22,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.26,
    shadowRadius: 2,
    elevation: 4,
  },
  subLabel: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    color: theme.colors.primary,
  },
  loadingMessage: {
    fontSize: 20,
    color: theme.colors.text,
  },
  loadingContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    zIndex: 1,
  },
  loadingMessageContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 33,
  },
  loadingDots: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  loadingDot: {
    color: theme.colors.button,
    fontSize: 20,
    marginHorizontal: 5,
  },
  analysisLabel: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
    color: theme.colors.primary,
  },
  analysisResult: {
    fontSize: 18,
    marginBottom: 10,
    color: theme.colors.text,
  },
  imageContainer: {
    alignItems: "center",
    marginTop: 15,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.33,
    shadowRadius: 3,
    elevation: 6,
  },
  image: {
    width: 350,
    height: 350,
    resizeMode: "contain",
    borderRadius: 35,
  },
  infoBlock: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  cardActions: {
    justifyContent: "space-between",
  },
  regenerateButton: {
    marginBottom: 15,
    borderRadius: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.33,
    shadowRadius: 3,
    elevation: 6,
    backgroundColor: theme.colors.button,
    width: "100%",
  },
  overwriteButton: {
    marginTop: 15,
    marginBottom: 15,
    borderRadius: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.33,
    shadowRadius: 3,
    elevation: 6,
    backgroundColor: theme.colors.button,
  },
  regenerateButtonText: {
    color: theme.colors.background,
    fontWeight: "bold",
    fontSize: 18,
  },
  overwriteButtonText: {
    color: theme.colors.background,
    fontWeight: "bold",
    fontSize: 18,
  },
  dreamTitle: {
    fontSize: 20,
    marginBottom: 10,
    color: theme.colors.text,
    fontWeight: "bold",
  },
  dreamDate: {
    fontSize: 18,
    marginBottom: 10,
    color: theme.colors.text,
    fontWeight: "bold",
  },
  dreamEntry: {
    fontSize: 18,
    marginBottom: 10,
    color: theme.colors.text,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 18,
    marginBottom: 25,
    color: theme.colors.text,
  },
  dropShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 5,
  },
  buttonStyle: {
    borderRadius: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.33,
    shadowRadius: 3,
    elevation: 6,
  },
  buttonTextStyle: {
    color: theme.colors.text,
    fontWeight: "bold",
    fontSize: 18,
  },
});

export default RegenerateScreen;