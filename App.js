// App.js

import React from "react";
import { ThemeProvider } from './src/Contexts/ThemeContext';
import { GitHubAuthProvider } from './src/Contexts/GithubAuthContext';
import AppNavigation from "./src/Navigation/AppNavigation";

const App = () => {
  return (
    <ThemeProvider>
      <GitHubAuthProvider>
        <AppNavigation />
      </GitHubAuthProvider>
    </ThemeProvider>
  );
};

export default App;