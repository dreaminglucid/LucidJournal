// React and React Native Libraries
import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Alert,
  Image,
  Animated,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Vibration,
  ScrollView,
  RefreshControl,
  KeyboardAvoidingView,
} from "react-native";

// Navigation Libraries
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";

// UI Component Libraries
import { Button, Card, Subheading, FAB } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// Other Libraries
import DateTimePicker from "@react-native-community/datetimepicker";
import { useDebounce } from "use-debounce";

// Application Specific Imports
import API_URL from "./config";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

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

const NewDreamScreen = () => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [entry, setEntry] = useState("");
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (title.trim() === "") {
      Alert.alert("Warning", "Please enter a dream title.");
      return false;
    }
    if (!date) {
      Alert.alert("Warning", "Please enter a dream date.");
      return false;
    }
    if (entry.trim() === "") {
      Alert.alert("Warning", "Please enter a dream entry.");
      return false;
    }
    return true;
  };

  const handleSaveDream = async () => {
    if (!validateForm()) {
      return;
    }

    const formattedDate = `${date.getMonth() + 1
      }/${date.getDate()}/${date.getFullYear()}`;

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/dreams`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, date: formattedDate, entry }),
      });

      if (response.ok) {
        Alert.alert("Success", "Dream saved successfully!");
        setTitle("");
        setDate(new Date());
        setEntry("");
      } else {
        Alert.alert("Error", "Failed to save dream.");
      }
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Dream Date</Text>
      <TouchableOpacity
        style={styles.datePicker}
        onPress={() => setShowDatePicker(true)}
      >
        <TextInput
          style={[styles.dateText, { flex: 1 }]}
          value={`${date.getMonth() + 1
            }/${date.getDate()}/${date.getFullYear()}`}
          editable={false}
          placeholder="MM/DD/YYYY"
          placeholderTextColor="#888"
        />
        <MaterialCommunityIcons
          style={styles.dateIcon}
          name="calendar-blank"
          size={24}
        />
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setDate(selectedDate);
            }
          }}
        />
      )}
      <Text style={styles.label}>Dream Title</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Enter dream title"
        placeholderTextColor="#888"
      />
      <Text style={styles.label}>Dream Entry</Text>
      <TextInput
        style={[styles.input, styles.tallerInput]}
        value={entry}
        onChangeText={setEntry}
        multiline
        placeholder="Write your dream here"
        placeholderTextColor="#888"
      />
      <Button
        mode="contained"
        onPress={handleSaveDream}
        style={styles.saveButton}
        labelStyle={styles.saveButtonText}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          "Save Dream"
        )}
      </Button>
    </ScrollView>
  );
};

const DreamsScreen = ({ navigation }) => {
  const [dreams, setDreams] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText] = useDebounce(searchText, 500);
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchDreams();
  }, []);

  useEffect(() => {
    if (debouncedSearchText) {
      handleSearch();
    }
  }, [debouncedSearchText]);

  const fetchDreams = async () => {
    setIsRefreshing(true);
    const response = await fetch(`${API_URL}/api/dreams`);
    if (response.ok) {
      const dreamsData = await response.json();
      setDreams(dreamsData);
    } else {
      Alert.alert("Error", "Failed to fetch dreams.");
    }
    setIsRefreshing(false);
    setIsLoading(false);
  };

  const handleDreamSelection = async (dreamId) => {
    setIsLoading(true);
    const response = await fetch(`${API_URL}/api/dreams/${dreamId}`);
    if (response.ok) {
      const dreamData = await response.json();
      navigation.navigate("Details", { dreamId, dreamData });
    } else {
      Alert.alert("Error", "Failed to fetch dream details.");
    }
    setIsLoading(false);
  };

  const handleSearch = async () => {
    setIsLoading(true);
    const response = await fetch(`${API_URL}/api/dreams/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: debouncedSearchText }),
    });

    if (response.ok) {
      const results = await response.json();
      setSearchResults(results);
    } else {
      Alert.alert("Error", "Failed to perform search.");
    }
    setIsLoading(false);
  };

  const handleClearSearch = () => {
    setSearchText("");
    setSearchResults([]);
  };

  const navigateToNewDream = () => {
    navigation.navigate("New Dream");
  };

  const renderDreamItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.dreamItem}
        onPress={() => handleDreamSelection(item.id)}
      >
        <View style={styles.dreamTextContent}>
          <Text style={styles.dreamItemText}>{item.metadata.title}</Text>
          <Text style={styles.dreamItemDate}>{item.metadata.date}</Text>
        </View>
        {item.metadata.image && (
          <Image
            source={{ uri: item.metadata.image }}
            style={styles.dreamItemImage}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.container}>
        <View
          style={[
            styles.searchBar,
            { flexDirection: "row", justifyContent: "space-between" },
          ]}
        >
          <TextInput
            style={styles.input}
            value={searchText}
            onChangeText={(text) => setSearchText(text)}
            placeholder="Search for dreams"
            placeholderTextColor="#888"
            onSubmitEditing={handleSearch}
          />
          {searchText.length > 0 && (
            <TouchableOpacity
              onPress={handleClearSearch}
              style={styles.clearButton}
            >
              <MaterialCommunityIcons
                name="close-circle"
                color="#00ADB5"
                size={26}
              />
            </TouchableOpacity>
          )}
        </View>
        {isLoading ? (
          <ActivityIndicator
            size="large"
            color="#00ADB5"
            style={styles.loadingIndicator}
          />
        ) : (
          <FlatList
            data={searchResults.length > 0 ? searchResults : dreams}
            keyExtractor={(item) => (item && item.id ? item.id.toString() : "")}
            renderItem={renderDreamItem}
            style={styles.list}
            contentContainerStyle={{ paddingBottom: 80 }} // Increased padding at the bottom
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={fetchDreams}
              />
            }
          />
        )}
      </View>
      <FAB
        style={{
          position: "absolute",
          margin: 16,
          right: 16,
          bottom: 0,
          backgroundColor: "rgba(0, 173, 181, 0.8)",
          elevation: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.5,
          shadowRadius: 5,
          borderRadius: 33,
        }}
        icon={() => (
          <MaterialCommunityIcons name="plus" color="white" size={26} />
        )}
        onPress={navigateToNewDream}
      />
    </View>
  );
};

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

