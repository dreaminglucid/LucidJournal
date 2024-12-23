// React and React Native Libraries
import React, { useState, useEffect, useContext, useRef } from "react";
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
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { API_URL } from "../../config";
import 'react-native-url-polyfill/auto';

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
    const [localImageURI, setLocalImageURI] = useState(null);
    const [isSaved, setIsSaved] = useState(false);

    const hasUnsavedGeneratedDataRef = useRef(() => {
        return (
            generationStatus === "success" && !isSaved // Now also checks if data has not been saved
        );
    });

    useEffect(() => {
        hasUnsavedGeneratedDataRef.current = () => {
            return generationStatus === "success" && !isSaved; // Update the ref function
        };
    }, [generationStatus, isSaved]);

    useEffect(() => {
        const unsubscribe = navigation.addListener("beforeRemove", (e) => {
            // Get the isSaved parameter from the route params. Default to false if not available.
            const isSaved = route.params?.isSaved || false;

            // If there are no unsaved changes, or the dream has been saved, then no need to show the warning.
            if (!hasUnsavedGeneratedDataRef.current() || isSaved) {
                return;
            }

            // Prevent default behavior of leaving the screen
            e.preventDefault();

            // Prompt the user before leaving the screen
            Alert.alert(
                "Discard changes?",
                "You have unsaved generated data. Are you sure to discard them and leave the screen?",
                [
                    { text: "Don't leave", style: "cancel", onPress: () => { } },
                    {
                        text: "Discard",
                        style: "destructive",
                        onPress: () => navigation.dispatch(e.data.action),
                    },
                ]
            );
        });

        // Clean up the event listener when the component is unmounted
        return unsubscribe;
    }, [navigation, route.params?.isSaved]); // Added dependency on route.params?.isSaved    

    // Prefetch the image for caching
    useEffect(() => {
        if (localImageURI || (imageData && imageData.startsWith('http'))) {
            const uriToPrefetch = localImageURI || imageData;
            console.log("Prefetching image from URI:", uriToPrefetch);
            Image.prefetch(uriToPrefetch).catch((error) =>
                console.error("Error prefetching image:", error)
            );
        }
    }, [imageData, localImageURI]);

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
        setLocalImageURI(null);
        if (route.params && route.params.dreamData) {
            let dreamData = route.params.dreamData;
            setDream(dreamData);

            // If the dream has been saved or overwritten, reset the isSaved flag
            if (route.params.isSaved) {
                hasUnsavedGeneratedDataRef.current = () => false;
                // Reset isSaved flag after using it
                navigation.setParams({ isSaved: false });
            }

            if ("analysis" in dreamData && dreamData.analysis !== null) {
                let analysisText = dreamData.analysis;
                try {
                    const parsedText = JSON.parse(analysisText);
                    if (typeof parsedText === "string") {
                        analysisText = parsedText;
                    }
                } catch (e) {
                    // JSON parsing failed, use the original string
                }
                analysisText = analysisText.replace(/\\"/g, '"').replace(/\\n/g, "\n");
                setAnalysisResult(analysisText);
            }
            const localURI = await fetchLocalImageURI();
            if (localURI) {
                setLocalImageURI(localURI);
                console.log("Image loaded from local URI:", localURI);
            } else if (imageData) {
                console.log("Image loaded from server:", imageData);
            }
            setIsRefreshing(false);
        } else {
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
                    if ("analysis" in dreamData && dreamData.analysis !== null) {
                        let analysisText = dreamData.analysis;
                        try {
                            const parsedText = JSON.parse(analysisText);
                            if (typeof parsedText === "string") {
                                analysisText = parsedText;
                            }
                        } catch (e) {
                            // JSON parsing failed, use the original string
                        }
                        analysisText = analysisText.replace(/\\"/g, '"').replace(/\\n/g, "\n");
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
        if (generationStatus === "generating") return; // If already generating, return

        setGenerationStatus("generating"); // Set status to generating
        setIsLoading(true);
        setLoadingStatus("Generating Analysis & Image"); // Set loading status

        Promise.all([fetchDreamAnalysis(), fetchDreamImage()])
            .then(([analysis, image]) => {
                setAnalysisResult(analysis);
                setImageData(image);
                setIsLoading(false);
                setLoadingStatus("");
                setGenerationStatus("success"); // Set status to success after generation
            })
            .catch((error) => {
                console.error("Error during dream generation:", error);
                Alert.alert(
                    "Error",
                    "An unexpected error occurred during dream generation.",
                );
                setIsLoading(false);
                setLoadingStatus("");
                setGenerationStatus("idle"); // Reset status to idle on error
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
            // Save the analysis and image to the server as before
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

                // Now, save the image to the "Dreams" album in the device's media library
                saveImageToLibrary(imageData);

                setIsSaved(true); // Set isSaved to true to indicate that the data has been saved
            } else {
                Alert.alert("Error", "Failed to save analysis and image.");
                setIsSaved(false); // Optionally, you can set isSaved to false to indicate the data hasn't been saved
            }
        } catch (error) {
            console.error("Error:", error);
            Alert.alert("Error", "An unexpected error occurred.");
            setIsSaved(false); // Optionally, you can set isSaved to false to indicate the data hasn't been saved
        }
    };

    const saveImageToLibrary = async (imageURI) => {
        try {
            // Ensure permissions
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Unable to access media library.');
                return;
            }

            // Download if it's a URL
            let localUri = imageURI;
            if (imageURI.startsWith('http')) {
                const { uri } = await FileSystem.downloadAsync(imageURI, FileSystem.documentDirectory + `image_${dreamId}.jpg`);
                localUri = uri;
            }

            // Save to media library
            const asset = await MediaLibrary.createAssetAsync(localUri);

            // Check "Dreams" album
            let album = await MediaLibrary.getAlbumAsync('Dreams');
            if (album === null) {
                album = await MediaLibrary.createAlbumAsync('Dreams', asset, false);
            } else {
                await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
            }

            // Update the local image URI
            setLocalImageURI(localUri);

            Alert.alert('Success', 'Image saved to "Dreams" album!');
        } catch (error) {
            console.error('Error saving image:', error);
            Alert.alert('Error', 'Failed to save image to library.');
        }
    };

    const fetchLocalImageURI = async () => {
        try {
            // Check for the file by dream ID in the local file system
            const fileUri = FileSystem.documentDirectory + `image_${dreamId}.jpg`;
            const fileInfo = await FileSystem.getInfoAsync(fileUri);
            if (fileInfo.exists) {
                return fileUri;
            }
        } catch (error) {
            console.error('Error fetching local image:', error);
        }
        return null;
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
            // Start by deleting the dream from the server
            const response = await fetch(`${API_URL}/api/dreams/${dreamId}`, {
                method: "DELETE",
                headers: {
                    'Authorization': `Bearer ${user.id_token}`,
                },
            });

            if (response.ok) {
                // If the server deletion is successful, proceed to delete the local file.
                const fileUri = FileSystem.documentDirectory + `image_${dreamId}.jpg`;
                const fileInfo = await FileSystem.getInfoAsync(fileUri);

                if (fileInfo.exists) {
                    await FileSystem.deleteAsync(fileUri);
                }

                // Prompt the user to delete the image from the photo library
                Alert.alert(
                    "Delete Image from Photos?",
                    "Would you like to delete this image from your Photos as well?",
                    [
                        { text: "No", style: "cancel" },
                        {
                            text: "Yes",
                            onPress: async () => {
                                const deleted = await MediaLibrary.deleteAssetsAsync([dreamId]); // Using dreamId as asset ID
                                if (deleted) {
                                    Alert.alert("Success", "Image also deleted from photo library.");
                                }
                            }
                        },
                    ]
                );

                Alert.alert("Success", "Dream and associated image deleted successfully.");
                navigation.goBack(); // Navigate back after deletion
            } else {
                Alert.alert("Error", "Failed to delete the dream.");
            }
        } catch (error) {
            console.error("Error:", error);
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

    const renderImage = () => {
        let imageSource = localImageURI || imageData;
        if (imageSource) {
            return (
                <TouchableOpacity onPress={handleOpenImageModal} style={styles.imageContainer}>
                    <Image
                        source={{ uri: imageSource }}
                        style={styles.image}
                        resizeMode="contain"
                        onError={(e) => {
                            console.error("Error loading image:", e.nativeEvent.error);
                        }}
                    />
                </TouchableOpacity>
            );
        } else {
            return (
                <View style={styles.imagePlaceholder}>
                    <MaterialCommunityIcons name="image-off" size={48} color="#aaa" />
                </View>
            );
        }
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
                    <Image source={{ uri: localImageURI || imageData }} style={styles.expandedImage} resizeMode="contain" />
                </TouchableOpacity>
            </Modal>
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
                <>
                    {renderImage()}
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
                </>
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
        width: '100%',
        height: 390,
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