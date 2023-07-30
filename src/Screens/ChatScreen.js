import React, { useState, useRef, useEffect, useContext } from "react";
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

import { ThemeContext } from '../Contexts/ThemeContext';

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
    "What techniques can I use to achieve lucidity in my dreams?": {
        function_name: "discuss_lucidity_techniques",
        responseHandler: (responseData) =>
            responseData["arguments"]["lucidity_techniques"],
    },
    "Can you create a personalized plan for me to achieve lucidity?": {
        function_name: "create_lucidity_plan",
        responseHandler: (responseData) =>
            responseData["arguments"]["lucidity_plan"],
    },
    "What are the recurring themes in my dreams that could serve as dream signs?": {
        function_name: "analyze_dream_signs",
        responseHandler: (responseData) =>
            responseData["arguments"]["dream_signs"],
    },
    "How much progress have I made towards achieving lucidity?": {
        function_name: "track_lucidity_progress",
        responseHandler: (responseData) =>
            responseData["arguments"]["lucidity_progress"],
    },
};

const ChatScreen = () => {
    const { theme } = useContext(ThemeContext);
    const styles = getStyles(theme);
    const [message, setMessage] = useState("");
    const [chatHistory, setChatHistory] = useState([
        {
            text: "My name is Emris, I'm your personal AI dream guide! Please ask about your dreams.",
            sender: "System",
            timestamp: new Date(),
            status: "sent",
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
            status: "pending",
        };

        // Add the user's message to the chat history
        setChatHistory((prevChatHistory) => [...prevChatHistory, newMessage]);
        setIsTyping(true);

        // Call the backend for response
        fetchResponse(message, newMessage);

        // After sending a message, generate new prompts
        generateNewPrompts();

        // Clear the message input field
        setMessage("");
    };

    const generateNewPrompts = () => {
        let newPrompts = [];
        let remainingPrompts = [...availablePrompts];
    
        // If there are not enough available prompts, use what's left and reset the lists
        if (remainingPrompts.length < 2) {
            newPrompts = [...remainingPrompts];  // Add the remaining prompts to newPrompts
            remainingPrompts = [];  // Clear remainingPrompts
        } else {
            // Select two prompts at random from the available ones
            for (let i = 0; i < 2; i++) {
                const randomIndex = Math.floor(Math.random() * remainingPrompts.length);
                newPrompts.push(remainingPrompts[randomIndex]);
                remainingPrompts.splice(randomIndex, 1);
            }
        }
    
        // Update the last used prompts and available prompts
        setLastUsedPrompts(newPrompts);
        setAvailablePrompts(remainingPrompts);
    
        // If remainingPrompts is empty, reset the available prompts
        if (remainingPrompts.length === 0) {
            setAvailablePrompts(Object.keys(predefinedPrompts));
        }
    };    

    const timeoutPromise = (timeout) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => reject(new Error('Request timeout')), timeout);
        });
    };

    const fetchResponse = async (message, userMessage) => {
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

            const response = await Promise.race([
                fetch(endpoint, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(requestBody),
                }),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error("Request timeout")), 30000)
                ),
            ]);

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
                    status: "sent",
                };

                // Add the system's response to the chat history
                setChatHistory((prevChatHistory) => [
                    ...prevChatHistory,
                    systemResponse,
                ]);
                userMessage.status = "sent";
            } else {
                userMessage.status = "failed";
                Alert.alert("Error", "Failed to send message.");
            }
        } catch (error) {
            userMessage.status = "failed";
            console.error("Error:", error);
            Alert.alert("Error", "An unexpected error occurred.");
        }

        // Update the chat history to reflect the new message status
        setChatHistory((prevChatHistory) => [...prevChatHistory]);
        setIsTyping(false);
    };

    const handleRetryMessage = (message) => {
        message.status = "pending";
        setChatHistory((prevChatHistory) => [...prevChatHistory]);
        setIsTyping(true);  // Set isTyping to true here
        fetchResponse(message.text, message)
            .then(() => setIsTyping(false))
            .catch(() => setIsTyping(false));
    };

    const handleClearChat = () => {
        Vibration.vibrate(22);
        setChatHistory([
            {
                text: "My name is Emris, I'm your personal AI dream guide! Please ask about your dreams.",
                sender: "System",
                timestamp: new Date(),
                status: "sent",
            },
        ]);
        setIsTyping(false);
    };

    const renderMessageItem = ({ item, index }) => {
        const isUserMessage = item.sender === "User";
        return (
            <>
                <View style={isUserMessage ? styles.userMessageBox : styles.systemMessageBox}>
                    <View style={isUserMessage ? styles.userMessageContainer : styles.systemMessageContainer}>
                        <Text style={isUserMessage ? styles.userMessageText : styles.systemMessageText}>
                            {item.text}
                        </Text>
                    </View>
                    <Text style={isUserMessage ? styles.userTimestamp : styles.systemTimestamp}>
                        {item.timestamp.toLocaleTimeString()}
                    </Text>
                    {isUserMessage && item.status === "failed" && (
                        <TouchableOpacity style={styles.retryButton} onPress={() => handleRetryMessage(item)}>
                            <Text style={styles.retryText}>Retry</Text>
                        </TouchableOpacity>
                    )}
                </View>
                {/* If it's a system message and there are predefined prompts available, display them */}
                {!isUserMessage && index === chatHistory.length - 1 && (
                    <View style={styles.predefinedPromptsContainer}>
                        <View style={styles.prompts}>
                            {lastUsedPrompts.map(renderPredefinedPrompt)}
                        </View>
                        <TouchableOpacity style={styles.nextPromptButton} onPress={generateNewPrompts}>
                            <MaterialCommunityIcons name="chevron-right" color="#00ADB5" size={24} />
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

    const renderPredefinedPrompt = (promptKey, index) => (
        <TouchableOpacity
            key={index} // Add this line
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
                fetchResponse(promptKey, newMessage)
                    .then(() => setIsTyping(false))
                    .catch(() => setIsTyping(false));

                // After sending a message, generate new prompts
                generateNewPrompts();
            }}
        >
            <Text style={styles.predefinedPromptButtonText} numberOfLines={2}>{promptKey}</Text>
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
                onContentSizeChange={() => flatListRef.current.scrollToEnd()}
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

const getStyles = (theme) => StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: theme.colors.background,
    },
    chatInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginHorizontal: 10,
        paddingHorizontal: 7,
        paddingVertical: 3,
        borderWidth: 0,
        borderColor: theme.colors.text,
        borderRadius: 22,
        backgroundColor: theme.colors.card,
        marginBottom: 10,
        marginTop: 2.2,
    },
    chatInput: {
        flex: 1,
        fontSize: 18,
        color: theme.colors.text,
        marginRight: 10,
        minHeight: 33,
        maxHeight: 160,
        padding: 5,
    },
    sendButton: {
        borderRadius: 22,
        width: 33,
        height: 33,
        justifyContent: "center",
        alignItems: "center",
    },
    clearChatButton: {
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
        backgroundColor: theme.colors.card,
        marginRight: 40,
        width: 300,
    },
    userMessageText: {
        color: "#FFFFFF",
        fontSize: 18,
    },
    systemMessageText: {
        color: theme.colors.text,
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
        padding: 0,
        marginBottom: 10,
        alignSelf: "flex-start",
    },
    prompts: {
        flexDirection: "column",
        width: "70%",
    },
    predefinedPromptButton: {
        borderRadius: 22,
        paddingHorizontal: 13,
        paddingVertical: 13,
        width: "100%",
        minHeight: 33,
        maxHeight: 66,
        marginBottom: 5,
        elevation: 5,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: theme.colors.card,
    },
    predefinedPromptButtonText: {
        color: theme.colors.text,
        fontSize: 13,
        textAlign: "center",
        fontWeight: "500",
    },
    nextPromptButton: {
        backgroundColor: "transparent",
        justifyContent: "center",
        alignItems: "center",
        width: "22%",
    },
    retryButton: {
        alignSelf: "center",
        borderRadius: 20,
        paddingHorizontal: 33,
        paddingVertical: 13,
        marginTop: 5,
        marginBottom: 20,
        backgroundColor: theme.colors.card,
    },
    retryText: {
        color: theme.colors.text,
        fontSize: 14,
        fontWeight: "bold",
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