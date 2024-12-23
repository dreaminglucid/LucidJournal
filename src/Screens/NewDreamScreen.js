import React, { useState, useContext, useRef, useEffect } from "react";
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
  View,
} from "react-native";
import Slider from '@react-native-community/slider';
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
  const [symbols, setSymbols] = useState("");
  const [characters, setCharacters] = useState("");
  const [emotions, setEmotions] = useState("");
  const [lucidity, setLucidity] = useState(1);
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AppleAuthContext);
  const navigation = useNavigation();
  const scrollViewRef = useRef();
  const inputAccessoryViewID = 'doneButton';
  const [symbolsArray, setSymbolsArray] = useState([]);
  const [charactersArray, setCharactersArray] = useState([]);
  const [emotionsArray, setEmotionsArray] = useState([]);
  const [showDetails, setShowDetails] = useState(false);
  const [setting, setSetting] = useState("");
  const [settingsArray, setSettingsArray] = useState([]);
  const [isFormSaved, setIsFormSaved] = useState(false);

  // New functions for adding tags
  const handleAddSymbol = () => {
    if (symbols.trim() !== "") {
      setSymbolsArray([...symbolsArray, symbols]);
      setSymbols("");
    }
  };

  const handleAddCharacter = () => {
    if (characters.trim() !== "") {
      setCharactersArray([...charactersArray, characters]);
      setCharacters("");
    }
  };

  const handleAddEmotion = () => {
    if (emotions.trim() !== "") {
      setEmotionsArray([...emotionsArray, emotions]);
      setEmotions("");
    }
  };

  const handleAddSetting = () => {
    if (setting.trim() !== "") {
      setSettingsArray([...settingsArray, setting]);
      setSetting("");
    }
  };

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

    const formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/dreams`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.id_token}`,
        },
        body: JSON.stringify({
          title,
          date: formattedDate,
          entry,
          symbols: JSON.stringify(symbolsArray),
          characters: JSON.stringify(charactersArray),
          emotions: JSON.stringify(emotionsArray),
          setting: JSON.stringify(settingsArray),
          lucidity,
          id_token: user.id_token,
        }),
      });

      if (response.ok) {
        Alert.alert("Success", "Dream saved successfully!");

        // Reset all the state variables related to the form.
        setTitle("");
        setDate(new Date());
        setEntry("");
        setSymbols("");
        setCharacters("");
        setEmotions("");
        setSetting("");
        setSymbolsArray([]);
        setCharactersArray([]);
        setEmotionsArray([]);
        setSettingsArray([]);
        setLucidity(1);

        // Set the form saved flag to true to prevent warning on navigation
        setIsFormSaved(true);

        navigation.goBack();
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

  const hasUnsavedChanges = () => {
    if (isFormSaved) return false; // Skip the check if the form has been saved

    return Boolean(
      title ||
      entry ||
      symbols ||
      characters ||
      emotions ||
      setting ||
      symbolsArray.length > 0 ||
      charactersArray.length > 0 ||
      emotionsArray.length > 0 ||
      settingsArray.length > 0
    );
  };

  // Adding useEffect to watch for navigation events
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (!hasUnsavedChanges()) {
        // If there are no unsaved changes or the form has been saved,
        // then we don't need to do anything.
        return;
      }

      // Prevent default behavior of leaving the screen
      e.preventDefault();

      // Prompt the user before leaving the screen
      Alert.alert(
        'Discard changes?',
        'You have unsaved changes. Are you sure to discard them and leave the screen?',
        [
          {
            text: "Don't leave", style: 'cancel', onPress: () => {
              // Reset the saved flag if the user decides not to leave
              setIsFormSaved(false);
            }
          },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => {
              navigation.dispatch(e.data.action);
              // Reset the saved flag if the user decides to discard changes and leave
              setIsFormSaved(false);
            }
          },
        ]
      );
    });

    return unsubscribe;
  }, [navigation, hasUnsavedChanges, setIsFormSaved]);

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
            value={`${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`}
            editable={false}
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
          placeholderTextColor={theme.colors.text}
        />

        {/* Button to toggle additional details */}
        <TouchableOpacity onPress={() => setShowDetails(!showDetails)}>
          <Text style={styles.detailsButton}>
            {showDetails ? "Hide Optional Details" : "Show Optional Details"}
          </Text>
        </TouchableOpacity>

        {/* Conditional rendering for additional details */}
        {showDetails && (
          <>
            {/* Symbols */}
            <Text style={styles.label}>Symbols</Text>
            <View style={styles.tagInputContainer}>
              <TextInput
                style={styles.input}
                value={symbols}
                onChangeText={setSymbols}
                placeholder="Enter symbol"
                placeholderTextColor={theme.colors.text}
              />
              <TouchableOpacity onPress={handleAddSymbol}>
                <Text style={styles.tagAddButton}>+</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.tagContainer}>
              {symbolsArray.map((sym, index) => (
                <View key={index} style={styles.tag}>
                  <Text>{sym}</Text>
                  <TouchableOpacity onPress={() => setSymbolsArray(symbolsArray.filter(item => item !== sym))}>
                    <Text style={styles.tagDeleteButton}>X</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* Characters */}
            <Text style={styles.label}>Characters</Text>
            <View style={styles.tagInputContainer}>
              <TextInput
                style={styles.input}
                value={characters}
                onChangeText={setCharacters}
                placeholder="Enter character"
                placeholderTextColor={theme.colors.text}
              />
              <TouchableOpacity onPress={handleAddCharacter}>
                <Text style={styles.tagAddButton}>+</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.tagContainer}>
              {charactersArray.map((char, index) => (
                <View key={index} style={styles.tag}>
                  <Text>{char}</Text>
                  <TouchableOpacity onPress={() => setCharactersArray(charactersArray.filter(item => item !== char))}>
                    <Text style={styles.tagDeleteButton}>X</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* Emotions */}
            <Text style={styles.label}>Emotions</Text>
            <View style={styles.tagInputContainer}>
              <TextInput
                style={styles.input}
                value={emotions}
                onChangeText={setEmotions}
                placeholder="Enter emotion"
                placeholderTextColor={theme.colors.text}
              />
              <TouchableOpacity onPress={handleAddEmotion}>
                <Text style={styles.tagAddButton}>+</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.tagContainer}>
              {emotionsArray.map((emo, index) => (
                <View key={index} style={styles.tag}>
                  <Text>{emo}</Text>
                  <TouchableOpacity onPress={() => setEmotionsArray(emotionsArray.filter(item => item !== emo))}>
                    <Text style={styles.tagDeleteButton}>X</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* Setting */}
            <Text style={styles.label}>Setting</Text>
            <View style={styles.tagInputContainer}>
              <TextInput
                style={styles.input}
                value={setting}
                onChangeText={setSetting}
                placeholder="Enter setting"
                placeholderTextColor={theme.colors.text}
              />
              <TouchableOpacity onPress={handleAddSetting}>
                <Text style={styles.tagAddButton}>+</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.tagContainer}>
              {settingsArray.map((set, index) => (
                <View key={index} style={styles.tag}>
                  <Text>{set}</Text>
                  <TouchableOpacity onPress={() => setSettingsArray(settingsArray.filter(item => item !== set))}>
                    <Text style={styles.tagDeleteButton}>X</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* Lucidity Level */}
            <Text style={styles.label}>Lucidity Level</Text>
            <View style={styles.lucidityContainer}>
              <Slider
                style={styles.luciditySlider}
                minimumValue={1}
                maximumValue={5}
                step={1}
                value={lucidity}
                onValueChange={(value) => setLucidity(value)}
              />
              <View style={styles.lucidityCounter}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <Text
                    key={n}
                    style={[
                      styles.lucidityLabel,
                      { color: n <= lucidity ? theme.colors.button : theme.colors.text }
                    ]}
                  >
                    {n}
                  </Text>
                ))}
              </View>
            </View>
          </>
        )}

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
  lucidityContainer: {
    flexDirection: 'column',
    alignItems: 'stretch',
    marginBottom: 20,
  },
  luciditySlider: {
    width: '100%',
    height: 40,
  },
  lucidityCounter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginTop: 8,
  },
  lucidityLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagAddButton: {
    marginLeft: 10,
    fontSize: 24,
    color: theme.colors.button,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eee',
    borderRadius: 20,
    margin: 5,
    padding: 8,
  },
  tagDeleteButton: {
    marginLeft: 8,
    fontSize: 16,
    color: 'red',
  },
  detailsButton: {
    fontSize: 18,
    color: theme.colors.button,
    textAlign: 'center',
    marginVertical: 10,
  },
});


export default NewDreamScreen;