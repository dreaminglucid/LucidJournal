import React, { useContext } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Switch,
    StyleSheet,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemeContext } from '../Contexts/ThemeContext';
import { useTimer } from '../Contexts/TimerContext';
import { useReminder } from '../Contexts/ReminderContext';
import { useWBTBAlarm } from '../Contexts/WBTBAlarmContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ToolsScreen = ({ navigation }) => {
    const { theme } = useContext(ThemeContext);
    const styles = getStyles(theme);
    const { isTimerActive, toggleTimer } = useTimer();
    const { isReminderActive, toggleReminder } = useReminder();
    const { isAlarmActive, toggleAlarm } = useWBTBAlarm();

    const handleToggleWBTBAlarm = async (value) => {
        const savedTime = await AsyncStorage.getItem('alarmTime');
        const alarmDate = savedTime ? new Date(savedTime) : new Date();

        // Check if the alarm time is in the past, and add a day if so
        if (alarmDate <= Date.now()) {
            alarmDate.setDate(alarmDate.getDate() + 1);
        }

        toggleAlarm(value, alarmDate);
    };

    const handleToggleReminder = async (value) => {
        const savedTime = await AsyncStorage.getItem('reminderTime');
        const reminderDate = savedTime ? new Date(savedTime) : new Date();
    
        // If the reminder time is in the past, schedule it for the next day
        if (reminderDate.getTime() <= Date.now()) {
            reminderDate.setDate(reminderDate.getDate() + 1);
        }
    
        toggleReminder(value, reminderDate);
    };

    const handleToggleTimer = async (value) => {
        // Load the saved settings
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

            const notificationContent = { title: notificationTitle, body: notificationBody };
            toggleTimer(value, notificationContent, timeInterval, isRandom, new Date(awakeTime), new Date(sleepTime));
        } else {
            // If no saved settings, use default values
            const notificationContent = { title: "Reality Check!", body: "Perform a reality check to enhance lucid dreaming." };
            const timeInterval = 60;
            const isRandom = false;
            const awakeTime = new Date();
            awakeTime.setHours(10, 0, 0, 0);
            const sleepTime = new Date();
            sleepTime.setHours(22, 0, 0, 0);

            toggleTimer(value, notificationContent, timeInterval, isRandom, awakeTime, sleepTime);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.section}>
                <Text style={styles.sectionHeader}>Notifications</Text>
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View style={styles.titleContainer}>
                            <Text style={styles.toolText}>Reality Check</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('RealityCheckTimer')}>
                                <MaterialCommunityIcons name="pencil-outline" size={22} color={theme.colors.text} />
                            </TouchableOpacity>
                        </View>
                        <Switch
                            value={isTimerActive}
                            onValueChange={handleToggleTimer}
                            thumbColor={theme.colors.button}
                            trackColor={{ false: '#f0f0f0', true: theme.colors.button }}
                        />
                    </View>
                </View>
                {/* Dream Journal Reminder */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View style={styles.titleContainer}>
                            <Text style={styles.toolText}>Journal Reminder</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('MorningReminder')}>
                                <MaterialCommunityIcons name="pencil-outline" size={22} color={theme.colors.text} />
                            </TouchableOpacity>
                        </View>
                        <Switch
                            value={isReminderActive}
                            onValueChange={handleToggleReminder}
                            thumbColor={theme.colors.button}
                            trackColor={{ false: '#f0f0f0', true: theme.colors.button }}
                        />
                    </View>
                </View>
                {/* WBTB Alarm Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View style={styles.titleContainer}>
                            <Text style={styles.toolText}>WBTB Alarm</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('WBTBAlarm')}>
                                <MaterialCommunityIcons name="pencil-outline" size={22} color={theme.colors.text} />
                            </TouchableOpacity>
                        </View>
                        <Switch
                            value={isAlarmActive}
                            onValueChange={handleToggleWBTBAlarm}
                            thumbColor={theme.colors.button}
                            trackColor={{ false: '#f0f0f0', true: theme.colors.button }}
                        />
                    </View>
                </View>
            </View>
        </View>
    );
};

const getStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    section: {
        padding: 20,
    },
    sectionHeader: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: 15,
    },
    card: {
        borderRadius: 10,
        backgroundColor: theme.colors.card,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 3,
        marginBottom: 10,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    toolText: {
        fontSize: 18,
        color: theme.colors.text,
        marginRight: 10,
    },
});

export default ToolsScreen;