// App.js
import React from "react";

// Theme and Navigation
import AppNavigation from "./src/Navigation/AppNavigation";
import { ThemeProvider } from './src/Contexts/ThemeContext';

// Auth Providers
import { AppleAuthProvider } from './src/Contexts/AppleAuthContext';

// Notifications
import { TimerProvider, ReminderProvider, WBTBAlarmProvider } from "./src/Contexts/NotificationContext";

const App = () => {
  return (
    <ThemeProvider>
      <AppleAuthProvider>
        <TimerProvider>
          <ReminderProvider>
            <WBTBAlarmProvider>
              <AppNavigation />
            </WBTBAlarmProvider>
          </ReminderProvider>
        </TimerProvider>
      </AppleAuthProvider>
    </ThemeProvider>
  );
};

export default App;