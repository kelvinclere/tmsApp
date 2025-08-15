import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import HomeScreen from "../src/screens/HomeScreen";

export type DrawerParamList = {
  Home: undefined;
  Dashboard: undefined;
};

const Drawer = createDrawerNavigator<DrawerParamList>();

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: true,
        drawerType: "front",
        drawerActiveTintColor: "#ff7900",
        drawerLabelStyle: { fontSize: 16 },
      }}
    >
      <Drawer.Screen name="Home" component={HomeScreen} />
    </Drawer.Navigator>
  );
}
