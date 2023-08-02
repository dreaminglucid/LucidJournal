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
    RefreshControl,
} from "react-native";
import { Button, Card, Subheading } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ThemeContext } from '../Contexts/ThemeContext';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from "../../config";

const DetailsScreen = ({ route, navigation }) => {
    const { theme } = useContext(ThemeContext);
    const styles = getStyles(theme);
    let { dreamId } = route.params;
    dreamId = String(dreamId);
    const [dream, setDream] = useState(null);
    const [analysisResult, setAnalysisResult] = useState("");
    const [imageData, setImageData] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingStatus, setLoadingStatus] = useState("");
    const [generationStatus, setGenerationStatus] = useState("idle");
    const animation = new Animated.Value(0);

    // Similar loading animation logic as in RegenerateScreen
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

    useEffect(() => {
        const unsubscribe = navigation.addListener("focus", fetchDream);

        // Call fetchDream for the first time
        fetchDream();

        return unsubscribe;
    }, [navigation, route.params.dreamUpdated, theme]);

    useEffect(() => {
        if (generationStatus === "generating") {
            handleGenerateDream();
        }
    }, [generationStatus]);

    const fetchDream = async () => {
        // Check if dream data was passed from the previous screen
        if (route.params && route.params.dreamData) {
            // If yes, use the passed data
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
            setIsRefreshing(false);
        } else {
            // If no data was passed, fetch the dream data as before
            try {
                setIsRefreshing(true);
                const userJson = await SecureStore.getItemAsync('appleUser');
                const user = JSON.parse(userJson);

                const response = await fetch(`${API_URL}/api/dreams/${dreamId}`, {
                    headers: {
                        "Authorization": `Bearer ${user.id_token}`,
                    },
                });

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
            } finally {
                setIsRefreshing(false);
            }
        }
    };

    const handleGenerateDream = () => {
        setIsLoading(true);
        setLoadingStatus("Generating Analysis & Image"); // Set loading status

        Promise.all([fetchDreamAnalysis(), fetchDreamImage()])
            .then(([analysis, image]) => {
                setAnalysisResult(analysis);
                setImageData(image);
                setIsLoading(false);
                setLoadingStatus("");
            })
            .catch((error) => {
                console.error("Error during dream generation:", error);
                Alert.alert(
                    "Error",
                    "An unexpected error occurred during dream generation.",
                );
                setIsLoading(false);
                setLoadingStatus("");
            });

        fetchDreamImage()
            .then((image) => {
                setImageData(image);
                if (!analysisResult) setIsLoading(false);  // Only set loading to false if analysis data has also been fetched
                setLoadingStatus("");
            })
            .catch((error) => {
                console.error("Error during image generation:", error);
                Alert.alert(
                    "Error",
                    "An unexpected error occurred during image generation.",
                );
                setIsLoading(false);
                setLoadingStatus("");
            });
    };

    useEffect(() => {
        if (analysisResult && imageData) {
            setIsLoading(false);
            setGenerationStatus("success");
        }
    }, [analysisResult, imageData]);

    const fetchDreamAnalysis = async () => {
        try {
            const userJson = await SecureStore.getItemAsync('appleUser');
            const user = JSON.parse(userJson);

            const response = await fetch(`${API_URL}/api/dreams/${dreamId}/analysis`, {
                headers: {
                    "Authorization": `Bearer ${user.id_token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch dream analysis.");
            }
            let analysisResult = await response.text();
            try {
                // Try to parse the string as JSON
                const parsedText = JSON.parse(analysisResult);
                if (typeof parsedText === "string") {
                    // If the parsed result is a string, use it
                    analysisResult = parsedText;
                }
            } catch (e) {
                // If parsing fails, it's not valid JSON, so we'll just use the original string
            }
            analysisResult = analysisResult
                .replace(/\\"/g, '"')
                .replace(/\\n/g, "\n");
            return analysisResult;
        } catch (error) {
            console.error("Error:", error);
            Alert.alert("Error", "An unexpected error occurred.");
            throw error; // Throw the error so it can be caught in handleGenerateDream
        }
    };

    const fetchDreamImage = async () => {
        try {
            const userJson = await SecureStore.getItemAsync('appleUser');
            const user = JSON.parse(userJson);

            const response = await fetch(`${API_URL}/api/dreams/${dreamId}/image`, {
                headers: {
                    "Authorization": `Bearer ${user.id_token}`,
                },
            });

            if (response.ok) {
                const imageData = await response.json();
                return imageData.image;
            } else {
                Alert.alert("Error", "Failed to fetch dream image.");
            }
        } catch (error) {
            console.error("Error:", error);
            Alert.alert("Error", "An unexpected error occurred.");
        }
    };

    const handleSaveAnalysisAndImage = async () => {
        try {
            const response = await fetch(`${API_URL}/api/dreams/${dreamId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ analysis: analysisResult, image: imageData }),
            });

            if (response.ok) {
                Alert.alert("Success", "Analysis and image saved successfully!");
                setDream({
                    ...dream,
                    analysis: analysisResult,
                    image: imageData,
                });
            } else {
                Alert.alert("Error", "Failed to save analysis and image.");
            }
        } catch (error) {
            console.error("Error:", error);
            Alert.alert("Error", "An unexpected error occurred.");
        }
    };

    return (
        <ScrollView
            contentContainerStyle={styles.container}
            refreshControl={
                <RefreshControl refreshing={isRefreshing} onRefresh={fetchDream} />
            }
        >
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#00ADB5" />
                    <View style={styles.loadingMessageContainer}>
                        <Text style={styles.loadingMessage}>{loadingStatus}</Text>
                        <Animated.Text style={[styles.loadingDot, { opacity: dot1 }]}>.</Animated.Text>
                        <Animated.Text style={[styles.loadingDot, { opacity: dot2 }]}>.</Animated.Text>
                        <Animated.Text style={[styles.loadingDot, { opacity: dot3 }]}>.</Animated.Text>
                    </View>
                </View>
            ) : (
                <>
                    {dream && (
                        <>
                            <Card style={styles.card}>
                                <Card.Content>
                                    <View style={styles.infoBlock}>
                                        <MaterialCommunityIcons name="book" color="#00ADB5" size={24} />
                                        <Subheading style={styles.subLabel}>Dream Title</Subheading>
                                        <Text style={styles.dreamTitle}>{dream.metadata.title}</Text>
                                    </View>
                                </Card.Content>
                            </Card>
                            <Card style={styles.card}>
                                <Card.Content>
                                    <View style={styles.infoBlock}>
                                        <MaterialCommunityIcons name="calendar" color="#00ADB5" size={24} />
                                        <Subheading style={styles.subLabel}>Dream Date</Subheading>
                                        <Text style={styles.dreamDate}>{dream.metadata.date}</Text>
                                    </View>
                                </Card.Content>
                            </Card>
                            <Card style={styles.card}>
                                <Card.Content>
                                    <View style={styles.infoBlock}>
                                        <MaterialCommunityIcons name="note-text" color="#00ADB5" size={24} />
                                        <Subheading style={styles.subLabel}>Dream Entry</Subheading>
                                        <Text style={styles.dreamEntry}>{dream.metadata.entry}</Text>
                                    </View>
                                </Card.Content>
                            </Card>
                            <Card style={styles.card}>
                                <Card.Content>
                                    <View style={styles.infoBlock}>
                                        <MaterialCommunityIcons name="brain" color="#00ADB5" size={24} />
                                        <Subheading style={styles.analysisLabel}>Dream Analysis</Subheading>
                                        <Text style={styles.analysisResult}>{analysisResult}</Text>
                                    </View>
                                </Card.Content>
                            </Card>
                        </>
                    )}
                    {imageData && (
                        <View style={styles.imageContainer}>
                            <Image source={{ uri: imageData }} style={styles.image} />
                        </View>
                    )}
                    <View style={styles.buttonContainer}>
                        {dream && dream.analysis && dream.image ? (
                            <Button
                                mode="contained"
                                onPress={() =>
                                    navigation.navigate("Regenerate", {
                                        dreamId,
                                        dreamData: dream,
                                    })
                                }
                                style={styles.generateButton}
                                labelStyle={styles.generateButtonText}
                            >
                                Regenerate
                            </Button>
                        ) : (
                            <Button
                                mode="contained"
                                onPress={handleGenerateDream}
                                style={styles.generateButton}
                                labelStyle={styles.generateButtonText}
                            >
                                Generate
                            </Button>
                        )}
                        {analysisResult && imageData && !(dream && dream.analysis && dream.image) && (
                            <Button
                                mode="contained"
                                onPress={handleSaveAnalysisAndImage}
                                style={styles.saveButton}
                                labelStyle={styles.saveButtonText}
                            >
                                Save
                            </Button>
                        )}
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
        // borderWidth: 2.22,
        borderColor: "#123",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.26,
        shadowRadius: 2,
        elevation: 4,
    },
    infoBlock: {
        marginBottom: 0,
    },
    subLabel: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 5,
        color: theme.colors.primary,
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

    loadingIndicator: {
        justifyContent: "center",
        height: "90%",
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
    buttonContainer: {
        marginBottom: 20,
    },
    generateButton: {
        marginBottom: 15,
        borderRadius: 50,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.33,
        shadowRadius: 3,
        elevation: 6,
        backgroundColor: "#00ADB5",
        width: "100%",
    },
    generateButtonText: {
        color: "#FFFFFF",
        fontWeight: "bold",
        fontSize: 18,
    },
    saveButton: {
        marginBottom: 15,
        borderRadius: 50,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.33,
        shadowRadius: 3,
        elevation: 6,
        backgroundColor: "#00ADB5",
        width: "100%",
    },
    saveButtonText: {
        color: "#FFFFFF",
        fontWeight: "bold",
        fontSize: 18,
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
    loadingMessage: {
        fontSize: 20,
        color: theme.colors.text,
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
});

export default DetailsScreen;