import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import AdminDashboard from "../src/screens/admin/AdminDashboard";

const Drawer = createDrawerNavigator();

export default function AdminDrawerNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: true,
      }}
    >
      <Drawer.Screen 
        name="AdminDashboard" 
        component={AdminDashboard} 
        options={{ title: "Dashboard" }} 
      />
    </Drawer.Navigator>
  );
}
