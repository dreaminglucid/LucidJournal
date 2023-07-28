// React and React Native Libraries
import React, { useState, useRef, useEffect } from "react";
import {
    StyleSheet,
    View,
    Text,
    Alert,
    Image,
    ActivityIndicator,
    ScrollView,
    RefreshControl,
} from "react-native";

// UI Component Libraries
import { Button, Card, Subheading } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// Application Specific Imports
import API_URL from "../config";


const DetailsScreen = ({ route, navigation }) => {
    let { dreamId } = route.params;
    console.log(dreamId); // log the dreamId
    dreamId = String(dreamId);
    const [dream, setDream] = useState(null);
    const [analysisResult, setAnalysisResult] = useState("");
    const [imageData, setImageData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [generationStatus, setGenerationStatus] = useState("idle");

    useEffect(() => {
        const unsubscribe = navigation.addListener("focus", fetchDream);

        // Call fetchDream for the first time
        fetchDream();

        return unsubscribe;
    }, [navigation, route.params.dreamUpdated]);

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
            } finally {
                setIsRefreshing(false);
            }
        }
    };

    const handleGenerateDream = () => {
        setIsLoading(true);
        fetchDreamAnalysis()
            .then((analysis) => {
                setAnalysisResult(analysis);
            })
            .catch((error) => {
                console.error("Error during analysis generation:", error);
                Alert.alert(
                    "Error",
                    "An unexpected error occurred during analysis generation.",
                );
                setGenerationStatus("error");
                setIsLoading(false);
            });

        fetchDreamImage()
            .then((image) => {
                setImageData(image);
            })
            .catch((error) => {
                console.error("Error during image generation:", error);
                Alert.alert(
                    "Error",
                    "An unexpected error occurred during image generation.",
                );
                setGenerationStatus("error");
                setIsLoading(false);
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
            const response = await fetch(`${API_URL}/api/dreams/${dreamId}/analysis`);
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
            const response = await fetch(`${API_URL}/api/dreams/${dreamId}/image`);
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
                                <Text style={styles.dreamEntry}>{dream.metadata.entry}</Text>
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
                </>
            )}
            {isLoading ? (
                <ActivityIndicator
                    size="large"
                    color="#00ADB5"
                    style={styles.loadingIndicator}
                />
            ) : (
                <>
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
                        {analysisResult &&
                            imageData &&
                            !(dream && dream.analysis && dream.image) && (
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

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
    },
    card: {
        backgroundColor: "#272B3B",
        marginBottom: 20,
        borderRadius: 22,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,
        elevation: 4,
    },
    infoBlock: {
        marginBottom: 0,
    },
    subLabel: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 5,
        color: "#00ADB5",
    },
    dreamTitle: {
        fontSize: 20,
        marginBottom: 10,
        color: "#A0AEC0",
        fontWeight: "bold",
    },
    dreamDate: {
        fontSize: 18,
        marginBottom: 10,
        color: "#A0AEC0",
        fontWeight: "bold",
    },
    dreamEntry: {
        fontSize: 18,
        marginBottom: 10,
        color: "#A0AEC0",
    },
    analysisLabel: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 5,
        color: "#00ADB5",
    },
    analysisResult: {
        fontSize: 18,
        marginBottom: 10,
        color: "#A0AEC0",
    },
    loadingIndicator: {
        justifyContent: "center",
        height: "90%",
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
    buttonContainer: {
        marginBottom: 20,
    },
    generateButton: {
        marginBottom: 15,
        borderRadius: 50,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.8,
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
        shadowOpacity: 0.8,
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
});

export default DetailsScreen;