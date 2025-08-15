import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DrawerNavigator from './DrawerNavigator';
import LoginScreen from '../src/screens/LoginScreen';
import RegisterScreen from '../src/screens/RegisterScreen';
import ConfirmOTPScreen from '../src/screens/ConfirmOTPScreen';

// Drawer param list
export type DrawerParamList = {
  Home: undefined;
  // Add more drawer screens here if needed
};

// Root stack param list
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ConfirmOTP: { email: string };
  Main: { screen?: keyof DrawerParamList } | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ConfirmOTP" component={ConfirmOTPScreen} />
      <Stack.Screen name="Main" component={DrawerNavigator} />
    </Stack.Navigator>
  );
}
