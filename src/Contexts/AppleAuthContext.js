import React, { createContext, useState, useEffect } from 'react';
import * as AppleAuthentication from 'expo-apple-authentication';

export const AppleAuthContext = createContext();

export const AppleAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const handleAppleLogin = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      // If successful, set the user state with the credential data
      setUser(credential);
    } catch (e) {
      if (e.code === 'ERR_CANCELED') {
        // handle that the user canceled the sign-in flow
        console.log('User canceled sign-in flow');
      } else {
        // handle other errors
        console.error(e);
      }
    }
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <AppleAuthContext.Provider value={{ user, handleAppleLogin, handleLogout }}>
      {children}
    </AppleAuthContext.Provider>
  );
};
