// DreamsScreenStack.js

import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import DreamsScreen from "../Screens/DreamsScreen";
import NewDreamScreen from "../Screens/NewDreamScreen";
import DetailsScreen from "../Screens/DetailsScreen";
import RegenerateScreen from "../Screens/RegenerateScreen";

const Stack = createStackNavigator();

const DreamsScreenStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Journal"
        component={DreamsScreen}
        options={{
          headerTitleAlign: "center",
          headerTintColor: "#FFFFFF",
          headerStyle: {
            backgroundColor: "#0C0E17",
            elevation: 4, // This is for Android
            shadowOpacity: 0.5, // This is for iOS
            shadowRadius: 5, // This is for iOS
            shadowColor: "#000", // This is for iOS
            shadowOffset: { height: 2, width: 0 }, // This is for iOS
          },
        }}
      />
      <Stack.Screen
        name="New Dream"
        component={NewDreamScreen}
        options={{
          headerTitleAlign: "center",
          headerTintColor: "#FFFFFF",
          headerStyle: {
            backgroundColor: "#0C0E17",
            elevation: 4, // This is for Android
            shadowOpacity: 0.5, // This is for iOS
            shadowRadius: 5, // This is for iOS
            shadowColor: "#000", // This is for iOS
            shadowOffset: { height: 2, width: 0 }, // This is for iOS
          },
        }}
      />
      <Stack.Screen
        name="Details"
        component={DetailsScreen}
        options={{
          headerTitleAlign: "center",
          headerTintColor: "#FFFFFF",
          headerStyle: {
            backgroundColor: "#0C0E17",
            elevation: 4, // This is for Android
            shadowOpacity: 0.5, // This is for iOS
            shadowRadius: 5, // This is for iOS
            shadowColor: "#000", // This is for iOS
            shadowOffset: { height: 2, width: 0 }, // This is for iOS
          },
        }}
      />
      <Stack.Screen
        name="Regenerate"
        component={RegenerateScreen}
        options={{
          headerTitleAlign: "center",
          headerTintColor: "#FFFFFF",
          headerStyle: {
            backgroundColor: "#0C0E17",
            elevation: 4, // This is for Android
            shadowOpacity: 0.5, // This is for iOS
            shadowRadius: 5, // This is for iOS
            shadowColor: "#000", // This is for iOS
            shadowOffset: { height: 2, width: 0 }, // This is for iOS
          },
        }}
      />
    </Stack.Navigator>
  );
};

export default DreamsScreenStack;