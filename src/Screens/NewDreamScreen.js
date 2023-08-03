import React, { useState, useContext, useRef } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { Button } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { ThemeContext } from '../Contexts/ThemeContext';
import { AppleAuthContext } from '../Contexts/AppleAuthContext';
import { API_URL } from "../../config";
import { useNavigation } from '@react-navigation/native';

const NewDreamScreen = () => {
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [entry, setEntry] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AppleAuthContext);
  const navigation = useNavigation();
  const scrollViewRef = useRef();

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
        body: JSON.stringify({ title, date: formattedDate, entry, id_token: user.id_token }),
      });

      if (response.ok) {
        Alert.alert("Success", "Dream saved successfully!");

        // After saving the dream, navigate back to the DreamScreen
        navigation.navigate('App', { screen: 'Dreams' });

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

  const handleEntryChange = (text) => {
    setEntry(text);
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 122 : 20}
      style={{ flex: 1 }}
    >
      <ScrollView 
        contentContainerStyle={styles.container}
        ref={scrollViewRef}
      >
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
          onChangeText={handleEntryChange}
          multiline
          placeholder="Write your dream here"
          placeholderTextColor="#888"
        />
        {loading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Button
            mode="contained"
            onPress={handleSaveDream}
            style={styles.saveButton}
            labelStyle={styles.saveButtonText}
          >
            "Save Dream"
          </Button>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: theme.colors.background,
  },
  label: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#00ADB5",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.card,
    borderRadius: 20,
    padding: 10,
    paddingTop: 10,
    paddingBottom: 10,
    marginBottom: 20,
    color: theme.colors.text,
    backgroundColor: theme.colors.inputBackground,
    fontSize: 18,
  },
  tallerInput: {
    height: 270,
  },
  datePicker: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.card,
    borderRadius: 20,
    padding: 10,
    paddingTop: 10,
    paddingBottom: 10,
    marginBottom: 20,
    backgroundColor: theme.colors.background,
  },
  dateText: {
    color: theme.colors.text,
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
  saveButton: {
    marginBottom: 15,
    ...this.buttonStyle,
    backgroundColor: "#00ADB5",
    width: "100%",
  },
  saveButtonText: {
    ...this.buttonTextStyle,
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


export default NewDreamScreen;