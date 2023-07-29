// AppNavigation.js

import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer, DefaultTheme, getFocusedRouteNameFromRoute  } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from "@expo/vector-icons";

import DreamsScreenStack from "./DreamsScreenStack";
import ChatScreen from "../Screens/ChatScreen";
import AuthStack from "./AuthStack";

const Tab = createBottomTabNavigator();
const RootStack = createStackNavigator();

const TabNavigator = () => (
    <Tab.Navigator
        screenOptions={{
            headerShown: false,  // Hide header in TabNavigator
            tabBarStyle: {
                backgroundColor: "#0C0E17",
                borderTopColor: "#0C0E17",
                elevation: 4,
                shadowOpacity: 0.5,
                shadowRadius: 5,
                shadowColor: "#000",
                shadowOffset: { height: 2, width: 0 },
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
);

const AppNavigation = () => {
    return (
        <NavigationContainer theme={navigationTheme}>
            <RootStack.Navigator
                screenOptions={{
                    headerStyle: {
                        backgroundColor: "#0C0E17",
                        elevation: 4,
                        shadowOpacity: 0.5,
                        shadowRadius: 5,
                        shadowColor: "#000",
                        shadowOffset: { height: 2, width: 0 },
                    },
                    headerTitleStyle: {
                        color: "#FFFFFF",
                        fontWeight: "bold",
                    },
                }}
            >
                <RootStack.Screen
                    name="App"
                    component={TabNavigator}
                    options={({ route, navigation }) => ({
                        headerTitle: getHeaderTitle(route),
                        headerRight: () => (
                            <TouchableOpacity onPress={() => navigation.navigate('Account')}>
                                <MaterialCommunityIcons name="account" color={"#FFFFFF"} size={25} style={{ marginRight: 10 }} />
                            </TouchableOpacity>
                        ),
                    })}
                />
                <RootStack.Screen name="Account" component={AuthStack} />
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

const navigationTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        background: "#0C0E17",
        text: "#FFFFFF",
    },
};

export default AppNavigation;
