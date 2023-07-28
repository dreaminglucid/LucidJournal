// GitHubAuthContext.js
import React, { createContext, useState } from 'react';
import axios from 'axios';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } from '../config';

WebBrowser.maybeCompleteAuthSession();

// Endpoint
const discovery = {
  authorizationEndpoint: 'https://github.com/login/oauth/authorize',
  tokenEndpoint: 'https://github.com/login/oauth/access_token',
  revocationEndpoint: `https://github.com/settings/connections/applications/${GITHUB_CLIENT_ID}`,
};

export const GitHubAuthContext = createContext();

export const GitHubAuthProvider = ({ children }) => {
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: GITHUB_CLIENT_ID,
      scopes: ['identity'],
      redirectUri: 'https://auth.expo.io/@jamesfeura/lucid-journal',
    },
    discovery
  );

  const [user, setUser] = useState(null);

  const getUserData = async (token) => {
    const user = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `token ${token}` },
    });
    setUser(user.data);
  };

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { code } = response.params;
      axios({
        method: 'post',
        url: `https://github.com/login/oauth/access_token?client_id=${GITHUB_CLIENT_ID}&client_secret=${GITHUB_CLIENT_SECRET}&code=${code}`,
        headers: {
          accept: 'application/json',
        },
      }).then((res) => {
        const accessToken = res.data.access_token;
        getUserData(accessToken);
      }).catch((error) => {
        console.error('Error:', error);
      });
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
