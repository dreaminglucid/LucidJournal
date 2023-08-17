import React, { useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    ScrollView,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemeContext } from '../Contexts/ThemeContext';
import { useReminder } from '../Contexts/NotificationContext';

const MorningReminder = () => {
    const { theme } = useContext(ThemeContext);
    const { isReminderActive, toggleReminder } = useReminder();
    const styles = getStyles(theme);

    const defaultReminderTime = new Date();
    defaultReminderTime.setHours(8, 0, 0, 0);

    const [reminderTime, setReminderTime] = useState(defaultReminderTime);
    const [showReminderPicker, setShowReminderPicker] = useState(false);
    const [showTips, setShowTips] = useState(false);
    const tipsHeight = new Animated.Value(showTips ? 170 : 0);

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

    const saveSettings = async () => {
        try {
            await AsyncStorage.setItem('reminderTime', reminderTime.toISOString());
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    };

    useEffect(() => {
        loadSettings();
    }, []);

    const toggleTips = () => {
        Animated.timing(tipsHeight, {
            toValue: showTips ? 0 : 170,
            duration: 500,
            useNativeDriver: false,
        }).start();
        setShowTips((prev) => !prev);
    };

    const scheduleReminder = () => {
        saveSettings();
        toggleReminder(true, reminderTime);
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>
                    <MaterialCommunityIcons name="clock" size={22} color={theme.colors.text} />
                    {' '}Why Morning Reminder?
                </Text>
                <Text style={styles.text}>
                    The morning reminder helps you keep a consistent dream journaling practice. Recording your dreams right after waking up enhances dream recall and supports lucid dreaming.
                </Text>
                <TouchableOpacity onPress={toggleTips} style={styles.tipsButton}>
                    <Text style={styles.tipsButtonText}>Tips {showTips ? '-' : '+'}</Text>
                </TouchableOpacity>
                <Animated.View style={[styles.tipsContainer, { height: tipsHeight }]}>
                    <Text style={styles.tipText}>- Keep your dream journal close to your bed for easy access.</Text>
                    <Text style={styles.tipText}>- Write down even vague or fragmented dreams.</Text>
                    <Text style={styles.tipText}>- Use vivid and descriptive language to capture dream details.</Text>
                </Animated.View>
            </View>
            <View style={styles.card}>
                <Text style={styles.title}>
                    <MaterialCommunityIcons name="notebook-outline" size={22} color={theme.colors.text} />
                    {' '}Set Morning Reminder
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
});

export default MorningReminder;