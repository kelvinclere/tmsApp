import React from "react";
import { View, Image, StyleSheet } from "react-native";
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";

import AdminDashboard from "../src/screens/admin/AdminDashboard";
import ManageTrainingsScreen from "../src/screens/admin/ManageTrainingsScreen";
import ManageUsersScreen from "src/screens/admin/ManageUsersScreen";
import FacilitatorsScreen from "src/screens/admin/FacilitatorsScreen";
import ManageSessionsScreen from "src/screens/admin/ManageSessionsScreen";
import ProfileScreen from "src/screens/ProfileScreen";

const Drawer = createDrawerNavigator();

function CustomDrawerContent(props: any) {
  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.logoContainer}>
        <Image
          source={require("../assets/images/icon.png")} 
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
}

export default function SuperAdminDrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
        drawerType: "front",
        drawerActiveTintColor: "#ff7900",
        drawerLabelStyle: { fontSize: 15, fontWeight: "500" },
      }}
    >
      <Drawer.Screen
        name="SuperAdminDashboard"
        component={AdminDashboard}
        options={{
          title: "Dashboard",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="speedometer-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="ManageTrainings"
        component={ManageTrainingsScreen}
        options={{
          title: "Manage Trainings",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="school-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="ManageUsers"
        component={ManageUsersScreen}
        options={{
          title: "Manage Users",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Facilitators"
        component={FacilitatorsScreen}
        options={{
          title: "Facilitators",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="ManageSessions"
        component={ManageSessionsScreen}
        options={{
          title: "Manage Sessions",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: "Profile Screen",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30, // 👈 spacing at top
  },
  logo: {
    width: 120,
    height: 60,
  },
});
