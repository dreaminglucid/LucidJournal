import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, Alert, Image, FlatList, TouchableOpacity, ActivityIndicator, ScrollView, RefreshControl, KeyboardAvoidingView } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Button, Card, Title, Subheading, FAB } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useDebounce } from 'use-debounce';
import API_URL from './config';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer theme={navigationTheme}>
      <Tab.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#0C0E17',
            elevation: 4, // This is for Android
            shadowOpacity: 0.5, // This is for iOS
            shadowRadius: 5, // This is for iOS
            shadowColor: '#000', // This is for iOS
            shadowOffset: { height: 2, width: 0 }, // This is for iOS
          },
          headerTitleStyle: {
            color: '#FFFFFF',
            fontWeight: 'bold',
          },
          tabBarStyle: {
            backgroundColor: '#0C0E17',
            borderTopColor: '#0C0E17',
            elevation: 4, // This is for Android
            shadowOpacity: 0.5, // This is for iOS
            shadowRadius: 5, // This is for iOS
            shadowColor: '#000', // This is for iOS
            shadowOffset: { height: 2, width: 0 }, // This is for iOS
          },
          tabBarLabelStyle: {
            fontSize: 14,
            fontWeight: 'bold',
            color: '#FFFFFF',
          },
          tabBarActiveTintColor: '#00ADB5',
          tabBarInactiveTintColor: '#6B7280',
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

