// React and React Native Libraries
import React, { useState, useRef, useEffect } from "react";
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
import { FAB } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// Other Libraries
import { useDebounce } from "use-debounce";
// Application Specific Imports
import API_URL from "../config";


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


const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
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
  },
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
});

export default DreamsScreen;