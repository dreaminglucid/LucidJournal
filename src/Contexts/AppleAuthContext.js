import React, { createContext, useState, useEffect } from 'react';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as SecureStore from 'expo-secure-store';
import jwtDecode from 'jwt-decode';

export const AppleAuthContext = createContext();

export const AppleAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const userJson = await SecureStore.getItemAsync('appleUser');
      if (userJson) {
        setUser(JSON.parse(userJson));
      }
    };
  
    fetchUser();
  }, []);  

  const handleAppleLogin = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
  
      console.log("Credential: ", credential);
  
      const decodedToken = jwtDecode(credential.identityToken);
      console.log("Decoded Token: ", decodedToken);
  
      // Save email and id_token to SecureStore
      const user = {
        email: decodedToken.email,
        id_token: credential.identityToken,
      };
      await SecureStore.setItemAsync('appleUser', JSON.stringify(user));
  
      setUser(user);
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
    await SecureStore.deleteItemAsync('appleUser');  // Update this line
  };  

  return (
    <AppleAuthContext.Provider value={{ user, handleAppleLogin, handleLogout }}>
      {children}
    </AppleAuthContext.Provider>
  );
};