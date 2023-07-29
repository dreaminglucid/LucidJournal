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

// Application Specific Imports
import { API_URL } from "../config";

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

  const generateDreamAnalysis = async () => {
    const response = await fetch(`${API_URL}/api/dreams/${dreamId}/analysis`);
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
    const response = await fetch(`${API_URL}/api/dreams/${dreamId}/image`);
    if (!response.ok) {
      throw new Error("Failed to generate dream image.");
    }
    const imageData = await response.json();
    return imageData.image;
  };

  const handleOverwriteSave = async () => {
    try {
      const response = await fetch(`${API_URL}/api/dreams/${dreamId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ analysis: analysisResult, image: imageData }),
      });

      if (response.ok) {
        Alert.alert("Success", "Analysis and image overwritten successfully!");
        setDream({
          ...dream,
          analysis: analysisResult,
          image: imageData,
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
          <ActivityIndicator size="large" color="#00ADB5" />
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
                  <View style={styles.infoBlock}>
                    <MaterialCommunityIcons
                      name="book"
                      color="#00ADB5"
                      size={24}
                    />
                    <Subheading style={styles.subLabel}>Dream Title</Subheading>
                    <Text style={styles.dreamTitle}>
                      {dream.metadata.title}
                    </Text>
                  </View>
                </Card.Content>
              </Card>
              <Card style={styles.card}>
                <Card.Content>
                  <View style={styles.infoBlock}>
                    <MaterialCommunityIcons
                      name="calendar"
                      color="#00ADB5"
                      size={24}
                    />
                    <Subheading style={styles.subLabel}>Dream Date</Subheading>
                    <Text style={styles.dreamDate}>{dream.metadata.date}</Text>
                  </View>
                </Card.Content>
              </Card>
              <Card style={styles.card}>
                <Card.Content>
                  <View style={styles.infoBlock}>
                    <MaterialCommunityIcons
                      name="note-text"
                      color="#00ADB5"
                      size={24}
                    />
                    <Subheading style={styles.subLabel}>Dream Entry</Subheading>
                    <Text style={styles.dreamEntry}>
                      {dream.metadata.entry}
                    </Text>
                  </View>
                </Card.Content>
              </Card>
              <Card style={styles.card}>
                <Card.Content>
                  <View style={styles.infoBlock}>
                    <MaterialCommunityIcons
                      name="brain"
                      color="#00ADB5"
                      size={24}
                    />
                    <Subheading style={styles.analysisLabel}>
                      Dream Analysis
                    </Subheading>
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
              style={{ ...styles.regenerateButton, marginBottom: 10 }} // Added marginBottom here
              labelStyle={styles.regenerateButtonText}
            >
              Regenerate Analysis
            </Button>
            <Button
              mode="contained"
              onPress={() => setShouldRegenerateImage(true)}
              style={{ ...styles.regenerateButton, marginBottom: 10 }} // Added marginBottom here
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
    borderWidth: 2.22,
    borderColor: "#123",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
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
    color: "#00ADB5",
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
  },
  image: {
    width: 350,
    height: 350,
    resizeMode: "contain",
    borderRadius: 35,
  },
  infoBlock: {
    marginBottom: 0,
  },
  cardActions: {
    justifyContent: "space-between",
  },
  regenerateButton: {
    marginBottom: 15,
    ...this.buttonStyle,
    backgroundColor: "#7851A9",
    width: "100%",
  },
  overwriteButton: {
    marginTop: 15,
    marginBottom: 15,
    ...this.buttonStyle,
    backgroundColor: "#7851A9",
  },
  regenerateButtonText: {
    ...this.buttonTextStyle,
  },
  overwriteButtonText: {
    ...this.buttonTextStyle,
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
    shadowOpacity: 0.8,
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