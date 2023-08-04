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
  Platform,
  Button,
  InputAccessoryView,
  View
} from "react-native";
import { Button as PaperButton } from "react-native-paper";
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
  const inputAccessoryViewID = 'doneButton';

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
        navigation.goBack(); // Navigate back to the previous screen
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

  const handleEntryFocus = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 20}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        ref={scrollViewRef}
        onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}
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
          />
          <MaterialCommunityIcons
            style={styles.dateIcon}
            name="calendar-blank"
            size={24}
          />
        </TouchableOpacity>
        {showDatePicker && (
          <View style={styles.datePickerContainer}>
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
          </View>
        )}
        <Text style={styles.label}>Dream Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter dream title"
          placeholderTextColor={theme.colors.text}
        />
        <Text style={styles.label}>Dream Entry</Text>
        <TextInput
          style={[styles.input, styles.tallerInput]}
          value={entry}
          onChangeText={setEntry}
          multiline
          placeholder="Write your dream here"
          placeholderTextColor={theme.colors.text}
          returnKeyType="default"
          onFocus={handleEntryFocus}
          inputAccessoryViewID={inputAccessoryViewID}
        />
        <InputAccessoryView nativeID={inputAccessoryViewID}>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
            <Button title="Done" onPress={() => setEntry(entry + '\n')} />
          </View>
        </InputAccessoryView>
        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.button} />
        ) : (
          <PaperButton
            mode="contained"
            onPress={handleSaveDream}
            style={[styles.saveButton, { backgroundColor: theme.colors.button }]}
            labelStyle={styles.saveButtonText}
          >
            Save Dream
          </PaperButton>
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
    color: theme.colors.button,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.text,
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
    borderColor: theme.colors.text,
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
  datePickerContainer: {
    borderColor: '#fff',
    borderWidth: 0.1,
    borderRadius: 10,
    marginBottom: 20,
    marginStart: 231.5,
    backgroundColor: theme.themeName === 'light' ? 'transparent' : theme.colors.text,
  },
  dateIcon: {
    color: "#888",
  },
  dreamEntry: {
    fontSize: 18,
    marginBottom: 10,
    color: theme.colors.text,
  },
  saveButton: {
    marginBottom: 15,
    borderRadius: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 6,
    width: "100%",
  },
  saveButtonText: {
    color: theme.colors.background,
    fontWeight: "bold",
    fontSize: 18,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 18,
    marginBottom: 25,
    color: theme.colors.text,
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