const ChatScreen = () => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      text: "My name is Emris, I am your personal dream guide AI! Please ask something about your dreams.",
      sender: "System",
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef();

  const handleSendMessage = () => {
    if (message.trim() === '') {
      return;
    }

    const newMessage = {
      text: message,
      sender: 'User',
      timestamp: new Date(),
    };

    // Add the user's message to the chat history
    setChatHistory((prevChatHistory) => [...prevChatHistory, newMessage]);
    setIsTyping(true);
    setMessage('');
  };

  useEffect(() => {
    const getSystemResponse = async () => {
      try {
        const response = await fetch(`${API_URL}/api/dreams/search-chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt: message }),
        });

        if (response.ok) {
          const responseData = await response.json();
          const systemResponse = {
            // Get the discussion text from the response
            text: responseData['arguments']['discussion'],
            sender: 'System',
            timestamp: new Date(),
          };

          // Add the system's response to the chat history
          setChatHistory((prevChatHistory) => [...prevChatHistory, systemResponse]);
        } else {
          Alert.alert('Error', 'Failed to send message.');
        }
      } catch (error) {
        console.error('Error:', error);
        Alert.alert('Error', 'An unexpected error occurred.');
      }

      setIsTyping(false);
    }

    if (isTyping) {
      getSystemResponse();
      setMessage('');
    }
  }, [isTyping]);

  const renderMessageItem = ({ item }) => {
    const isUserMessage = item.sender === 'User';
    return (
      <View style={isUserMessage ? styles.userMessageContainer : styles.systemMessageContainer}>
        <Text style={isUserMessage ? styles.userMessageText : styles.systemMessageText}>{item.text}</Text>
        <Text style={styles.timestamp}>{item.timestamp.toLocaleTimeString()}</Text>
      </View>
    );
  };

  const renderEmptyState = () => {
    return (
      <View style={styles.emptyStateContainer}>
        <Text style={styles.emptyStateText}>No messages yet. Start a conversation!</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 20}
    >
      <FlatList
        ref={flatListRef}
        contentContainerStyle={styles.container}
        data={chatHistory}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderMessageItem}
        ListEmptyComponent={renderEmptyState}
        onContentSizeChange={() => chatHistory.length > 0 && flatListRef.current.scrollToEnd()}
      />

      {isTyping && <ActivityIndicator size="small" color="#00ADB5" style={styles.loadingIndicator} />}

      <View style={styles.chatInputContainer}>
        <TextInput
          style={styles.chatInput}
          value={message}
          onChangeText={(text) => setMessage(text)}
          placeholder="Type a message"
          placeholderTextColor="#888"
          onSubmitEditing={handleSendMessage}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const NewDreamScreen = () => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [entry, setEntry] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (title.trim() === '') {
      Alert.alert('Warning', 'Please enter a dream title.');
      return false;
    }
    if (!date) {
      Alert.alert('Warning', 'Please enter a dream date.');
      return false;
    }
    if (entry.trim() === '') {
      Alert.alert('Warning', 'Please enter a dream entry.');
      return false;
    }
    return true;
  };

  const handleSaveDream = async () => {
    if (!validateForm()) {
      return;
    }

    const formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/dreams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, date: formattedDate, entry }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Dream saved successfully!');
        setTitle('');
        setDate(new Date());
        setEntry('');
      } else {
        Alert.alert('Error', 'Failed to save dream.');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Dream Date</Text>
      <TouchableOpacity style={styles.datePicker} onPress={() => setShowDatePicker(true)}>
        <TextInput
          style={[styles.dateText, { flex: 1 }]}
          value={`${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`}
          editable={false}
          placeholder="MM/DD/YYYY"
          placeholderTextColor="#888"
        />
        <MaterialCommunityIcons style={styles.dateIcon} name="calendar-blank" size={24} />
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
        {loading ? <ActivityIndicator size="small" color="#FFFFFF" /> : 'Save Dream'}
      </Button>
    </ScrollView>
  );
};

const DreamsScreen = ({ navigation }) => {
  const [dreams, setDreams] = useState([]);
  const [searchText, setSearchText] = useState('');
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
      Alert.alert('Error', 'Failed to fetch dreams.');
    }
    setIsRefreshing(false);
    setIsLoading(false);
  };

  const handleDreamSelection = (dreamId) => {
    navigation.navigate('Details', { dreamId });
  };

  const handleSearch = async () => {
    setIsLoading(true);
    const response = await fetch(`${API_URL}/api/dreams/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: debouncedSearchText }),
    });

    if (response.ok) {
      const results = await response.json();
      setSearchResults(results);
    } else {
      Alert.alert('Error', 'Failed to perform search.');
    }
    setIsLoading(false);
  };

  const handleClearSearch = () => {
    setSearchText('');
    setSearchResults([]);
  };

  const navigateToNewDream = () => {
    navigation.navigate('New Dream');
  };

  const renderDreamItem = ({ item }) => {
    return (
      <TouchableOpacity style={styles.dreamItem} onPress={() => handleDreamSelection(item.id)}>
        <View style={styles.dreamTextContent}>
          <Text style={styles.dreamItemText}>{item.metadata.title}</Text>
          <Text style={styles.dreamItemDate}>{item.metadata.date}</Text>
        </View>
        {item.metadata.image && (
          <Image source={{ uri: item.metadata.image }} style={styles.dreamItemImage} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={[styles.searchBar, { flexDirection: 'row', justifyContent: 'space-between' }]}>
          <TextInput
            style={styles.input}
            value={searchText}
            onChangeText={(text) => setSearchText(text)}
            placeholder="Search for dreams"
            placeholderTextColor="#888"
            onSubmitEditing={handleSearch}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
              <MaterialCommunityIcons name="close-circle" color="#00ADB5" size={26} />
            </TouchableOpacity>
          )}
        </View>
        {isLoading ? (
          <ActivityIndicator size="large" color="#00ADB5" style={styles.loadingIndicator} />
        ) : (
          <FlatList
            data={searchResults.length > 0 ? searchResults : dreams}
            keyExtractor={(item) => item && item.id ? item.id.toString() : ''}
            renderItem={renderDreamItem}
            style={styles.list}
            contentContainerStyle={{ paddingBottom: 80 }} // Increased padding at the bottom
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={fetchDreams} />
            }
          />
        )}
      </View>
      <FAB
        style={{
          position: 'absolute',
          margin: 16,
          right: 16,
          bottom: 6,
          backgroundColor: 'rgba(0, 173, 181, 0.8)',
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.5,
          shadowRadius: 5,
          borderRadius: 33,
        }}
        icon={() => <MaterialCommunityIcons name="plus" color="white" size={26} />}
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
  const [analysisResult, setAnalysisResult] = useState('');
  const [imageData, setImageData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [generationStatus, setGenerationStatus] = useState('idle');

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchDream);

    // Call fetchDream for the first time
    fetchDream();

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    if (generationStatus === 'generating') {
      handleGenerateDream();
    }
  }, [generationStatus]);

  const fetchDream = async () => {
    try {
      setIsRefreshing(true);
      const response = await fetch(`${API_URL}/api/dreams/${dreamId}`);
      if (response.ok) {
        let dreamData = await response.json();
        if ('analysis' in dreamData) {
          let analysisText = dreamData.analysis;
          try {
            // Try to parse the string as JSON
            const parsedText = JSON.parse(analysisText);
            if (typeof parsedText === 'string') {
              // If the parsed result is a string, use it
              analysisText = parsedText;
            }
          } catch (e) {
            // If parsing fails, it's not valid JSON, so we'll just use the original string
          }
          analysisText = analysisText.replace(/\\"/g, '"').replace(/\\n/g, '\n');
          setAnalysisResult(analysisText);
        }
        if ('image' in dreamData) {
          setImageData(dreamData.image);
        }
        setDream(dreamData);
      } else {
        Alert.alert('Error', 'Failed to fetch dream details.');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleGenerateDream = () => {
    setIsLoading(true);
    fetchDreamAnalysis()
      .then(analysis => {
        setAnalysisResult(analysis);
      })
      .catch(error => {
        console.error('Error during analysis generation:', error);
        Alert.alert('Error', 'An unexpected error occurred during analysis generation.');
        setGenerationStatus('error');
        setIsLoading(false);
      });

    fetchDreamImage()
      .then(image => {
        setImageData(image);
      })
      .catch(error => {
        console.error('Error during image generation:', error);
        Alert.alert('Error', 'An unexpected error occurred during image generation.');
        setGenerationStatus('error');
        setIsLoading(false);
      });
  };

  useEffect(() => {
    if (analysisResult && imageData) {
      setIsLoading(false);
      setGenerationStatus('success');
    }
  }, [analysisResult, imageData]);

  const fetchDreamAnalysis = async () => {
    try {
      const response = await fetch(`${API_URL}/api/dreams/${dreamId}/analysis`);
      if (!response.ok) {
        throw new Error('Failed to fetch dream analysis.');
      }
      let analysisResult = await response.text();
      try {
        // Try to parse the string as JSON
        const parsedText = JSON.parse(analysisResult);
        if (typeof parsedText === 'string') {
          // If the parsed result is a string, use it
          analysisResult = parsedText;
        }
      } catch (e) {
        // If parsing fails, it's not valid JSON, so we'll just use the original string
      }
      analysisResult = analysisResult.replace(/\\"/g, '"').replace(/\\n/g, '\n');
      return analysisResult;
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
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
        Alert.alert('Error', 'Failed to fetch dream image.');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    }
  };

  const handleSaveAnalysisAndImage = async () => {
    try {
      const response = await fetch(`${API_URL}/api/dreams/${dreamId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ analysis: analysisResult, image: imageData }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Analysis and image saved successfully!');
        setDream({
          ...dream,
          analysis: analysisResult,
          image: imageData,
        });
      } else {
        Alert.alert('Error', 'Failed to save analysis and image.');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
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
          <Subheading style={styles.subLabel}>Dream Title</Subheading>
          <Text style={styles.dreamTitle}>{dream.metadata.title}</Text>
          <Subheading style={styles.subLabel}>Dream Date</Subheading>
          <Text style={styles.dreamDate}>{dream.metadata.date}</Text>
          <Subheading style={styles.subLabel}>Dream Entry</Subheading>
          <Text style={styles.dreamEntry}>{dream.metadata.entry}</Text>
        </>
      )}
      {isLoading ? (
        <ActivityIndicator size="large" color="#00ADB5" style={styles.loadingIndicator} />
      ) : (
        <>
          <Subheading style={styles.analysisLabel}>Dream Analysis</Subheading>
          <Text style={styles.analysisResult}>{analysisResult}</Text>
          {imageData && (
            <View style={styles.imageContainer}>
              <Image source={{ uri: imageData }} style={styles.image} />
            </View>
          )}
          {dream && dream.analysis && dream.image ? (
            <Button
              mode="contained"
              onPress={() => navigation.navigate('Regenerate', { dreamId })}
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
  const [shouldRegenerate, setShouldRegenerate] = useState(false);
  const [canSave, setCanSave] = useState(false);
  const [generationStatus, setGenerationStatus] = useState('idle');

  useEffect(() => {
    fetchDream();
  }, []);

  useEffect(() => {
    if (dream && shouldRegenerate) {
      handleRegenerateDream();
    }
  }, [dream, shouldRegenerate]);

  useEffect(() => {
    if (generationStatus === 'generating') {
      handleRegenerateDream();
    }
  }, [generationStatus]);

  const fetchDream = async () => {
    try {
      const response = await fetch(`${API_URL}/api/dreams/${dreamId}`);
      if (response.ok) {
        let dreamData = await response.json();
        if ('analysis' in dreamData) {
          let analysisText = dreamData.analysis;
          try {
            // Try to parse the string as JSON
            const parsedText = JSON.parse(analysisText);
            if (typeof parsedText === 'string') {
              // If the parsed result is a string, use it
              analysisText = parsedText;
            }
          } catch (e) {
            // If parsing fails, it's not valid JSON, so we'll just use the original string
          }
          analysisText = analysisText.replace(/\\"/g, '"').replace(/\\n/g, '\n');
          setAnalysisResult(analysisText);
        }
        if ('image' in dreamData) {
          setImageData(dreamData.image);
        }
        setDream(dreamData);
      } else {
        Alert.alert('Error', 'Failed to fetch dream details.');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    }
  };

  const handleRegenerateDream = () => {
    setIsLoading(true);
    Promise.all([
      generateDreamAnalysis(),
      generateDreamImage()
    ])
      .then(([newAnalysisResult, newImageData]) => {
        setAnalysisResult(newAnalysisResult);
        setImageData(newImageData);
        setShouldRegenerate(false); // Reset shouldRegenerate after a successful regeneration
        setCanSave(true);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error during regeneration:', error);
        Alert.alert('Error', 'An unexpected error occurred during regeneration.');
        setCanSave(false);
        setIsLoading(false);
      });
  };

  const generateDreamAnalysis = async () => {
    const response = await fetch(`${API_URL}/api/dreams/${dreamId}/analysis`);
    if (!response.ok) {
      throw new Error('Failed to generate dream analysis.');
    }
    let analysis = await response.text();
    try {
      // Try to parse the string as JSON
      const parsedText = JSON.parse(analysis);
      if (typeof parsedText === 'string') {
        // If the parsed result is a string, use it
        analysis = parsedText;
      }
    } catch (e) {
      // If parsing fails, it's not valid JSON, so we'll just use the original string
    }
    analysis = analysis.replace(/\\"/g, '"').replace(/\\n/g, '\n');
    return analysis;
  };

  const generateDreamImage = async () => {
    const response = await fetch(`${API_URL}/api/dreams/${dreamId}/image`);
    if (!response.ok) {
      throw new Error('Failed to generate dream image.');
    }
    const imageData = await response.json();
    return imageData.image;
  };

  const handleOverwriteSave = async () => {
    try {
      const response = await fetch(`${API_URL}/api/dreams/${dreamId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ analysis: analysisResult, image: imageData }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Analysis and image overwritten successfully!');
        setDream({
          ...dream,
          analysis: analysisResult,
          image: imageData,
        });
        // Go back to DetailsScreen after successful save
        navigation.navigate('Details', { dreamId, dreamUpdated: true });
      } else {
        Alert.alert('Error', 'Failed to overwrite analysis and image.');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {dream && (
        <>
          <Subheading style={styles.subLabel}>Dream Title</Subheading>
          <Text style={styles.dreamTitle}>{dream.metadata.title}</Text>
          <Subheading style={styles.subLabel}>Dream Date</Subheading>
          <Text style={styles.dreamDate}>{dream.metadata.date}</Text>
          <Subheading style={styles.subLabel}>Dream Entry</Subheading>
          <Text style={styles.dreamEntry}>{dream.metadata.entry}</Text>
        </>
      )}
      {isLoading ? (
        <ActivityIndicator size="large" color="#00ADB5" style={styles.loadingIndicator} />
      ) : (
        <>
          <Subheading style={styles.analysisLabel}>Dream Analysis</Subheading>
          <Text style={styles.analysisResult}>{analysisResult}</Text>
          <View style={styles.imageContainer}>
            <Image source={{ uri: imageData }} style={styles.image} />
          </View>
          <Button
            mode="contained"
            onPress={() => setShouldRegenerate(true)}
            style={styles.regenerateButton}
            labelStyle={styles.regenerateButtonText}
          >
            Regenerate
          </Button>
          <Button
            mode="contained"
            onPress={handleOverwriteSave}
            disabled={!canSave} // add this line
            style={styles.overwriteButton}
            labelStyle={styles.overwriteButtonText}
          >
            Overwrite Save
          </Button>
        </>
      )}
    </ScrollView>
  );
};

const DreamsScreenStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Journal"
        component={DreamsScreen}
        options={{
          headerTitleAlign: 'center',
          headerTintColor: '#FFFFFF',
          headerStyle: {
            backgroundColor: '#0C0E17',
            elevation: 4, // This is for Android
            shadowOpacity: 0.5, // This is for iOS
            shadowRadius: 5, // This is for iOS
            shadowColor: '#000', // This is for iOS
            shadowOffset: { height: 2, width: 0 }, // This is for iOS
          },
        }}
      />
      <Stack.Screen
        name="New Dream"
        component={NewDreamScreen}
        options={{
          headerTitleAlign: 'center',
          headerTintColor: '#FFFFFF',
          headerStyle: {
            backgroundColor: '#0C0E17',
            elevation: 4, // This is for Android
            shadowOpacity: 0.5, // This is for iOS
            shadowRadius: 5, // This is for iOS
            shadowColor: '#000', // This is for iOS
            shadowOffset: { height: 2, width: 0 }, // This is for iOS
          },
        }}
      />
      <Stack.Screen
        name="Details"
        component={DetailsScreen}
        options={{
          headerTitleAlign: 'center',
          headerTintColor: '#FFFFFF',
          headerStyle: {
            backgroundColor: '#0C0E17',
            elevation: 4, // This is for Android
            shadowOpacity: 0.5, // This is for iOS
            shadowRadius: 5, // This is for iOS
            shadowColor: '#000', // This is for iOS
            shadowOffset: { height: 2, width: 0 }, // This is for iOS
          },
        }}
      />
      <Stack.Screen
        name="Regenerate"
        component={RegenerateScreen}
        options={{
          headerTitleAlign: 'center',
          headerTintColor: '#FFFFFF',
          headerStyle: {
            backgroundColor: '#0C0E17',
            elevation: 4, // This is for Android
            shadowOpacity: 0.5, // This is for iOS
            shadowRadius: 5, // This is for iOS
            shadowColor: '#000', // This is for iOS
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
    background: '#0C0E17',
    text: '#FFFFFF',
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
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#00ADB5',
  },
  subLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#00ADB5',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#123',
    borderRadius: 20,
    padding: 10,
    marginBottom: 20,
    color: '#FFFFFF',
    backgroundColor: '#272B3B',
    fontSize: 18,
  },
  tallerInput: {
    height: 270,
  },
  list: {
    marginBottom: 30,
  },

  // Dream Item
  dreamItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#123',
    borderRadius: 20,
    marginBottom: 15,
    backgroundColor: '#272B3B',
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
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '500',
  },
  dreamItemDate: {
    color: '#6B7280',
    fontSize: 14,
  },

  // Loading Indicator
  loadingIndicator: {
    marginTop: 30,
  },

  // Analysis
  analysisLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#00ADB5',
  },
  analysisResult: {
    fontSize: 18,
    marginBottom: 20,
    color: '#A0AEC0',
  },

  // Image
  imageContainer: {
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 30,
  },
  image: {
    width: 350,
    height: 350,
    resizeMode: 'contain',
    borderRadius: 35,
  },

  // Buttons
  generateButton: {
    marginBottom: 15,
    ...this.buttonStyle,
    backgroundColor: '#00ADB5',
  },
  saveButton: {
    marginBottom: 15,
    ...this.buttonStyle,
    backgroundColor: '#00ADB5',
  },
  emptyStateButton: {
    ...this.buttonStyle,
    backgroundColor: '#00ADB5',
  },
  overwriteButton: {
    marginTop: 15,
    marginBottom: 15,
    ...this.buttonStyle,
    backgroundColor: '#7851A9',
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
    marginBottom: 25,
    color: '#A0AEC0',
    fontWeight: 'bold',
  },
  dreamDate: {
    fontSize: 18,
    marginBottom: 25,
    color: '#A0AEC0',
    fontWeight: 'bold',
  },
  datePicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#123',
    borderRadius: 20,
    padding: 10,
    marginBottom: 20,
    backgroundColor: '#272B3B',
  },
  dateText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  dateIcon: {
    color: '#888',
  },
  dreamEntry: {
    fontSize: 18,
    marginBottom: 25,
    color: '#A0AEC0',
  },

  // Empty State
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateImage: {
    marginBottom: 25,
  },
  emptyStateText: {
    fontSize: 18,
    marginBottom: 25,
    color: '#FFFFFF',
  },

  // Search
  searchResultItem: {
    borderWidth: 1,
    borderColor: '#123',
    borderRadius: 20,
    padding: 15,
    marginBottom: 15,
    backgroundColor: '#272B3B',
  },
  searchResultText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
    borderRadius: 20,
    padding: 0,
  },
  // Style for the clear button
  clearButton: {
    position: 'absolute',
    right: 10,
    backgroundColor: 'transparent',  // Change the background to transparent
    width: 30,   // Increase the width and height
    height: 30,  // Increase the width and height
    alignItems: 'center',
    justifyContent: 'center',
    top: '50%',
    transform: [{ translateY: -25 }],
    
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
  },

  // Chat
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 30,
    backgroundColor: '#272B3B',
    marginBottom: 39,
  },
  chatInput: {
    flex: 1,
    fontSize: 18,
    color: '#FFFFFF',
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#00ADB5',
    borderRadius: 30,
    padding: 10,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
    borderRadius: 20,
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#00ADB5',
  },
  systemMessageContainer: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#272B3B',
  },
  userMessageText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  systemMessageText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  timestamp: {
    fontSize: 14,
    color: '#6B7280',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 18,
    marginBottom: 25,
    color: '#FFFFFF',
  },
  // Reusable Styles
  dropShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 5,
  },
  engravedShadow: {
    borderWidth: 1,
    borderColor: '#272B3B',
    backgroundColor: '#272B3B',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
  },
  buttonStyle: {
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 6,
  },
  buttonTextStyle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  messageTextStyle: {
    color: '#FFFFFF',
    fontSize: 18,
  },
});

export default App;