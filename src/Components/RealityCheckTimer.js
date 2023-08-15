import React, { useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Animated,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ThemeContext } from '../Contexts/ThemeContext';
import { useTimer } from '../Contexts/TimerContext';
import Slider from '@react-native-community/slider';

const RealityCheckTimer = () => {
  const { theme } = useContext(ThemeContext);
  const { isTimerActive, toggleTimer } = useTimer();
  const styles = getStyles(theme);

  // Default times for awake and sleep
  const defaultAwakeTime = new Date();
  defaultAwakeTime.setHours(10, 0, 0, 0);
  const defaultSleepTime = new Date();
  defaultSleepTime.setHours(22, 0, 0, 0);

  const [timeInterval, setTimeInterval] = useState(60);
  const [isRandom, setIsRandom] = useState(false);
  const [notificationTitle, setNotificationTitle] = useState("Reality Check!");
  const [notificationBody, setNotificationBody] = useState("Perform a reality check to enhance lucid dreaming.");
  const [showTips, setShowTips] = useState(false);
  const tipsHeight = new Animated.Value(showTips ? 170 : 0);
  const [permissionStatus, setPermissionStatus] = useState(null);
  const [showAwakePicker, setShowAwakePicker] = useState(false);
  const [showSleepPicker, setShowSleepPicker] = useState(false);
  const [awakeTime, setAwakeTime] = useState(defaultAwakeTime);
  const [sleepTime, setSleepTime] = useState(defaultSleepTime);

  // Function to load saved settings
  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('realityCheckSettings');
      if (savedSettings) {
        const {
          timeInterval,
          isRandom,
          notificationTitle,
          notificationBody,
          awakeTime,
          sleepTime,
        } = JSON.parse(savedSettings);

        setTimeInterval(timeInterval);
        setIsRandom(isRandom);
        setNotificationTitle(notificationTitle);
        setNotificationBody(notificationBody);
        setAwakeTime(new Date(awakeTime));
        setSleepTime(new Date(sleepTime));
      }
    } catch (error) {
      console.error('Error loading saved settings:', error);
    }
  };

  // Function to save current settings
  const saveSettings = async () => {
    try {
      await AsyncStorage.setItem(
        'realityCheckSettings',
        JSON.stringify({
          timeInterval,
          isRandom,
          notificationTitle,
          notificationBody,
          awakeTime: awakeTime.toISOString(),
          sleepTime: sleepTime.toISOString(),
        })
      );
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      setPermissionStatus(status);
    })();
  }, []);

  const toggleTips = () => {
    Animated.timing(tipsHeight, {
      toValue: showTips ? 0 : 170,
      duration: 500,
      useNativeDriver: false,
    }).start();
    setShowTips(prev => !prev);
  };

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours} hours${remainingMinutes > 0 ? ` ${remainingMinutes} minutes` : ''}`;
  };

  const scheduleNotification = () => {
    saveSettings(); // Save current settings when scheduling notification
    toggleTimer(true, { title: notificationTitle, body: notificationBody }, timeInterval, isRandom, awakeTime, sleepTime);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>
          <MaterialCommunityIcons name="brain" size={22} color={theme.colors.text} />
          {' '}Why Reality Checks?
        </Text>
        <Text style={styles.text}>
          Reality checks are powerful tools for lucid dreaming. They help train your mind to recognize when you're dreaming, allowing you to become conscious within your dreams.
        </Text>
        <TouchableOpacity onPress={toggleTips} style={styles.tipsButton}>
          <Text style={styles.tipsButtonText}>Tips {showTips ? '-' : '+'}</Text>
        </TouchableOpacity>
        <Animated.View style={[styles.tipsContainer, { height: tipsHeight }]}>
          <Text style={styles.tipText}>- Perform reality checks regularly throughout the day.</Text>
          <Text style={styles.tipText}>- Combine different methods, such as examining your hands or trying to push a finger through your palm.</Text>
          <Text style={styles.tipText}>- Be mindful and question your surroundings, even when you're sure you're awake.</Text>
        </Animated.View>
      </View>
      <View style={styles.card}>
        <Text style={styles.title}>
          <MaterialCommunityIcons name="pencil-outline" size={22} color={theme.colors.text} />
          {' '}Edit Notification
        </Text>
        <TextInput
          style={styles.input}
          value={notificationTitle}
          onChangeText={setNotificationTitle}
          placeholder="Title"
          placeholderTextColor={theme.colors.text}
        />
        <TextInput
          style={styles.input}
          value={notificationBody}
          onChangeText={setNotificationBody}
          placeholder="Body"
          placeholderTextColor={theme.colors.text}
          multiline
        />
        <View style={styles.notificationPreview}>
          <MaterialCommunityIcons name="bell-outline" size={22} color={theme.colors.text} />
          <Text style={styles.notificationTitle}>{notificationTitle}</Text>
          <Text style={styles.notificationBody}>{notificationBody}</Text>
        </View>
      </View>
      <View style={styles.card}>
        <Text style={styles.title}>
          <MaterialCommunityIcons name="timer-sand" size={22} color={theme.colors.text} />
          {' '}Set Reality Check Timer
        </Text>
        <Slider
          value={timeInterval}
          onValueChange={setTimeInterval}
          minimumValue={5}
          maximumValue={360}
          step={5}
          style={styles.slider}
          disabled={isRandom}
        />
        <View style={styles.sliderLabels}>
          <Text style={styles.sliderLabel}>5 minutes</Text>
          <Text style={styles.sliderLabel}>6 hours</Text>
        </View>
        <Text style={styles.text}>{formatTime(timeInterval)}</Text>
        <View style={styles.randomContainer}>
          <Text style={styles.randomText}>Random:</Text>
          <Switch
            value={isRandom}
            onValueChange={() => setIsRandom(!isRandom)}
            thumbColor={theme.colors.button}
            trackColor={{ false: '#f0f0f0', true: theme.colors.button }}
          />
        </View>
      </View>
      <View style={styles.card}>
        <View style={styles.timeContainer}>
          <View style={styles.timeSection}>
            <Text style={styles.title}>
              <MaterialCommunityIcons name="alarm" size={22} color={theme.colors.text} />
              {' '}Awake
            </Text>
            <TouchableOpacity onPress={() => setShowAwakePicker(true)} style={styles.timeButton}>
              <Text style={styles.timeText}>{awakeTime.toLocaleTimeString()}</Text>
            </TouchableOpacity>
            {showAwakePicker && (
              <DateTimePicker
                value={awakeTime}
                mode="time"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowAwakePicker(false);
                  if (selectedDate) setAwakeTime(selectedDate);
                }}
              />
            )}
          </View>
          <View style={styles.timeDivider} />
          <View style={styles.timeSection}>
            <Text style={styles.title}>
              <MaterialCommunityIcons name="bed-empty" size={22} color={theme.colors.text} />
              {' '}Sleep
            </Text>
            <TouchableOpacity onPress={() => setShowSleepPicker(true)} style={styles.timeButton}>
              <Text style={styles.timeText}>{sleepTime.toLocaleTimeString()}</Text>
            </TouchableOpacity>
            {showSleepPicker && (
              <DateTimePicker
                value={sleepTime}
                mode="time"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowSleepPicker(false);
                  if (selectedDate) setSleepTime(selectedDate);
                }}
              />
            )}
          </View>
        </View>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.saveButton} onPress={scheduleNotification}>
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
    borderRadius: 15,
    backgroundColor: theme.colors.card,
    padding: 25,
    margin: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    flexDirection: 'row',
    alignItems: 'center',
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 15,
    color: theme.colors.text,
  },
  text: {
    fontSize: 18,
    lineHeight: 24,
    color: theme.colors.text,
    marginBottom: 15,
  },
  slider: {
    marginBottom: 20,
  },
  randomContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  randomText: {
    fontSize: 18,
    color: theme.colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.text,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
    color: theme.colors.text,
    backgroundColor: theme.colors.background,
  },
  tipsButton: {
    alignItems: 'flex-end',
  },
  tipsButtonText: {
    color: theme.colors.button,
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  tipsContainer: {
    overflow: 'hidden',
    marginVertical: 10,
  },
  tipText: {
    fontSize: 16,
    marginBottom: 5,
    color: theme.colors.text,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderLabel: {
    fontSize: 14,
    color: theme.colors.text,
  },
  notificationPreview: {
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.text,
    marginTop: 10,
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  notificationBody: {
    fontSize: 16,
    color: theme.colors.text,
  },
  buttonContainer: {
    padding: 25,
  },
  saveButton: {
    backgroundColor: theme.colors.button,
    padding: 18,
    borderRadius: 22,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.background,
    textAlign: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  timeSection: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
  },
  timeDivider: {
    width: 1,
    backgroundColor: theme.colors.text,
    opacity: 0.1,
    height: '80%',
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.text,
    marginTop: 10,
  },
  timeText: {
    fontSize: 18,
    color: theme.colors.text,
    marginBottom: 15,
  },
});

export default RealityCheckTimer;