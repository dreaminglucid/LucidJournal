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
import ToolsScreen from '../Screens/ToolsScreen';
import RealityCheckTimer from '../Components/RealityCheckTimer';

const RootStack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
    const themeContext = useContext(ThemeContext);
    const { theme } = themeContext;

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: theme.colors.background,
                    borderTopColor: theme.colors.background,
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
                    color: theme.colors.text,
                },
                tabBarActiveTintColor: theme.colors.button,
                tabBarInactiveTintColor: theme.colors.text,
            }}
        >
            <Tab.Screen
                name="Dreams"
                component={DreamsScreenStack}
                options={{
                    tabBarIcon: ({ color, size, focused }) => (
                        <MaterialCommunityIcons
                            name={focused ? "cloud" : "cloud-outline"}
                            color={color}
                            size={size}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="Emris"
                component={ChatScreen}
                options={{
                    tabBarIcon: ({ color, size, focused }) => (
                        <MaterialCommunityIcons
                            name={focused ? "chat" : "chat-outline"}
                            color={color}
                            size={size}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="Tools"
                component={ToolsScreen}
                options={{
                    tabBarIcon: ({ color, size, focused }) => (
                        <MaterialCommunityIcons
                            name={focused ? "toolbox" : "toolbox-outline"}
                            color={color}
                            size={size}
                        />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

const AppNavigation = () => {
    const { user } = useContext(AppleAuthContext);
    const themeContext = useContext(ThemeContext);
    const { theme } = themeContext;

    return (
        <NavigationContainer theme={theme}>
            <RootStack.Navigator
                screenOptions={{
                    headerStyle: {
                        backgroundColor: theme.colors.background,
                        elevation: 4,
                        shadowOpacity: 0.22,
                        shadowRadius: 5,
                        shadowColor: "#000",
                        shadowOffset: { height: 2, width: 0 },
                    },
                    headerTitleStyle: {
                        color: theme.colors.text,
                        fontWeight: "bold",
                    },
                    headerTintColor: theme.colors.text,
                }}
            >
                {user ? (
                    <React.Fragment>
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
                        <RootStack.Screen name="Account" component={AccountScreen} />
                        <RootStack.Screen name="Settings" component={SettingsScreen} />
                        <RootStack.Screen name="RealityCheckTimer" component={RealityCheckTimer} />
                    </React.Fragment>
                ) : (
                    <RootStack.Screen
                        name="Login"
                        component={LoginScreen}
                        options={{
                            animationEnabled: false,
                            headerShown: false,
                        }}
                    />
                )}

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
        case 'Tools':
            return 'Tools';
        default:
            return routeName;
    }
};

export default AppNavigation;