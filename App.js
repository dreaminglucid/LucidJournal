import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, Alert, Image, FlatList, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
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
      </Tab.Navigator>
    </NavigationContainer>
  );
};

const DreamsScreen = ({ navigation }) => {
  const [dreams, setDreams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDreams();
  }, []);

  const fetchDreams = async () => {
    try {
      const response = await fetch(`${API_URL}/api/dreams`);
      if (response.ok) {
        const dreamsData = await response.json();
        setDreams(dreamsData);
      } else {
        Alert.alert('Error', 'Failed to fetch dreams.');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDreamSelection = (dreamId) => {
    navigation.navigate('Details', { dreamId });
  };

  const renderDreamItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleDreamSelection(item.id)}>
      <Card elevation={3} style={styles.dreamItem}>
        <Card.Content>
          <Title style={styles.dreamItemText}>{item.title}</Title>
          <Subheading style={styles.dreamItemDate}>{item.date}</Subheading>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator size="large" color="#00ADB5" style={styles.loadingIndicator} />
      ) : (
        <>
          {dreams.length > 0 ? (
            <FlatList
              data={dreams}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderDreamItem}
              style={styles.list}
              contentContainerStyle={{ paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyStateContainer}>
              <MaterialCommunityIcons name="emoticon-sad-outline" size={120} color="#FFFFFF" style={styles.emptyStateImage} />
              <Text style={styles.emptyStateText}>No dreams found</Text>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('New Dream')}
                style={styles.emptyStateButton}
                labelStyle={styles.generateButtonText}
              >
                Add New Dream
              </Button>
            </View>
          )}
        </>
      )}
    </View>
  );  
};

const RegenerateScreen = ({ route, navigation }) => {
  const { dreamId } = route.params;
  const [dream, setDream] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [imageData, setImageData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchDream();
    handleRegenerateDream();
  }, []);

  const fetchDream = async () => {
    try {
      const response = await fetch(`${API_URL}/api/dreams/${dreamId}`);
      if (response.ok) {
        const dreamData = await response.json();
        setDream(dreamData);
      } else {
        Alert.alert('Error', 'Failed to fetch dream details.');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    }
  };

  const fetchDreamAnalysis = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/dreams/${dreamId}/analysis`);
      if (response.ok) {
        const analysisResult = await response.text();
        setAnalysisResult(analysisResult);
      } else {
        Alert.alert('Error', 'Failed to fetch dream analysis.');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    }
    setIsLoading(false);
  };

  const fetchDreamImage = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/dreams/${dreamId}/image`);
      if (response.ok) {
        const imageData = await response.json();
        setImageData(imageData);
      } else {
        Alert.alert('Error', 'Failed to fetch dream image.');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    }
    setIsLoading(false);
  };

  const handleRegenerateDream = async () => {
    setIsLoading(true);
    try {
      await Promise.all([fetchDreamAnalysis(), fetchDreamImage()]);
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
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
          <Text style={styles.dreamTitle}>{dream.title}</Text>
          <Subheading style={styles.subLabel}>Dream Date</Subheading>
          <Text style={styles.dreamDate}>{dream.date}</Text>
          <Subheading style={styles.subLabel}>Dream Entry</Subheading>
          <Text style={styles.dreamEntry}>{dream.entry}</Text>
        </>
      )}
      {isLoading ? (
        <ActivityIndicator size="large" color="#00ADB5" style={styles.loadingIndicator} />
      ) : (
        <>
          {analysisResult === null || imageData === null ? (
            <Button
              mode="contained"
              onPress={handleRegenerateDream}
              style={styles.generateButton}
              labelStyle={styles.generateButtonText}
            >
              Generate
            </Button>
          ) : (
            <>
              <Subheading style={styles.analysisLabel}>Dream Analysis</Subheading>
              <Text style={styles.analysisResult}>{analysisResult}</Text>
              <View style={styles.imageContainer}>
                <Image source={{ uri: imageData.url }} style={styles.image} />
              </View>
              <Button
                mode="contained"
                onPress={handleOverwriteSave}
                style={styles.overwriteButton}
                labelStyle={styles.overwriteButtonText}
              >
                Overwrite Save
              </Button>
            </>
          )}
        </>
      )}
    </ScrollView>
  );
};

const DetailsScreen = ({ route, navigation }) => {
  const { dreamId } = route.params;
  const [dream, setDream] = useState(null);
  const [analysisResult, setAnalysisResult] = useState('');
  const [imageData, setImageData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchDream();
  }, []);

  const fetchDream = async () => {
    try {
      const response = await fetch(`${API_URL}/api/dreams/${dreamId}`);
      if (response.ok) {
        const dreamData = await response.json();
        setDream(dreamData);
        setAnalysisResult(dreamData.analysis);
        setImageData(dreamData.image);
      } else {
        Alert.alert('Error', 'Failed to fetch dream details.');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    }
  };

  const handleGenerateDream = async () => {
    setIsLoading(true);
    try {
      const [analysis, image] = await Promise.all([fetchDreamAnalysis(), fetchDreamImage()]);
      setAnalysisResult(analysis);
      setImageData(image);
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDreamAnalysis = async () => {
    try {
      const response = await fetch(`${API_URL}/api/dreams/${dreamId}/analysis`);
      if (response.ok) {
        const analysisResult = await response.text();
        return analysisResult;
      } else {
        Alert.alert('Error', 'Failed to fetch dream analysis.');
      }
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
        return imageData;
      } else {
        Alert.alert('Error', 'Failed to fetch dream image.');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
      throw error; // Throw the error so it can be caught in handleGenerateDream
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
    <ScrollView contentContainerStyle={styles.container}>
      {dream && (
        <>
          <Subheading style={styles.subLabel}>Dream Title</Subheading>
          <Text style={styles.dreamTitle}>{dream.title}</Text>
          <Subheading style={styles.subLabel}>Dream Date</Subheading>
          <Text style={styles.dreamDate}>{dream.date}</Text>
          <Subheading style={styles.subLabel}>Dream Entry</Subheading>
          <Text style={styles.dreamEntry}>{dream.entry}</Text>
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
              <Image source={{ uri: imageData.url }} style={styles.image} />
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
      const response = await fetch('${API_URL}/api/dreams', {
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
});

export default App;