import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert, Image } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import { useNavigation, useRoute, RouteProp, NavigationProp } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../context/AuthContext";
import { RootStackParamList } from "../../types/navigation";

type ConfirmOTPScreenRouteProp = RouteProp<RootStackParamList, "ConfirmOTP">;
type ConfirmOTPScreenNavProp = NavigationProp<RootStackParamList, "ConfirmOTP">;

export default function ConfirmOTPScreen() {
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(30);
  const route = useRoute<ConfirmOTPScreenRouteProp>();
  const navigation = useNavigation<ConfirmOTPScreenNavProp>();

  const { verifyOTP, loading, error, clearError, loginCode } = useAuth();

  const emailParam = route.params?.email || "";

  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [countdown]);

  useEffect(() => {
    if (error) {
      Alert.alert("Error", error);
      clearError();
    }
  }, [error, clearError]);

  const handleVerifyOTP = async () => {
    if (otp.length !== 5) {
      Alert.alert("Error", "Please enter a 5-digit code");
      return;
    }

    try {
      const storedEmail = emailParam || (await AsyncStorage.getItem("otpEmail"));
      if (!storedEmail) {
        Alert.alert("Error", "No email found. Please restart login.");
        return;
      }

      const result = await verifyOTP({ email: storedEmail, code: otp });

      if (result?.success) {
        // ✅ Just reset to Main. AppNavigator decides Admin vs User
        navigation.reset({
          index: 0,
          routes: [{ name: "Main" }],
        });
      }
    } catch (err) {
      console.error("OTP verification error:", err);
    }
  };

  const resendOTP = async () => {
    try {
      const resendEmail = emailParam || (await AsyncStorage.getItem("otpEmail"));
      if (!resendEmail) {
        Alert.alert("Error", "No email found to resend OTP");
        return;
      }

      const result = await loginCode({ email: resendEmail });
      if (result?.success) {
        setCountdown(30);
        Alert.alert("OTP Resent", "A new code has been sent to your email");
      }
    } catch (err) {
      console.error("Resend OTP error:", err);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/icon.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text variant="headlineMedium" style={styles.title}>
        Verify Your Identity
      </Text>

      <Text variant="bodyMedium" style={styles.subtitle}>
        Enter the 5-digit code sent to {emailParam || "your email"}
      </Text>

      <View style={styles.card}>
        <TextInput
          label="Verification Code"
          value={otp}
          onChangeText={setOtp}
          mode="outlined"
          keyboardType="number-pad"
          style={styles.input}
          maxLength={5}
          left={<TextInput.Icon icon="shield-check" color="#ff7900" />}
        />

        <Button
          mode="contained"
          onPress={handleVerifyOTP}
          style={styles.button}
          loading={loading}
          disabled={loading}
        >
          Verify Code
        </Button>
      </View>

      <View style={styles.footer}>
        <Text variant="bodyMedium" style={styles.footerText}>
          Didn’t receive code?
        </Text>
        <Button
          mode="text"
          onPress={resendOTP}
          disabled={countdown > 0 || loading}
          labelStyle={styles.resendLink}
        >
          {countdown > 0 ? `Resend in ${countdown}s` : "Resend Code"}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, justifyContent: "center", backgroundColor: "#f8fafc" },
  logo: { height: 100, width: 100, alignSelf: "center", marginBottom: 16 },
  title: { fontWeight: "bold", marginBottom: 8, textAlign: "center", color: "#2563eb" },
  subtitle: { marginBottom: 32, textAlign: "center", color: "#1e293b" },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 24, elevation: 4 },
  input: { marginBottom: 16 },
  button: { marginTop: 8, borderRadius: 10, height: 48, justifyContent: "center", backgroundColor: "#ff7900" },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 24 },
  footerText: { color: "#64748b" },
  resendLink: { color: "#ff7900", fontWeight: "600", marginLeft: 4 },
});
