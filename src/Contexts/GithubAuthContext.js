// GitHubAuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import { GITHUB_CLIENT_ID } from '../../config';

WebBrowser.maybeCompleteAuthSession();

// Endpoint
const discovery = {
  authorizationEndpoint: 'https://github.com/login/oauth/authorize',
  tokenEndpoint: 'https://github.com/login/oauth/access_token',
  revocationEndpoint: `https://github.com/settings/connections/applications/${GITHUB_CLIENT_ID}`,
};

export const GitHubAuthContext = createContext();

const redirectUri = makeRedirectUri({
  scheme: 'lucidjournal',
  path: 'redirect',
  useProxy: false, // Here's the change
});

export const GitHubAuthProvider = ({ children }) => {
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: 'CLIENT_ID',
      scopes: ['identity'],
      redirectUri,
    },
    discovery
  );

  const [user, setUser] = useState(null);

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { code } = response.params;
      // Here you would send `code` to your server to exchange for an access token
      // and get the user's information to set in state.
    }
  }, [response]);

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <GitHubAuthContext.Provider value={{ user, promptAsync, handleLogout }}>
      {children}
    </GitHubAuthContext.Provider>
  );
};
