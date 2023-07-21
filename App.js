import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, Alert, Image, FlatList, TouchableOpacity, ActivityIndicator, ScrollView, RefreshControl, KeyboardAvoidingView } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Button, Card, Title, Subheading } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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
          },
          headerTitleStyle: {
            color: '#FFFFFF',
            fontWeight: 'bold',
          },
          tabBarStyle: {
            backgroundColor: '#0C0E17',
            borderTopColor: '#0C0E17',
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
          name="New Dream"
          component={NewDreamScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="plus-circle" color={color} size={size} />
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
  const [chatHistory, setChatHistory] = useState([]);
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

    // Clear the input field
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
            text: responseData.arguments.discussion,
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
    }
  }, [chatHistory]);

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
      keyboardVerticalOffset={Platform.OS === 'ios' ? 45 : 20}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <FlatList
          ref={flatListRef}
          data={chatHistory}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderMessageItem}
          ListEmptyComponent={renderEmptyState}
          onContentSizeChange={() => chatHistory.length > 0 && flatListRef.current.scrollToEnd()}
        />

        {isTyping && <ActivityIndicator size="small" color="#00ADB5" />}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={(text) => setMessage(text)}
          placeholder="Type a message"
          onSubmitEditing={handleSendMessage}
        />
        <Button title="Send" onPress={handleSendMessage} />
      </View>
    </KeyboardAvoidingView>
  );
};

const NewDreamScreen = () => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [entry, setEntry] = useState('');

  const handleSaveDream = async () => {
    if (title.trim() === '') {
      Alert.alert('Warning', 'Please enter a dream title.');
      return;
    }

    if (date.trim() === '') {
      Alert.alert('Warning', 'Please enter a dream date.');
      return;
    }

    if (entry.trim() === '') {
      Alert.alert('Warning', 'Please enter a dream entry.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/dreams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, date, entry }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Dream saved successfully!');
        setTitle('');
        setDate('');
        setEntry('');
      } else {
        Alert.alert('Error', 'Failed to save dream.');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Dream Title</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={(text) => setTitle(text)}
      />
      <Text style={styles.label}>Dream Date</Text>
      <TextInput
        style={styles.input}
        value={date}
        onChangeText={(text) => setDate(text)}
      />
      <Text style={styles.label}>Dream Entry</Text>
      <TextInput
        style={[styles.input, styles.tallerInput]} // Added 'tallerInput' style
        value={entry}
        onChangeText={(text) => setEntry(text)}
        multiline
      />
      <Button
        mode="contained"
        onPress={handleSaveDream}
        style={styles.saveButton}
        labelStyle={styles.saveButtonText}
      >
        Save Dream
      </Button>
    </ScrollView>
  );
};

const DreamsScreen = ({ navigation }) => {
  const [dreams, setDreams] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchDreams();
  }, []);

  const fetchDreams = async () => {
    try {
      setIsRefreshing(true);  // Add this line
      const response = await fetch(`${API_URL}/api/dreams`);
      if (response.ok) {
        const dreamsData = await response.json();
        console.log('Dreams data from API:', dreamsData);
        if (!Array.isArray(dreamsData)) {
          throw new Error('Dreams data is not an array');
        }
        const dreams = dreamsData;
        console.log('Dreams data after processing:', dreams);
        setDreams(dreams);
      } else {
        Alert.alert('Error', 'Failed to fetch dreams.');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);  // Add this line
    }
  };

  const handleDreamSelection = (dreamId) => {
    console.log(dreamId); // log the dreamId
    navigation.navigate('Details', { dreamId });
  };

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/dreams/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: searchText }),
      });

      if (response.ok) {
        const results = await response.json();
        setSearchResults(results);
      } else {
        Alert.alert('Error', 'Failed to perform search.');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchText('');
    setSearchResults([]);
  };

  const renderDreamItem = ({ item }) => {
    console.log(item); // log the entire dream item
    return (
      <TouchableOpacity onPress={() => handleDreamSelection(item.id)}>
        <Card elevation={3} style={styles.dreamItem}>
          <Card.Content>
            <Title style={styles.dreamItemText}>{item.metadata.title}</Title>
            <Subheading style={styles.dreamItemDate}>{item.metadata.date}</Subheading>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.input}
          value={searchText}
          onChangeText={(text) => setSearchText(text)}
          placeholder="Search for dreams"
          onSubmitEditing={handleSearch} // Call handleSearch when user submits the form
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>X</Text>
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
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={fetchDreams} />
          }
        />
      )}
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
  container: {
    flexGrow: 1,
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 10,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#00ADB5',
  },
  subLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 0,
    marginBottom: 5,
    color: '#00ADB5',
  },
  input: {
    borderWidth: 1,
    borderColor: '#123',
    borderRadius: 15,
    padding: 10,
    marginBottom: 20,
    color: '#FFFFFF',
    backgroundColor: '#272B3B',
    fontSize: 16,
  },
  tallerInput: {
    height: 369, // Adjust the height as desired
  },
  list: {
    marginBottom: 20,
  },
  dreamItem: {
    borderWidth: 1,
    borderColor: '#123',
    borderRadius: 15,
    marginBottom: 10,
    backgroundColor: '#272B3B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 5,
  },
  dreamItemText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  dreamItemDate: {
    color: '#6B7280',
    fontSize: 12,
  },
  loadingIndicator: {
    marginTop: 20,
  },
  analysisLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#00ADB5',
  },
  analysisResult: {
    fontSize: 16,
    marginBottom: 20,
    color: '#A0AEC0',
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  image: {
    width: 333,
    height: 333,
    resizeMode: 'contain',
    borderRadius: 33,
  },
  generateButton: {
    marginBottom: 10,
    backgroundColor: '#00ADB5',
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  saveButton: {
    marginBottom: 10,
    backgroundColor: '#00ADB5',
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  dreamTitle: {
    fontSize: 18,
    marginBottom: 20,
    color: '#A0AEC0',
    fontWeight: 'bold',
  },
  dreamDate: {
    fontSize: 16,
    marginBottom: 20,
    color: '#A0AEC0',
    fontWeight: 'bold',
  },
  dreamEntry: {
    fontSize: 16,
    marginBottom: 20,
    color: '#A0AEC0',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateImage: {
    marginBottom: 20,
  },
  emptyStateText: {
    fontSize: 16,
    marginBottom: 20,
    color: '#FFFFFF',
  },
  emptyStateButton: {
    backgroundColor: '#00ADB5',
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  overwriteButton: {
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: '#7851A9',
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  overwriteButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  searchResultItem: {
    borderWidth: 1,
    borderColor: '#123',
    borderRadius: 15,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#272B3B',
  },
  searchResultText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  searchBar: {

  },
  clearButton: {
    padding: 10,
  },
  clearButtonText: {
    fontSize: 16,
    color: '#999',
  },
  chatInput: {
    flexGrow: 1,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#123',
    borderRadius: 15,
    padding: 10,
    color: '#FFFFFF',
    backgroundColor: '#272B3B',
    fontSize: 16,
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
    borderRadius: 15,
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#00ADB5',
  },
  userMessageText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  systemMessageContainer: {
    alignSelf: 'flex-start',
    borderRadius: 15,
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#272B3B',
  },
  systemMessageText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  timestamp: {
    fontSize: 12,
    color: '#6B7280',
  },
});

export default App;