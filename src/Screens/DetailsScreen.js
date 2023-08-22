// React and React Native Libraries
import React, { useState, useEffect, useContext } from "react";
import {
    StyleSheet,
    View,
    Text,
    Alert,
    Image,
    Modal,
    Animated,
    ActivityIndicator,
    ScrollView,
    RefreshControl,
    TouchableOpacity,
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
    const [isImageModalVisible, setImageModalVisible] = useState(false);
    const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
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

    // Function to handle opening the delete modal
    const handleOpenDeleteModal = () => {
        setDeleteModalVisible(true);
    };

    // Function to handle closing the delete modal
    const handleCloseDeleteModal = () => {
        setDeleteModalVisible(false);
    };

    const handleCloseImageModal = () => {
        setImageModalVisible(false);
    };

    const handleOpenImageModal = () => {
        setImageModalVisible(true);
    };

    // Function to delete a dream
    const deleteDream = async () => {
        const userJson = await SecureStore.getItemAsync('appleUser');
        const user = JSON.parse(userJson);
        try {
            const response = await fetch(`${API_URL}/api/dreams/${dreamId}`, {
                method: "DELETE",
                headers: {
                    'Authorization': `Bearer ${user.id_token}`,
                },
            });

            if (response.ok) {
                Alert.alert("Success", "Dream deleted successfully.");
                navigation.goBack(); // Navigate back after deletion
            } else {
                Alert.alert("Error", "Failed to delete the dream.");
            }
        } catch (error) {
            Alert.alert("Error", "Failed to delete the dream.");
        }
    };

    // Function to confirm deletion
    const confirmDeleteDream = () => {
        Alert.alert(
            "Delete Dream",
            "Are you sure you want to delete this dream?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", onPress: deleteDream },
            ]
        );
    };

    return (
        <ScrollView
            contentContainerStyle={styles.container}
            refreshControl={
                <RefreshControl refreshing={isRefreshing} onRefresh={fetchDream} />
            }
        >
            <Modal
                animationType="slide"
                transparent={true}
                visible={isImageModalVisible}
                onRequestClose={handleCloseImageModal}
            >
                <TouchableOpacity onPress={handleCloseImageModal} style={styles.expandedImageContainer}>
                    <Image source={{ uri: imageData }} style={styles.expandedImage} resizeMode="contain" />
                </TouchableOpacity>
            </Modal>
            {imageData ? (
                <TouchableOpacity onPress={handleOpenImageModal} style={styles.imageContainer}>
                    <Image source={{ uri: imageData }} style={styles.image} />
                </TouchableOpacity>
            ) : (
                <View style={styles.imagePlaceholder}>
                    <MaterialCommunityIcons name="image-off" size={48} color="#aaa" />
                </View>
            )}
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.button} />
                    <View style={styles.loadingMessageContainer}>
                        <Text style={styles.loadingMessage}>{loadingStatus}</Text>
                        <Animated.Text style={[styles.loadingDot, { opacity: dot1 }]}>.</Animated.Text>
                        <Animated.Text style={[styles.loadingDot, { opacity: dot2 }]}>.</Animated.Text>
                        <Animated.Text style={[styles.loadingDot, { opacity: dot3 }]}>.</Animated.Text>
                    </View>
                </View>
            ) : (
                <View style={styles.detailsContainer}>
                    {dream && (
                        <>
                            <Card style={styles.card}>
                                <Card.Content>
                                    <View style={[styles.infoBlock, { flexDirection: 'column' }]}>
                                        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                                            <MaterialCommunityIcons name="book" color={theme.colors.button} size={24} />
                                            <Subheading style={[styles.subLabel, { color: theme.colors.button, marginLeft: 10 }]}>Dream Title</Subheading>
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
                                            <Subheading style={[styles.subLabel, { color: theme.colors.button, marginLeft: 10 }]}>Dream Date</Subheading>
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
                                            <Subheading style={[styles.subLabel, { color: theme.colors.button, marginLeft: 10 }]}>Dream Entry</Subheading>
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
                                            <Subheading style={[styles.analysisLabel, { color: theme.colors.button, marginLeft: 10 }]}>Dream Analysis</Subheading>
                                        </View>
                                        {analysisResult ? (
                                            <Text style={styles.analysisResult}>{analysisResult}</Text>
                                        ) : (
                                            <Text style={styles.analysisPlaceholder}>No analysis generated</Text>
                                        )}
                                    </View>
                                </Card.Content>
                            </Card>
                        </>
                    )}
                    <View style={styles.buttonContainer}>
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
                    {/* Delete Button */}
                    <TouchableOpacity onPress={handleOpenDeleteModal} style={styles.deleteButtonContainer}>
                        <MaterialCommunityIcons name="pencil" size={24} color={theme.colors.background} />
                    </TouchableOpacity>

                    {/* Delete Modal */}
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={isDeleteModalVisible}
                        onRequestClose={handleCloseDeleteModal}
                    >
                        <View style={styles.deleteModalContainer}>
                            {dream && dream.analysis && dream.image ? (
                                <Button
                                    mode="contained"
                                    onPress={() => {
                                        navigation.navigate("Regenerate", {
                                            dreamId,
                                            dreamData: dream,
                                        });
                                        handleCloseDeleteModal(); // Close modal after navigating
                                    }}
                                    style={styles.generateButton}
                                    labelStyle={styles.generateButtonText}
                                >
                                    Edit
                                </Button>
                            ) : (
                                <Button
                                    mode="contained"
                                    onPress={() => {
                                        handleGenerateDream();
                                        handleCloseDeleteModal(); // Close modal after generating
                                    }}
                                    style={styles.generateButton}
                                    labelStyle={styles.generateButtonText}
                                >
                                    Generate
                                </Button>
                            )}
                            <Button
                                mode="contained"
                                onPress={confirmDeleteDream}
                                style={[styles.deleteModalButton, styles.deleteModalDeleteButton]} // Added specific style for delete button
                                labelStyle={styles.deleteModalButtonText}
                            >
                                Delete
                            </Button>
                            <Button onPress={handleCloseDeleteModal} style={styles.cancelModalButton}>
                                Cancel
                            </Button>
                        </View>
                    </Modal>
                </View>
            )}
        </ScrollView>
    );
};

