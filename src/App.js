// App.js

import React from "react";
import { ThemeProvider } from './Contexts/ThemeContext';  // Import ThemeProvider
import { GitHubAuthProvider } from './Contexts/GithubAuthContext';
import AppNavigation from "./Navigation/AppNavigation";

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