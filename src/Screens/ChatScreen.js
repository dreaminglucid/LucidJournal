import React, { useState, useRef, useEffect } from "react";
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    Alert,
    TouchableOpacity,
    ActivityIndicator,
    Vibration,
    FlatList,
    KeyboardAvoidingView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { API_URL } from "../config";

const predefinedPrompts = {
    "What emotions are present in my dreams?": {
        function_name: "discuss_emotions",
        responseHandler: (responseData) => responseData["arguments"]["emotions"],
    },
    "What might my future dreams look like based on my journal?": {
        function_name: "predict_future_dreams",
        responseHandler: (responseData) =>
            responseData["arguments"]["future_dreams"],
    },
};

const ChatScreen = () => {
    const [message, setMessage] = useState("");
    const [chatHistory, setChatHistory] = useState([
        {
            text: "My name is Emris, I'm your personal AI dream guide! Please ask about your dreams.",
            sender: "System",
            timestamp: new Date(),
        },
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const flatListRef = useRef();
    const [lastUsedPrompts, setLastUsedPrompts] = useState([]);
    const [availablePrompts, setAvailablePrompts] = useState(
        Object.keys(predefinedPrompts),
    );

    useEffect(() => {
        // Generate prompts when the component mounts
        generateNewPrompts();
    }, []);

    const handleSendMessage = () => {
        if (message.trim() === "") {
            return;
        }

        const newMessage = {
            text: message,
            sender: "User",
            timestamp: new Date(),
        };

        // Add the user's message to the chat history
        setChatHistory((prevChatHistory) => [...prevChatHistory, newMessage]);
        setIsTyping(true);

        // Call the backend for response
        fetchResponse(message);

        // After sending a message, generate new prompts
        generateNewPrompts();

        // Clear the message input field
        setMessage("");
    };

    const generateNewPrompts = () => {
        // If there are not enough available prompts, reset the lists
        if (availablePrompts.length < 2) {
            setLastUsedPrompts([]);
            setAvailablePrompts(Object.keys(predefinedPrompts));
            return;
        }

        // Select two prompts at random from the available ones
        let newPrompts = [];
        let remainingPrompts = [...availablePrompts];
        for (let i = 0; i < 2; i++) {
            const randomIndex = Math.floor(Math.random() * remainingPrompts.length);
            newPrompts.push(remainingPrompts[randomIndex]);
            remainingPrompts.splice(randomIndex, 1); // Remove the selected prompt from the remaining ones
        }

        // Update the last used prompts and available prompts
        setLastUsedPrompts(newPrompts);
        setAvailablePrompts(remainingPrompts);
    };

    const fetchResponse = async (message) => {
        try {
            let endpoint, requestBody;
            if (predefinedPrompts.hasOwnProperty(message)) {
                endpoint = `${API_URL}/api/dreams/search-chat`;
                requestBody = {
                    function_name: predefinedPrompts[message].function_name,
                    prompt: message,
                };
            } else {
                endpoint = `${API_URL}/api/chat`;
                requestBody = {
                    message: message,
                };
            }

            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });

            if (response.ok) {
                const responseData = await response.json();
                let systemResponseText = "";

                // Use the response handler to get the system's response
                if (predefinedPrompts.hasOwnProperty(message)) {
                    systemResponseText = predefinedPrompts[message].responseHandler(responseData);
                } else {
                    systemResponseText = responseData.response;
                }

                const systemResponse = {
                    text: systemResponseText,
                    sender: "System",
                    timestamp: new Date(),
                };

                // Add the system's response to the chat history
                setChatHistory((prevChatHistory) => [
                    ...prevChatHistory,
                    systemResponse,
                ]);
            } else {
                Alert.alert("Error", "Failed to send message.");
            }
        } catch (error) {
            console.error("Error:", error);
            Alert.alert("Error", "An unexpected error occurred.");
        }

        setIsTyping(false);
    };

    const handleClearChat = () => {
        Vibration.vibrate(22);
        setChatHistory([
            {
                text: "My name is Emris, I'm your personal AI dream guide! Please ask about your dreams.",
                sender: "System",
                timestamp: new Date(),
            },
        ]);
    };


    const renderMessageItem = ({ item, index }) => {
        const isUserMessage = item.sender === "User";
        return (
            <>
                <View
                    style={
                        isUserMessage ? styles.userMessageBox : styles.systemMessageBox
                    }
                >
                    <View
                        style={
                            isUserMessage
                                ? styles.userMessageContainer
                                : styles.systemMessageContainer
                        }
                    >
                        <Text
                            style={
                                isUserMessage
                                    ? styles.userMessageText
                                    : styles.systemMessageText
                            }
                        >
                            {item.text}
                        </Text>
                    </View>
                    <Text
                        style={
                            isUserMessage ? styles.userTimestamp : styles.systemTimestamp
                        }
                    >
                        {item.timestamp.toLocaleTimeString()}
                    </Text>
                </View>
                {/* If it's a system message and there are predefined prompts available, display them */}
                {!isUserMessage && index === chatHistory.length - 1 && (
                    <View style={styles.predefinedPromptsContainer}>
                        <View style={styles.prompts}>
                            {lastUsedPrompts.map(renderPredefinedPrompt)}
                        </View>
                        <TouchableOpacity
                            style={styles.nextPromptButton}
                            onPress={generateNewPrompts}
                        >
                            <MaterialCommunityIcons
                                name="chevron-right"
                                color="#FFFFFF"
                                size={24}
                            />
                        </TouchableOpacity>
                    </View>
                )}
            </>
        );
    };

    const renderEmptyState = () => {
        return (
            <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyStateText}>
                    No messages yet. Start a conversation!
                </Text>
            </View>
        );
    };

    const renderPredefinedPrompt = (promptKey) => (
        <TouchableOpacity
            style={styles.predefinedPromptButton}
            onPress={() => {
                // When a predefined prompt is pressed, send the message directly
                const newMessage = {
                    text: promptKey,
                    sender: "User",
                    timestamp: new Date(),
                };

                // Add the user's message to the chat history
                setChatHistory((prevChatHistory) => [...prevChatHistory, newMessage]);
                setIsTyping(true);

                // Call the backend for response
                fetchResponse(promptKey);

                // After sending a message, generate new prompts
                generateNewPrompts();
            }}
        >
            <Text style={styles.predefinedPromptButtonText}>{promptKey}</Text>
        </TouchableOpacity>
    );

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 85 : 20}
        >
            <FlatList
                style={{ flexGrow: 1 }}
                ref={flatListRef}
                contentContainerStyle={styles.container}
                data={chatHistory}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderMessageItem}
                ListEmptyComponent={renderEmptyState}
                onContentSizeChange={() =>
                    chatHistory.length > 0 && flatListRef.current.scrollToEnd()
                }
            />

            {isTyping && (
                <ActivityIndicator
                    size="small"
                    color="#00ADB5"
                    style={styles.TypingIndicator}
                />
            )}

            <View style={styles.chatInputContainer}>
                <TextInput
                    style={styles.chatInput}
                    value={message}
                    onChangeText={(text) => setMessage(text)}
                    placeholder="Type a message"
                    placeholderTextColor="#888"
                    onSubmitEditing={handleSendMessage}
                    multiline={true}
                    numberOfLines={4}
                />
                <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
                    <MaterialCommunityIcons name="send" color="#FFFFFF" size={24} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.clearChatButton}
                    onLongPress={handleClearChat} // Here is the change
                >
                    <MaterialCommunityIcons name="delete" color="#FFFFFF" size={24} />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
    },
    chatInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginHorizontal: 10,
        paddingHorizontal: 7,
        paddingVertical: 3,
        borderWidth: 2,
        borderColor: "#123",
        borderRadius: 22,
        backgroundColor: "#272B3B",
        marginBottom: 10,
        marginTop: 2.2,
    },
    chatInput: {
        flex: 1,
        fontSize: 18,
        color: "#FFFFFF",
        marginRight: 10,
        minHeight: 33,
        maxHeight: 160,
        padding: 5,
    },
    sendButton: {
        backgroundColor: "#00ADB5",
        borderRadius: 22,
        width: 33,
        height: 33,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#006a79",
        shadowColor: "#008c9e",
        shadowOffset: { width: -1, height: -1 },
        shadowOpacity: 0.8,
        shadowRadius: 1,
        elevation: 5,
    },
    clearChatButton: {
        backgroundColor: '#FF0000',
        padding: 5,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 10,
    },
    userMessageContainer: {
        alignSelf: "flex-end",
        borderRadius: 22,
        marginBottom: 5,
        padding: 15,
        backgroundColor: "#00ADB5",
        marginLight: 40,
        width: 300,
    },
    systemMessageContainer: {
        alignSelf: "flex-start",
        borderRadius: 22,
        marginBottom: 5,
        padding: 15,
        backgroundColor: "#272B3B",
        marginRight: 40,
        width: 300,
    },
    userMessageText: {
        color: "#FFFFFF",
        fontSize: 18,
    },
    systemMessageText: {
        color: "#FFFFFF",
        fontSize: 18,
    },
    userTimestamp: {
        fontSize: 12,
        color: "#6B7280",
        alignSelf: "flex-end",
        paddingRight: 15,
        paddingBottom: 22,
    },
    systemTimestamp: {
        fontSize: 12,
        color: "#6B7280",
        alignSelf: "flex-start",
        paddingLeft: 15,
        paddingBottom: 22,
    },
    predefinedPromptsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 0,
        paddingVertical: 5,
        backgroundColor: "#0C0E17",
        padding: 0,
        marginBottom: 10,
        alignSelf: "flex-start",
    },
    prompts: {
        flexDirection: "column",
        width: "70%",
    },
    predefinedPromptButton: {
        borderWidth: 1,
        borderColor: "#00ADB5",
        borderRadius: 30,
        paddingHorizontal: 10,
        paddingVertical: 5,
        backgroundColor: "transparent",
        width: "100%",
        minHeight: 33,
        maxHeight: 66,
        marginBottom: 5,
        elevation: 5,
        justifyContent: "center",
        alignItems: "center",
    },
    predefinedPromptButtonText: {
        color: "#fff",
        fontSize: 12,
        textAlign: "center",
        numberOfLines: 2,
    },
    nextPromptButton: {
        backgroundColor: "transparent",
        justifyContent: "center",
        alignItems: "center",
        width: "22%",
    },
    emptyStateContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyStateText: {
        fontSize: 18,
        marginBottom: 25,
        color: "#FFFFFF",
    },
});


export default ChatScreen;