const RegenerateScreen = ({ route, navigation }) => {
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

const App = () => {
  return (
    <NavigationContainer theme={navigationTheme}>
      <Tab.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: "#0C0E17",
            elevation: 4, // This is for Android
            shadowOpacity: 0.5, // This is for iOS
            shadowRadius: 5, // This is for iOS
            shadowColor: "#000", // This is for iOS
            shadowOffset: { height: 2, width: 0 }, // This is for iOS
          },
          headerTitleStyle: {
            color: "#FFFFFF",
            fontWeight: "bold",
          },
          tabBarStyle: {
            backgroundColor: "#0C0E17",
            borderTopColor: "#0C0E17",
            elevation: 4, // This is for Android
            shadowOpacity: 0.5, // This is for iOS
            shadowRadius: 5, // This is for iOS
            shadowColor: "#000", // This is for iOS
            shadowOffset: { height: 2, width: 0 }, // This is for iOS
          },
          tabBarLabelStyle: {
            fontSize: 14,
            fontWeight: "bold",
            color: "#FFFFFF",
          },
          tabBarActiveTintColor: "#00ADB5",
          tabBarInactiveTintColor: "#6B7280",
        }}
      >
        <Tab.Screen
          name="Dreams"
          component={DreamsScreenStack}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="cloud" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="Emris"
          component={ChatScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="chat" color={color} size={size} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

const DreamsScreenStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Journal"
        component={DreamsScreen}
        options={{
          headerTitleAlign: "center",
          headerTintColor: "#FFFFFF",
          headerStyle: {
            backgroundColor: "#0C0E17",
            elevation: 4, // This is for Android
            shadowOpacity: 0.5, // This is for iOS
            shadowRadius: 5, // This is for iOS
            shadowColor: "#000", // This is for iOS
            shadowOffset: { height: 2, width: 0 }, // This is for iOS
          },
        }}
      />
      <Stack.Screen
        name="New Dream"
        component={NewDreamScreen}
        options={{
          headerTitleAlign: "center",
          headerTintColor: "#FFFFFF",
          headerStyle: {
            backgroundColor: "#0C0E17",
            elevation: 4, // This is for Android
            shadowOpacity: 0.5, // This is for iOS
            shadowRadius: 5, // This is for iOS
            shadowColor: "#000", // This is for iOS
            shadowOffset: { height: 2, width: 0 }, // This is for iOS
          },
        }}
      />
      <Stack.Screen
        name="Details"
        component={DetailsScreen}
        options={{
          headerTitleAlign: "center",
          headerTintColor: "#FFFFFF",
          headerStyle: {
            backgroundColor: "#0C0E17",
            elevation: 4, // This is for Android
            shadowOpacity: 0.5, // This is for iOS
            shadowRadius: 5, // This is for iOS
            shadowColor: "#000", // This is for iOS
            shadowOffset: { height: 2, width: 0 }, // This is for iOS
          },
        }}
      />
      <Stack.Screen
        name="Regenerate"
        component={RegenerateScreen}
        options={{
          headerTitleAlign: "center",
          headerTintColor: "#FFFFFF",
          headerStyle: {
            backgroundColor: "#0C0E17",
            elevation: 4, // This is for Android
            shadowOpacity: 0.5, // This is for iOS
            shadowRadius: 5, // This is for iOS
            shadowColor: "#000", // This is for iOS
            shadowOffset: { height: 2, width: 0 }, // This is for iOS
          },
        }}
      />
    </Stack.Navigator>
  );
};

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#0C0E17",
    text: "#FFFFFF",
  },
};

