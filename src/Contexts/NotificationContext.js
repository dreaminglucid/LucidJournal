import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

const WBTB_ALARM_IDENTIFIER = 'WBTB_ALARM_IDENTIFIER';
const REMINDER_IDENTIFIER = 'REMINDER_IDENTIFIER';
const TIMER_IDENTIFIER = 'TIMER_IDENTIFIER';

const WBTBAlarmContext = createContext();

export const WBTBAlarmProvider = ({ children }) => {
    const [isAlarmActive, setIsAlarmActive] = useState(false);

    const cancelAlarm = async () => {
        await Notifications.cancelScheduledNotificationAsync(WBTB_ALARM_IDENTIFIER);
    };

    const scheduleAlarm = async (alarmTime) => {
        if (alarmTime <= Date.now()) {
            alarmTime.setDate(alarmTime.getDate() + 1);
        }

        const trigger = {
            hour: alarmTime.getHours(),
            minute: alarmTime.getMinutes(),
            repeats: true,
        };

        await Notifications.scheduleNotificationAsync({
            identifier: WBTB_ALARM_IDENTIFIER,
            content: {
                title: 'Wake Back to Bed Alarm',
                body: 'Time for a quick awakening to enhance lucid dreaming!',
                autoDismiss: true,
                sound: 'default',
            },
            trigger,
        });
    };

    const toggleAlarm = async (value, alarmTime) => {
        await cancelAlarm();
        setIsAlarmActive(value);

        // Save the state to AsyncStorage immediately after updating
        await AsyncStorage.setItem('isAlarmActive', value.toString());

        if (value) {
            await scheduleAlarm(alarmTime);
            Alert.alert('Alarm Set', 'Your Wake Back to Bed Alarm has been scheduled successfully.');
        } else {
            Alert.alert('Alarm Cancelled', 'Your Wake Back to Bed Alarm has been cancelled.');
        }
    };

    useEffect(() => {
        (async () => { // Use an immediately-invoked async function
            try {
                const savedIsActive = await AsyncStorage.getItem('isAlarmActive');
                setIsAlarmActive(savedIsActive === 'true');
            } catch (error) {
                console.error("Error loading isAlarmActive from AsyncStorage:", error);
            }
        })();
    }, []);

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

const TimerContext = createContext();

export const TimerProvider = ({ children }) => {
    const [isTimerActive, setIsTimerActive] = useState(false);
    const notificationListener = useRef(null);

    const cancelScheduledNotification = async () => {
        await Notifications.cancelScheduledNotificationAsync(TIMER_IDENTIFIER);
    };

    const getNextTrigger = (timeInterval, isRandom, awakeTime, sleepTime) => {
        const currentTime = new Date();
        let interval = isRandom ? Math.floor(Math.random() * (timeInterval - 5 + 1) + 5) : timeInterval;

        awakeTime.setFullYear(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate());
        sleepTime.setFullYear(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate());

        if (sleepTime < awakeTime) {
            sleepTime.setDate(sleepTime.getDate() + 1);
        }

        if (currentTime >= awakeTime && currentTime <= sleepTime) {
            return { seconds: interval * 60 };
        } else if (currentTime < awakeTime) {
            return { date: awakeTime };
        } else {
            awakeTime.setDate(awakeTime.getDate() + 1);
            return { date: awakeTime };
        }
    };

    const scheduleRepeatingNotification = async (notificationContent, timeInterval, isRandom, awakeTime, sleepTime) => {
        const trigger = getNextTrigger(timeInterval, isRandom, awakeTime, sleepTime);
        await Notifications.scheduleNotificationAsync({
            identifier: TIMER_IDENTIFIER,
            content: notificationContent,
            trigger,
        });

        if (!notificationListener.current) {
            notificationListener.current = Notifications.addNotificationReceivedListener(() => {
                scheduleRepeatingNotification(notificationContent, timeInterval, isRandom, awakeTime, sleepTime);
            });
        }
    };

    const toggleTimer = async (value, notificationContent, timeInterval, isRandom, awakeTime, sleepTime) => {
        await cancelScheduledNotification();
        setIsTimerActive(value);

        if (value) {
            await scheduleRepeatingNotification(notificationContent, timeInterval, isRandom, awakeTime, sleepTime);
            Alert.alert('Reality Check Timer Activated', 'You have successfully activated the reality check timer.');
        } else {
            Alert.alert('Reality Check Timer Deactivated', 'You have successfully deactivated the reality check timer.');
        }
    };

    useEffect(() => {
        const loadPreviousState = async () => {
            const savedIsActive = await AsyncStorage.getItem('isTimerActive');
            setIsTimerActive(savedIsActive === 'true');
        };
        loadPreviousState();
    }, []);

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

const ReminderContext = createContext();

export const ReminderProvider = ({ children }) => {
    const [isReminderActive, setIsReminderActive] = useState(false);

    const cancelScheduledReminder = async () => {
        await Notifications.cancelScheduledNotificationAsync(REMINDER_IDENTIFIER);
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
            identifier: REMINDER_IDENTIFIER,
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

    useEffect(() => {
        const loadPreviousState = async () => {
            const savedIsActive = await AsyncStorage.getItem('isReminderActive');
            setIsReminderActive(savedIsActive === 'true');
        };
        loadPreviousState();
    }, []);

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