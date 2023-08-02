import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { AppleAuthContext } from '../Contexts/AppleAuthContext';
import { ThemeContext } from '../Contexts/ThemeContext';

import DreamsScreenStack from "./DreamsScreenStack";
import ChatScreen from "../Screens/ChatScreen";
import SettingsScreen from "../Screens/SettingsScreen";
import AccountScreen from "../Screens/AccountScreen";
import LoginScreen from "../Screens/LoginScreen";

const RootStack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const themeContext = useContext(ThemeContext);
  if (!themeContext) {
    throw new Error("TabNavigator must be used within a ThemeProvider");
  }
  const { theme } = themeContext;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,  // Hide header in TabNavigator
        tabBarStyle: {
          backgroundColor: theme.colors.background, // use theme background color
          borderTopColor: theme.colors.background, // use theme background color
          elevation: 4,
          shadowOpacity: 0.22,
          shadowRadius: 5,
          shadowColor: "#000",
          shadowOffset: { height: 2, width: 0 },
          paddingTop: 5,
        },
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: "bold",
          color: theme.colors.text, // use theme text color
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
  );
};

const AppNavigation = () => {
  const { user } = useContext(AppleAuthContext);
  const themeContext = useContext(ThemeContext);
  if (!themeContext) {
    throw new Error("AppNavigation must be used within a ThemeProvider");
  }
  const { theme } = themeContext;

  return (
    <NavigationContainer theme={theme}>
      <RootStack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.background, // use theme background color
            elevation: 4,
            shadowOpacity: 0.22,
            shadowRadius: 5,
            shadowColor: "#000",
            shadowOffset: { height: 2, width: 0 },
          },
          headerTitleStyle: {
            color: theme.colors.text, // use theme text color
            fontWeight: "bold",
          },
          headerTintColor: theme.colors.text, // this changes the color of the header icons
        }}
      >
        {user ? (
          // User is signed in
          <RootStack.Screen
            name="App"
            component={TabNavigator}
            options={({ route, navigation }) => ({
              headerTitle: getHeaderTitle(route),
              headerRight: () => (
                <TouchableOpacity onPress={() => navigation.navigate('Account')}>
                  <MaterialCommunityIcons name="account" color={theme.colors.text} size={25} style={{ marginRight: 10 }} />
                </TouchableOpacity>
              ),
              headerLeft: () => (
                <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
                  <MaterialCommunityIcons name="cog" color={theme.colors.text} size={25} style={{ marginLeft: 10 }} />
                </TouchableOpacity>
              ),
            })}
          />
        ) : (
          // No user found, user isn't signed in
          <RootStack.Screen
            name="Login"
            component={LoginScreen}
            options={{
              animationEnabled: false,
              headerShown: false, // Hide header for LoginScreen
            }}
          />
        )}
        <RootStack.Screen name="Account" component={AccountScreen} />
        <RootStack.Screen name="Settings" component={SettingsScreen} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

const getHeaderTitle = (route) => {
  const routeName = getFocusedRouteNameFromRoute(route) ?? 'Dreams';

  switch (routeName) {
    case 'Dreams':
      return 'Dreams';
    case 'Emris':
      return 'Emris';
    default:
      return routeName;
  }
};

export default AppNavigation;
