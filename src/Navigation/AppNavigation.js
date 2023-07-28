// AppNavigation.js

import React from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { MaterialCommunityIcons } from "@expo/vector-icons";

import DreamsScreenStack from "./DreamsScreenStack";
import ChatScreen from "../Screens/ChatScreen";

const Tab = createBottomTabNavigator();

const AppNavigation = () => {
  return (
    <NavigationContainer theme={navigationTheme}>
      <Tab.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: "#0C0E17",
            elevation: 4, // This is for Android
            shadowOpacity: 0.5, // This is for iOS
            shadowRadius: 5, // This is for iOS
            shadowColor: "#000", // This is for iOS
            shadowOffset: { height: 2, width: 0 }, // This is for iOS
          },
          headerTitleStyle: {
            color: "#FFFFFF",
            fontWeight: "bold",
          },
          tabBarStyle: {
            backgroundColor: "#0C0E17",
            borderTopColor: "#0C0E17",
            elevation: 4, // This is for Android
            shadowOpacity: 0.5, // This is for iOS
            shadowRadius: 5, // This is for iOS
            shadowColor: "#000", // This is for iOS
            shadowOffset: { height: 2, width: 0 }, // This is for iOS
          },
          tabBarLabelStyle: {
            fontSize: 14,
            fontWeight: "bold",
            color: "#FFFFFF",
          },
          tabBarActiveTintColor: "#00ADB5",
          tabBarInactiveTintColor: "#6B7280",
        }}
      >
        <Tab.Screen
          name="Dreams"
          component={DreamsScreenStack}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="cloud" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="Emris"
          component={ChatScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="chat" color={color} size={size} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#0C0E17",
    text: "#FFFFFF",
  },
};

export default AppNavigation;
