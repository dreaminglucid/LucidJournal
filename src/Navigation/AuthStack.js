// AuthStack.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen from '../Screens/LoginScreen';
import AccountScreen from '../Screens/AccountScreen';

const Stack = createStackNavigator();

const AuthStack = () => (
  <Stack.Navigator initialRouteName="Login">
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Account" component={AccountScreen} />
  </Stack.Navigator>
);

export default AuthStack;