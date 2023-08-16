import React, { useState, useEffect, useContext } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemeContext } from '../Contexts/ThemeContext';
import { useWBTBAlarm } from '../Contexts/WBTBAlarmContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WBTBAlarm = () => {
  const { theme } = useContext(ThemeContext);
  const { toggleAlarm } = useWBTBAlarm();
  const styles = getStyles(theme);

  const defaultAlarmTime = new Date();
  defaultAlarmTime.setHours(4, 30, 0, 0);

  const [alarmTime, setAlarmTime] = useState(defaultAlarmTime);
  const [showAlarmPicker, setShowAlarmPicker] = useState(false);

  // Function to load saved settings
  const loadSettings = async () => {
    try {
      const savedTime = await AsyncStorage.getItem('alarmTime');
      if (savedTime) {
        setAlarmTime(new Date(savedTime));
      }
    } catch (error) {
      console.error('Error loading saved settings:', error);
    }
  };

  // Function to save current settings
  const saveSettings = async () => {
    try {
      await AsyncStorage.setItem('alarmTime', alarmTime.toISOString());
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  const scheduleAlarm = () => {
    // Save the current settings
    saveSettings();

    // Use the context to toggle the alarm
    toggleAlarm(true, alarmTime);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>
          <MaterialCommunityIcons name="alarm" size={22} color={theme.colors.text} />
          {' '}Set Wake Back to Bed Alarm
        </Text>
        <TouchableOpacity onPress={() => setShowAlarmPicker(true)} style={styles.timeButton}>
          <Text style={styles.timeText}>{alarmTime.toLocaleTimeString()}</Text>
        </TouchableOpacity>
        {showAlarmPicker && (
          <DateTimePicker
            value={alarmTime}
            mode="time"
            display="default"
            onChange={(event, selectedDate) => {
              setShowAlarmPicker(false);
              if (selectedDate) setAlarmTime(selectedDate);
            }}
          />
        )}
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.saveButton} onPress={scheduleAlarm}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  card: {
    backgroundColor: theme.colors.card,
    margin: 15,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 10,
  },
  timeButton: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
  },
  timeText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  buttonContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  saveButton: {
    backgroundColor: theme.colors.button,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.buttonText,
  },
});

export default WBTBAlarm;
