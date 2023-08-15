// App.js
import React from "react";

// Theme and Navigation
import AppNavigation from "./src/Navigation/AppNavigation";
import { ThemeProvider } from './src/Contexts/ThemeContext';

// Auth Providers
import { AppleAuthProvider } from './src/Contexts/AppleAuthContext';

// Notifications
import { TimerProvider } from './src/Contexts/TimerContext';
import { ReminderProvider } from './src/Contexts/ReminderContext';


const App = () => {
  return (

    <ThemeProvider>
      <AppleAuthProvider>
        <TimerProvider>
          <ReminderProvider>
            <AppNavigation />
          </ReminderProvider>
        </TimerProvider>
      </AppleAuthProvider>
    </ThemeProvider>
  );
};

export default App;