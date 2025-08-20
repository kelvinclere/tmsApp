import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../src/context/AuthContext";
import LoginScreen from "../src/screens/LoginScreen";
import RegisterScreen from "../src/screens/RegisterScreen";
import ConfirmOTPScreen from "../src/screens/ConfirmOTPScreen";
import SuperAdminDrawerNavigator from "./SuperAdminDrawerNavigator";
import UserDrawerNavigator from "./UserDrawerNavigator";

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ConfirmOTP: { email: string };
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { userInfo, isAuthenticated } = useAuth();

  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{ headerShown: false }}
    >
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="ConfirmOTP" component={ConfirmOTPScreen} />
        </>
      ) : userInfo?.role === "super_admin" ? (
        <Stack.Screen name="Main" component={SuperAdminDrawerNavigator} />
      ) : (
        <Stack.Screen name="Main" component={UserDrawerNavigator} />
      )}
    </Stack.Navigator>
  );
}
