// App.js

import React from "react";
import { ThemeProvider } from './src/Contexts/ThemeContext';
import { AppleAuthProvider } from './src/Contexts/AppleAuthContext';
import AppNavigation from "./src/Navigation/AppNavigation";

const App = () => {
  return (
    <ThemeProvider>
      <AppleAuthProvider>
        <AppNavigation />
      </AppleAuthProvider>
    </ThemeProvider>
  );
};

export default App;