const styles = StyleSheet.create({
  // General
  container: {
    flexGrow: 1,
    padding: 20,
  },

  label: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#00ADB5",
  },
  subLabel: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#00ADB5",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#123",
    borderRadius: 20,
    padding: 10,
    marginBottom: 20,
    color: "#FFFFFF",
    backgroundColor: "#272B3B",
    fontSize: 18,
  },
  tallerInput: {
    height: 270,
  },
  list: {
    marginBottom: 30,
  },
  loadingIndicator: {
    justifyContent: "center",
    height: "90%",
  },

  // Dream Item
  dreamItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#123",
    borderRadius: 22,
    marginBottom: 15,
    backgroundColor: "#272B3B",
    padding: 15,
    ...this.dropShadow,
  },
  dreamItemImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginLeft: 15,
    ...this.engravedShadow,
  },
  dreamItemText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "500",
  },
  dreamItemDate: {
    color: "#6B7280",
    fontSize: 14,
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
    color: "#00ADB5",
    fontSize: 18,
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
  // Analysis
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

  // Image
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

  // New styles
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
  cardActions: {
    justifyContent: "space-between",
  },

  // Buttons
  generateButton: {
    marginBottom: 15,
    ...this.buttonStyle,
    backgroundColor: "#00ADB5",
    width: "100%",
  },
  saveButton: {
    marginBottom: 15,
    ...this.buttonStyle,
    backgroundColor: "#00ADB5",
    width: "100%",
  },
  emptyStateButton: {
    ...this.buttonStyle,
    backgroundColor: "#00ADB5",
  },
  overwriteButton: {
    marginTop: 15,
    marginBottom: 15,
    ...this.buttonStyle,
    backgroundColor: "#7851A9",
  },

  // Button Text
  generateButtonText: {
    ...this.buttonTextStyle,
  },
  saveButtonText: {
    ...this.buttonTextStyle,
  },
  overwriteButtonText: {
    ...this.buttonTextStyle,
  },

  // Dream
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
  datePicker: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#123",
    borderRadius: 20,
    padding: 10,
    marginBottom: 20,
    backgroundColor: "#272B3B",
  },
  dateText: {
    color: "#FFFFFF",
    fontSize: 18,
  },
  dateIcon: {
    color: "#888",
  },
  dreamEntry: {
    fontSize: 18,
    marginBottom: 10,
    color: "#A0AEC0",
  },

  // Empty State
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyStateImage: {
    marginBottom: 25,
  },
  emptyStateText: {
    fontSize: 18,
    marginBottom: 25,
    color: "#FFFFFF",
  },

  // Search
  searchResultItem: {
    borderWidth: 1,
    borderColor: "#123",
    borderRadius: 20,
    padding: 15,
    marginBottom: 15,
    backgroundColor: "#272B3B",
  },
  searchResultText: {
    color: "#FFFFFF",
    fontSize: 18,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 0,
    borderRadius: 20,
    padding: 0,
  },
  // Style for the clear button
  clearButton: {
    position: "absolute",
    right: 10,
    backgroundColor: "transparent",
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    top: "50%",
    transform: [{ translateY: -25 }],
  },
  clearButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
  },

  // Chat
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
  sendButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 18,
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
    // width: 300, // matching width with systemMessageContainer
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
  // Reusable Styles
  dropShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 5,
  },
  engravedShadow: {
    borderWidth: 1,
    borderColor: "#272B3B",
    backgroundColor: "#272B3B",
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
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
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 18,
  },
  messageTextStyle: {
    color: "#FFFFFF",
    fontSize: 18,
  },
});

export default App;