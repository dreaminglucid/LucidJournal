import React, { createContext, useState, useContext } from 'react';
import { Alert } from 'react-native';
import * as Notifications from 'expo-notifications';

const TimerContext = createContext();

export const TimerProvider = ({ children }) => {
  const [isTimerActive, setIsTimerActive] = useState(false);

  const cancelAllScheduledNotifications = async () => {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    await Promise.all(scheduledNotifications.map(notification => 
      Notifications.cancelScheduledNotificationAsync(notification.identifier)
    ));
  };

  const toggleTimer = async (value, notificationContent, timeInterval, isRandom) => {
    await cancelAllScheduledNotifications(); // Cancel all scheduled notifications

    setIsTimerActive(value);

    if (value) {
      // Schedule notifications
      let interval = isRandom ? Math.floor(Math.random() * (timeInterval - 5 + 1) + 5) : timeInterval;

      await Notifications.scheduleNotificationAsync({
        content: notificationContent,
        trigger: { seconds: interval * 60, repeats: true },
      });

      Alert.alert('Reality Check Timer set successfully.');
    } else {
      Alert.alert('Reality Check Timer canceled.');
    }
  };

  return (
    <TimerContext.Provider value={{ isTimerActive, toggleTimer }}>
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};