// AuthStack.js

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../Screens/LoginScreen';
import AccountScreen from '../Screens/AccountScreen';

const Stack = createStackNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{
          headerShown: false,  // Hide header
        }} 
      />
      <Stack.Screen 
        name="AccountDetails"  // Renamed to 'AccountDetails'
        component={AccountScreen} 
        options={{
          headerShown: false,  // Hide header
        }}
      />
    </Stack.Navigator>
  );
};

export default AuthStack;
