// AccountScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useAuthRequest, makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import axios from 'axios';
import { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } from '../config';

WebBrowser.maybeCompleteAuthSession();

// Endpoint
const discovery = {
  authorizationEndpoint: 'https://github.com/login/oauth/authorize',
  tokenEndpoint: 'https://github.com/login/oauth/access_token',
  revocationEndpoint: 'https://github.com/settings/connections/applications/<CLIENT_ID>',
};

export default function AccountScreen() {
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: GITHUB_CLIENT_ID,
      scopes: ['user'],
      redirectUri: makeRedirectUri({
        scheme: 'your.app'
      }),
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

  useEffect(() => {
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
      });
    }
  }, [response]);

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) {
    return (
      <Button
        disabled={!request}
        title="Login"
        onPress={() => {
          promptAsync();
        }}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Text>Email: {user.email}</Text>
      <Text>Name: {user.login}</Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
});
