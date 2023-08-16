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
        // Check if the alarm time is in the past, and add a day if so
        if (alarmTime <= Date.now()) {
          alarmTime.setDate(alarmTime.getDate() + 1);
        }
      
        // Set the trigger to repeat daily at the specified time
        const trigger = {
          hour: alarmTime.getHours(),
          minute: alarmTime.getMinutes(),
          repeats: true, // Repeat every day
        };
      
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Wake Back to Bed Alarm',
            body: 'Time for a quick awakening to enhance lucid dreaming!',
            autoDismiss: true,
            sound: 'electronic-alarm-clock.mp3',
          },
          trigger,
        });
      };      

    const toggleAlarm = async (value, alarmTime) => {
        await cancelAlarm();
        setIsAlarmActive(value);

        if (value) {
            await scheduleAlarm(alarmTime);
            Alert.alert('Alarm Set', 'Your Wake Back to Bed Alarm has been scheduled successfully.');
        } else {
            Alert.alert('Alarm Cancelled', 'Your Wake Back to Bed Alarm has been cancelled.');
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