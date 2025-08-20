import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import HomeScreen from "../src/screens/HomeScreen";
import ProfileScreen from "../src/screens/ProfileScreen";

const Drawer = createDrawerNavigator();

export default function UserDrawerNavigator() {
  return (
    <Drawer.Navigator screenOptions={{ headerShown: true }}>
      <Drawer.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "Home" }}
      />
      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: "Profile" }}
      />
    </Drawer.Navigator>
  );
}
