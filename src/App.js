// App.js
import React from "react";
import { GitHubAuthProvider } from './Contexts/GithubAuthContext'; // Import GitHubAuthProvider
import AppNavigation from "./Navigation/AppNavigation";

const App = () => {
  return (
    <GitHubAuthProvider>
      <AppNavigation />
    </GitHubAuthProvider>
  );
};

export default App;