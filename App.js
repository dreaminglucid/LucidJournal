// App.js

import React from "react";
import { ThemeProvider } from './src/Contexts/ThemeContext';
import { AppleAuthProvider } from './src/Contexts/AppleAuthContext';
import { TimerProvider } from './src/Contexts/TimerContext';
import AppNavigation from "./src/Navigation/AppNavigation";

const App = () => {
  return (
    <ThemeProvider>
      <AppleAuthProvider>
        <TimerProvider>
          <AppNavigation />
        </TimerProvider>
      </AppleAuthProvider>
    </ThemeProvider>
  );
};

export default App;