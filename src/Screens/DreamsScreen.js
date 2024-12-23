// React and React Native Libraries
import React, { useState, useRef, useEffect, useContext } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Alert,
  Image,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";

// UI Component Libraries
import { FAB, Provider } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as FileSystem from 'expo-file-system';

// Other Libraries
import { useDebounce } from "use-debounce";
import { ThemeContext } from '../Contexts/ThemeContext';
import * as SecureStore from 'expo-secure-store';

// Application Specific Imports
import { API_URL } from "../../config";

const DreamsScreen = ({ navigation }) => {
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);
  const [dreams, setDreams] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText] = useDebounce(searchText, 500);
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isInitialRender, setIsInitialRender] = useState(true);
  const [isNavigatingToDream, setIsNavigatingToDream] = useState(false);

  useEffect(() => {
    fetchDreams();
  }, []);

  useEffect(() => {
    if (debouncedSearchText && !isInitialRender) {
      handleSearch();
    }
    if (isInitialRender) {
      setIsInitialRender(false);
    }
  }, [debouncedSearchText]);

  const fetchDreams = async () => {
    setIsRefreshing(true);
    const userJson = await SecureStore.getItemAsync('appleUser');
    const user = JSON.parse(userJson);
    try {
      const response = await fetch(`${API_URL}/api/dreams`, {
        headers: {
          'Authorization': `Bearer ${user.id_token}`
        }
      });
      if (response.ok) {
        let dreamsData = await response.json();
  
        // Sort the dreams by date in descending order (most recent first)
        dreamsData.sort((a, b) => {
          const dateA = a.metadata.date.split('/').reverse().join('-');
          const dateB = b.metadata.date.split('/').reverse().join('-');
          return new Date(dateB) - new Date(dateA);
        });
  
        // Fetch local URIs
        for (const dream of dreamsData) {
          const localURI = await fetchLocalImageURI(dream.id);
          if (localURI) {
            dream.localImageURI = localURI;
          }
        }
  
        setDreams(dreamsData);
      } else {
        Alert.alert("Error", "Failed to fetch dreams.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch dreams.");
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  };
  
  const fetchLocalImageURI = async (dreamId) => {
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

  const handleDreamSelection = async (dreamId) => {
    setIsNavigatingToDream(true);  // Add this line
    setIsLoading(true);
    const userJson = await SecureStore.getItemAsync('appleUser');
    const user = JSON.parse(userJson);
    const response = await fetch(`${API_URL}/api/dreams/${dreamId}`, {
      headers: {
        'Authorization': `Bearer ${user.id_token}`,
      },
    });
    if (response.ok) {
      const dreamData = await response.json();
      navigation.navigate("Details", { dreamId, dreamData });
    } else {
      Alert.alert("Error", "Failed to fetch dream details.");
    }
    setIsLoading(false);
    setIsNavigatingToDream(false);  // Add this line
  };

  const handleSearch = async () => {
    if (searchText.trim() === "") {
      Alert.alert("Warning", "Please enter a search term.");
      return;
    }

    setIsLoading(true);
    const userJson = await SecureStore.getItemAsync('appleUser');
    const user = JSON.parse(userJson);
    const response = await fetch(`${API_URL}/api/dreams/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${user.id_token}`
      },
      body: JSON.stringify({ query: searchText }),
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
    const imageURI = item.localImageURI || item.image; // Use local image if available, else use image from the server
    return (
      <View style={styles.dreamItemContainer}>
        <TouchableOpacity
          style={styles.dreamContent}
          onPress={() => handleDreamSelection(item.id)}
        >
          {imageURI && (
            <Image
              source={{ uri: imageURI }}
              style={styles.dreamItemImage}
              resizeMode="cover"
            />
          )}
          <View style={styles.dreamTextContent}>
            <Text style={styles.dreamItemText}>{item.metadata.title}</Text>
            <Text style={styles.dreamItemDate}>{item.metadata.date}</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };  

  const renderEmptyComponent = () => {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name="alert-circle-outline" size={50} color={theme.colors.button} />
        <Text style={styles.emptyText}>No dreams found. Tap on '+' to create a new dream.</Text>
      </View>
    );
  };

  return (
    <Provider>
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <View style={styles.container}>
          {!isNavigatingToDream && (
            <View
              style={[
                styles.searchBar,
                { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
              ]}
            >
              {!isInputFocused && searchText.length === 0 && <MaterialCommunityIcons name="magnify" color={theme.colors.button} size={22} style={styles.searchIcon} />}
              <TextInput
                style={styles.input}
                value={searchText}
                onChangeText={(text) => setSearchText(text)}
                placeholder="Search for dreams"
                placeholderTextColor={theme.colors.text}
                onSubmitEditing={handleSearch}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
              />
              {searchText.length > 0 && (
                <TouchableOpacity
                  onPress={handleClearSearch}
                  style={styles.clearButton}
                >
                  <MaterialCommunityIcons
                    name="close-circle"
                    color={theme.colors.button}
                    size={26}
                  />
                </TouchableOpacity>
              )}
            </View>
          )}
          {isLoading ? (
            <ActivityIndicator size="large" color={theme.colors.button} />
          ) : (
            <FlatList
              data={searchResults.length > 0 ? searchResults : dreams}
              keyExtractor={(item) => (item && item.id ? item.id.toString() : "")}
              renderItem={renderDreamItem}
              style={styles.list}
              contentContainerStyle={{ paddingBottom: 80 }}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={fetchDreams}
                  colors={[theme.colors.button]}
                  tintColor={theme.colors.button}
                />
              }
              ListEmptyComponent={renderEmptyComponent}
            />
          )}
        </View>
        <FAB
          style={{
            position: "absolute",
            margin: 16,
            right: 16,
            bottom: 0,
            backgroundColor: theme.colors.button,
            elevation: 10,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.5,
            shadowRadius: 5,
            borderRadius: 33,
          }}
          icon={() => (
            <MaterialCommunityIcons name="plus" color={theme.colors.background} size={26} />
          )}
          onPress={navigateToNewDream}
        />
      </View>
    </Provider>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: theme.colors.background,
  },
  input: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: theme.colors.text,
    borderRadius: 20,
    padding: 10,
    marginBottom: 10,
    color: theme.colors.text,
    backgroundColor: theme.colors.background,
    fontSize: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.33,
    shadowRadius: 3,
    elevation: 6,
  },
  dreamItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 22,
    overflow: 'hidden',
  },
  dreamItemContainer: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  dreamContent: {
    borderRadius: 22,
    overflow: 'hidden',
    height: 120,
    position: 'relative',
  },
  touchableArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  dreamItemImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  dreamTextContent: {
    position: 'absolute',
    left: 10,
    bottom: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 5,
  },
  dreamItemText: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.text,
  },
  dreamItemDate: {
    color: theme.colors.text,
    fontSize: 13,
  },
  list: {
    marginBottom: 30,
  },
  loadingIndicator: {
    justifyContent: "center",
    height: "90%",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 0,
    borderRadius: 20,
    padding: 0,
    marginLeft: 20,
    marginRight: 20,
  },
  searchIcon: {
    position: "absolute",
    right: 10,
    height: 30,
    zIndex: 1,
  },
  clearButton: {
    position: "absolute",
    right: 10,
    backgroundColor: "transparent",
    width: 30,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    top: "50%",
    transform: [{ translateY: -25 }],
  },
  loadingIndicator: {
    justifyContent: "center",
    height: "90%",
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
    color: theme.colors.text,
    fontSize: 18,
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
  emptyContainer: {
    height: '333%',
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 18,
    color: '#888',
    textAlign: 'center',
  },
});

export default DreamsScreen;