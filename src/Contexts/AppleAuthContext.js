// AppleAuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as SecureStore from 'expo-secure-store';

export const AppleAuthContext = createContext();

export const AppleAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // On component mount, try to fetch stored user credentials
  useEffect(() => {
    const fetchCredentials = async () => {
      const credentialString = await SecureStore.getItemAsync('apple-credentials');
      if (credentialString) {
        const credential = JSON.parse(credentialString);
        setUser(credential);
      }
    };

    fetchCredentials();
  }, []);

  const handleAppleLogin = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      setUser(credential);
      await SecureStore.setItemAsync('apple-credentials', JSON.stringify(credential));
    } catch (e) {
      if (e.code === 'ERR_CANCELED') {
        console.log('User canceled sign-in flow');
      } else {
        console.error(e);
      }
    }
  };

  const handleLogout = async () => {
    setUser(null);
    await SecureStore.deleteItemAsync('apple-credentials');
  };

  return (
    <AppleAuthContext.Provider value={{ user, handleAppleLogin, handleLogout }}>
      {children}
    </AppleAuthContext.Provider>
  );
};
