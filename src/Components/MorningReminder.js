import React, { useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
import { useReminder } from '../Contexts/ReminderContext';

const MorningReminder = () => {
    const { theme } = useContext(ThemeContext);
    const { isReminderActive, toggleReminder } = useReminder();
    const styles = getStyles(theme);

    const defaultReminderTime = new Date();
    defaultReminderTime.setHours(8, 0, 0, 0);

    const [reminderTime, setReminderTime] = useState(defaultReminderTime);
    const [showReminderPicker, setShowReminderPicker] = useState(false);

    // Function to load saved settings
    const loadSettings = async () => {
        try {
            const savedTime = await AsyncStorage.getItem('reminderTime');
            if (savedTime) {
                setReminderTime(new Date(savedTime));
            }
        } catch (error) {
            console.error('Error loading saved settings:', error);
        }
    };

    // Function to save current settings
    const saveSettings = async () => {
        try {
            await AsyncStorage.setItem('reminderTime', reminderTime.toISOString());
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    };

    // Load settings on component mount
    useEffect(() => {
        loadSettings();
    }, []);

    const scheduleReminder = () => {
        saveSettings();
        toggleReminder(true, reminderTime);
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>
                    <MaterialCommunityIcons name="notebook-outline" size={22} color={theme.colors.text} />
                    {' '}Set Dream Journal Reminder
                </Text>
                <TouchableOpacity onPress={() => setShowReminderPicker(true)} style={styles.timeButton}>
                    <Text style={styles.timeText}>{reminderTime.toLocaleTimeString()}</Text>
                </TouchableOpacity>
                {showReminderPicker && (
                    <DateTimePicker
                        value={reminderTime}
                        mode="time"
                        display="default"
                        onChange={(event, selectedDate) => {
                            setShowReminderPicker(false);
                            if (selectedDate) setReminderTime(selectedDate);
                        }}
                    />
                )}
            </View>
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.saveButton} onPress={scheduleReminder}>
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

export default MorningReminder;