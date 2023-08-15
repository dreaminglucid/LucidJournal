import React, { createContext, useState, useRef, useEffect, useContext } from 'react';
import { Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TimerContext = createContext();

export const TimerProvider = ({ children }) => {
    const [isTimerActive, setIsTimerActive] = useState(false);
    const notificationListener = useRef(null);

    const cancelAllScheduledNotifications = async () => {
        const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
        await Promise.all(scheduledNotifications.map(notification =>
            Notifications.cancelScheduledNotificationAsync(notification.identifier)
        ));
        if (notificationListener.current) {
            Notifications.removeNotificationSubscription(notificationListener.current);
            notificationListener.current = null;
        }
    };

    const scheduleRepeatingNotification = async (notificationContent, timeInterval, isRandom, awakeTime, sleepTime) => {
        const trigger = getNextTrigger(timeInterval, isRandom, awakeTime, sleepTime);
        const identifier = await Notifications.scheduleNotificationAsync({
            content: notificationContent,
            trigger,
        });
        await AsyncStorage.setItem('notificationIdentifier', identifier);
    };

    const toggleTimer = async (value, notificationContent, timeInterval, isRandom, awakeTime, sleepTime) => {
        await cancelAllScheduledNotifications();
        setIsTimerActive(value);

        if (value) {
            await scheduleRepeatingNotification(notificationContent, timeInterval, isRandom, awakeTime, sleepTime);

            // Reschedule on notification received
            if (notificationListener.current) {
                Notifications.removeNotificationSubscription(notificationListener.current);
            }
            notificationListener.current = Notifications.addNotificationResponseReceivedListener(
                () => scheduleRepeatingNotification(notificationContent, timeInterval, isRandom, awakeTime, sleepTime)
            );

            Alert.alert('Reality Check Timer Activated', 'You have successfully activated the reality check timer.');
        } else {
            Alert.alert('Reality Check Timer Deactivated', 'You have successfully deactivated the reality check timer.');
        }
    };


    // Helper function to calculate the next trigger time
    const getNextTrigger = (timeInterval, isRandom, awakeTime, sleepTime) => {
        const currentTime = new Date();
        let interval = isRandom ? Math.floor(Math.random() * (timeInterval - 5 + 1) + 5) : timeInterval;

        if (currentTime >= awakeTime && currentTime <= sleepTime) {
            return { seconds: interval * 60 };
        }

        let nextAwakeTime = new Date(awakeTime);
        if (nextAwakeTime < currentTime) {
            nextAwakeTime.setDate(nextAwakeTime.getDate() + 1);
        }
        return { date: nextAwakeTime };
    };

    // Load previous state
    useEffect(() => {
        const loadPreviousState = async () => {
            const savedIsActive = await AsyncStorage.getItem('isTimerActive');
            setIsTimerActive(savedIsActive === 'true');
        };
        loadPreviousState();
    }, []);

    // Save current state
    useEffect(() => {
        AsyncStorage.setItem('isTimerActive', isTimerActive.toString());
    }, [isTimerActive]);

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