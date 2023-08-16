import React, { createContext, useState, useEffect, useContext } from 'react';
import * as Notifications from 'expo-notifications';
import { Alert } from 'react-native';

const WBTBAlarmContext = createContext();

export const WBTBAlarmProvider = ({ children }) => {
  const [isAlarmActive, setIsAlarmActive] = useState(false);

  const cancelAlarm = async () => {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    await Promise.all(scheduledNotifications.map(notification =>
      Notifications.cancelScheduledNotificationAsync(notification.identifier)
    ));
  };

  const scheduleAlarm = async (alarmTime) => {
    const currentTime = new Date();

    // If the alarm time is in the past on the current day, schedule it for the next day
    if (alarmTime <= currentTime) {
      alarmTime.setDate(alarmTime.getDate() + 1);
    }

    const trigger = { date: alarmTime };
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Wake Back to Bed Alarm',
        body: 'Time for a quick awakening to enhance lucid dreaming!',
        autoDismiss: true, // Automatically dismiss the notification
      },
      trigger,
    });

    // Alert the user that the alarm has been set
    Alert.alert('Alarm Set', 'Your Wake Back to Bed Alarm has been scheduled successfully.');
  };

  const toggleAlarm = async (value, alarmTime) => {
    await cancelAlarm();
    setIsAlarmActive(value);

    if (value) {
      await scheduleAlarm(alarmTime);
    } else {
      Alert.alert('Wake Back to Bed Alarm Deactivated', 'Your alarm has been canceled.');
    }
  };

  return (
    <WBTBAlarmContext.Provider value={{ isAlarmActive, toggleAlarm }}>
      {children}
    </WBTBAlarmContext.Provider>
  );
};

export const useWBTBAlarm = () => {
  const context = useContext(WBTBAlarmContext);
  if (context === undefined) {
    throw new Error('useWBTBAlarm must be used within a WBTBAlarmProvider');
  }
  return context;
};