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

const ToolsScreen = ({ navigation }) => {
  const { theme } = useContext(ThemeContext);
  const { isTimerActive, toggleTimer } = useTimer();
  const styles = getStyles(theme);

  const handleToggleTimer = (value) => {
    // Here you may need to define the notification content, time interval, and randomness according to your requirements.
    const notificationContent = { title: "Reality Check!", body: "Perform a reality check to enhance lucid dreaming." };
    const timeInterval = 60;
    const isRandom = false;

    toggleTimer(value, notificationContent, timeInterval, isRandom);
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <Text style={styles.toolText}>Reality Check Timer</Text>
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
    </View>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  card: {
    width: '90%',
    borderRadius: 10,
    backgroundColor: theme.colors.card,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
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