import React, { useState, useEffect, useContext } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Slider,
  Switch,
  StyleSheet,
  Alert,
  Animated,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { ThemeContext } from '../Contexts/ThemeContext';
import { useTimer } from '../Contexts/TimerContext';

const RealityCheckTimer = () => {
  const { theme } = useContext(ThemeContext);
  const { isTimerActive, toggleTimer } = useTimer();
  const styles = getStyles(theme);
  const [timeInterval, setTimeInterval] = useState(60);
  const [isRandom, setIsRandom] = useState(false);
  const [notificationTitle, setNotificationTitle] = useState("Reality Check!");
  const [notificationBody, setNotificationBody] = useState("Perform a reality check to enhance lucid dreaming.");
  const [showTips, setShowTips] = useState(false);
  const tipsHeight = new Animated.Value(0);
  const [permissionStatus, setPermissionStatus] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      setPermissionStatus(status);
    })();
  }, []);

  const toggleTips = () => {
    Animated.timing(tipsHeight, {
      toValue: showTips ? 0 : 150,
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
    toggleTimer(true, { title: notificationTitle, body: notificationBody }, timeInterval, isRandom);
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
        <TouchableOpacity onPress={() => setShowTips(prev => !prev)} style={styles.tipsButton}>
          <Text style={styles.tipsButtonText}>Tips {showTips ? '-' : '+'}</Text>
        </TouchableOpacity>
        {showTips && ( // Conditional rendering of the tips section
          <View style={styles.tipsContainer}>
            <Text style={styles.tipText}>- Perform reality checks regularly throughout the day.</Text>
            <Text style={styles.tipText}>- Combine different methods, such as examining your hands or trying to push a finger through your palm.</Text>
            <Text style={styles.tipText}>- Be mindful and question your surroundings, even when you're sure you're awake.</Text>
          </View>
        )}
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
          minimumValue={1}
          maximumValue={1440}
          step={5}
          style={styles.slider}
          disabled={isRandom}
        />
        <View style={styles.sliderLabels}>
          <Text style={styles.sliderLabel}>5 minutes</Text>
          <Text style={styles.sliderLabel}>24 hours</Text>
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
    borderRadius: 10,
    backgroundColor: theme.colors.card,
    padding: 20,
    margin: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: theme.colors.text,
  },
  text: {
    fontSize: 18,
    color: theme.colors.text,
    marginBottom: 10,
  },
  slider: {
    marginBottom: 10,
  },
  randomContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  randomText: {
    fontSize: 18,
    color: theme.colors.text,
  },
  timerSwitchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  timerSwitchLabel: {
    fontSize: 18,
    color: theme.colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.text,
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    marginBottom: 10,
    color: theme.colors.text,
    backgroundColor: theme.colors.background,
  },
  tipsButton: {
    alignItems: 'flex-end',
  },
  tipsButtonText: {
    color: theme.colors.button,
    textDecorationLine: 'underline',
  },
  tipsContainer: {
    overflow: 'hidden',
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
    fontSize: 12,
    color: theme.colors.text,
  },
  notificationPreview: {
    padding: 10,
    borderRadius: 5,
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
    padding: 20,
  },
  saveButton: {
    backgroundColor: theme.colors.button,
    padding: 15,
    borderRadius: 5,
    margin: 20,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: theme.colors.background,
    textAlign: 'center',
  },
});

export default RealityCheckTimer;
