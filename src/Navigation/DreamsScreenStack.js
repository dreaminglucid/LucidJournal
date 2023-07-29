import React, { useContext } from "react";  // Import useContext
import { createStackNavigator } from "@react-navigation/stack";
import { ThemeContext } from '../Contexts/ThemeContext';

import DreamsScreen from "../Screens/DreamsScreen";
import NewDreamScreen from "../Screens/NewDreamScreen";
import DetailsScreen from "../Screens/DetailsScreen";
import RegenerateScreen from "../Screens/RegenerateScreen";

const Stack = createStackNavigator();

const DreamsScreenStack = () => {
  const { theme } = useContext(ThemeContext);  // Use ThemeContext

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Journal"
        component={DreamsScreen}
        options={{
          headerTitleAlign: "center",
          headerTintColor: theme.colors.text,  // Use theme colors
          headerStyle: {
            backgroundColor: theme.colors.background,  // Use theme colors
            elevation: 4,
            shadowOpacity: 0.5,
            shadowRadius: 5,
            shadowColor: "#000",
            shadowOffset: { height: 2, width: 0 },
          },
        }}
      />
      <Stack.Screen
        name="New Dream"
        component={NewDreamScreen}
        options={{
          headerTitleAlign: "center",
          headerTintColor: theme.colors.text,  // Use theme colors
          headerStyle: {
            backgroundColor: theme.colors.background,  // Use theme colors
            elevation: 4,
            shadowOpacity: 0.5,
            shadowRadius: 5,
            shadowColor: "#000",
            shadowOffset: { height: 2, width: 0 },
          },
        }}
      />
      <Stack.Screen
        name="Details"
        component={DetailsScreen}
        options={{
          headerTitleAlign: "center",
          headerTintColor: theme.colors.text,  // Use theme colors
          headerStyle: {
            backgroundColor: theme.colors.background,  // Use theme colors
            elevation: 4,
            shadowOpacity: 0.5,
            shadowRadius: 5,
            shadowColor: "#000",
            shadowOffset: { height: 2, width: 0 },
          },
        }}
      />
      <Stack.Screen
        name="Regenerate"
        component={RegenerateScreen}
        options={{
          headerTitleAlign: "center",
          headerTintColor: theme.colors.text,  // Use theme colors
          headerStyle: {
            backgroundColor: theme.colors.background,  // Use theme colors
            elevation: 4,
            shadowOpacity: 0.5,
            shadowRadius: 5,
            shadowColor: "#000",
            shadowOffset: { height: 2, width: 0 },
          },
        }}
      />
    </Stack.Navigator>
  );
};

export default DreamsScreenStack;