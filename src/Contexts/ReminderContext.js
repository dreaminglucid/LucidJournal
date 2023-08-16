import React, { createContext, useState, useEffect, useContext } from 'react';
import { Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ReminderContext = createContext();

export const ReminderProvider = ({ children }) => {
  const [isReminderActive, setIsReminderActive] = useState(false);

  const cancelScheduledReminder = async () => {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    await Promise.all(scheduledNotifications.map(notification =>
      Notifications.cancelScheduledNotificationAsync(notification.identifier)
    ));
  };

  const scheduleReminder = async (reminderTime) => {
    if (reminderTime <= Date.now()) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    }

    const trigger = {
      hour: reminderTime.getHours(),
      minute: reminderTime.getMinutes(),
      repeats: true,
    };

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Dream Journal Reminder',
        body: 'Time to write in your dream journal!',
        sound: 'default',
      },
      trigger,
    });
  };

  const toggleReminder = async (value, reminderTime) => {
    await cancelScheduledReminder();
    setIsReminderActive(value);
  
    if (value) {
      await scheduleReminder(reminderTime);
      Alert.alert('Dream Journal Reminder Activated', 'Your reminder has been set.');
    } else {
      Alert.alert('Dream Journal Reminder Deactivated', 'Your reminder has been canceled.');
    }
  };

  // Load previous state
  useEffect(() => {
    const loadPreviousState = async () => {
      const savedIsActive = await AsyncStorage.getItem('isReminderActive');
      setIsReminderActive(savedIsActive === 'true');
    };
    loadPreviousState();
  }, []);

  // Save current state
  useEffect(() => {
    AsyncStorage.setItem('isReminderActive', isReminderActive.toString());
  }, [isReminderActive]);

  return (
    <ReminderContext.Provider value={{ isReminderActive, toggleReminder }}>
      {children}
    </ReminderContext.Provider>
  );
};

export const useReminder = () => {
  const context = useContext(ReminderContext);
  if (context === undefined) {
    throw new Error('useReminder must be used within a ReminderProvider');
  }
  return context;
};