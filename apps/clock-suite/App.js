import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import IntervalTimer from "./screens/IntervalTimer";
import CountdownTimer from "./screens/CountdownTimer";
import Stopwatch from "./screens/Stopwatch";

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: "#000",
            borderTopColor: "#222",
          },
          tabBarActiveTintColor: "#fff",
          tabBarInactiveTintColor: "#777",
          tabBarIcon: ({ color, size }) => {
            let iconName = "ellipse";

            if (route.name === "Interval") iconName = "timer-outline";
            if (route.name === "Countdown") iconName = "hourglass-outline";
            if (route.name === "Stopwatch") iconName = "stopwatch-outline";

            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Interval" component={IntervalTimer} />
        <Tab.Screen name="Countdown" component={CountdownTimer} />
        <Tab.Screen name="Stopwatch" component={Stopwatch} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
