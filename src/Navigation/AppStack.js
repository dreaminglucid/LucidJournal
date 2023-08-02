import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import AccountScreen from '../Screens/AccountScreen';

const Stack = createStackNavigator();

function AppStack() {
  return (
    <Stack.Navigator initialRouteName="Account">
      <Stack.Screen name="Account" component={AccountScreen} />
    </Stack.Navigator>
  );
}

export default AppStack;