const getStyles = (theme) => StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: theme.colors.background,
    },
    detailsContainer: {
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        backgroundColor: theme.colors.background,
        padding: 20,
        paddingTop: 40,
        marginTop: -30,
    },
    card: {
        backgroundColor: theme.colors.card,
        marginBottom: 20,
        borderRadius: 22,
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
        flexDirection: 'row',
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
    imagePlaceholder: {
        width: "100%",
        height: 375,
        backgroundColor: "#ddd",
        alignItems: 'center',
        justifyContent: 'center',
    },
    analysisPlaceholder: {
        fontSize: 18,
        color: "#aaa",
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
        width: "100%",
        height: 375,
        backgroundColor: theme.colors.primary,
        overflow: 'hidden',
    },
    expandedImageContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    expandedImage: {
        width: '100%',
        height: '100%',
        maxWidth: '100%',
        maxHeight: '100%',
        margin: 20,
    },
    image: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    buttonContainer: {
        marginBottom: 20,
    },
    deleteModalContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: theme.colors.card,
        padding: 20,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
    },
    deleteModalButton: {
        borderRadius: 50,
        marginBottom: 10,
        backgroundColor: 'red',
    },
    deleteModalButtonText: {
        color: theme.colors.background,
        fontWeight: "bold",
        fontSize: 18,
    },
    deleteButtonContainer: {
        position: 'absolute',
        right: 35, // Adjust this to change the button's horizontal position
        top: -20, // Adjust this to change the button's vertical position
        zIndex: 2,
        width: 50, // Diameter of the button
        height: 50, // Diameter of the button
        borderRadius: 25, // Half the diameter to make it circular
        backgroundColor: theme.colors.button, // Match the background color of the button
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.33,
        shadowRadius: 3,
        elevation: 6,
    },
    cancelModalButton: {
        textAlign: 'center',
        color: theme.colors.button,
    },
    generateButton: {
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
    generateButtonText: {
        color: theme.colors.background,
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
        backgroundColor: theme.colors.button,
        width: "100%",
    },
    saveButtonText: {
        color: theme.colors.background,
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
        color: theme.colors.button,
        fontSize: 20,
        marginHorizontal: 5,
    },
});

export default DetailsScreen;