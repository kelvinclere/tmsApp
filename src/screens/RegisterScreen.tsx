import React, { useState } from "react";
import { View, StyleSheet, Alert, Image } from "react-native";
import { TextInput, Button, Text, useTheme } from "react-native-paper";
import { useAuth } from "../context/AuthContext";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@navigation/AppNavigator";

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [secureText, setSecureText] = useState(true);
  const theme = useTheme();

  const { register, loading } = useAuth();

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    const payload = {
      first_name: firstName,
      last_name: lastName,
      email,
      password,
      confirm_password: confirmPassword,
    };

    const response = await register(payload);

    if (response?.success) {
      Alert.alert(
        "Registration Successful",
        "Your account has been created successfully!",
        [{ text: "OK", onPress: () => navigation.navigate("Login") }]
      );
    } else {
      Alert.alert("Error", response?.error || "Registration failed");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: "#f8fafc" }]}>
      <Image
        source={require("../../assets/images/icon.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text
        variant="headlineMedium"
        style={[styles.title, { color: "#2563eb" }]}
      >
        Create Account
      </Text>

      <View style={styles.card}>
        <TextInput
          label="First Name"
          value={firstName}
          onChangeText={setFirstName}
          mode="outlined"
          style={styles.input}
          theme={inputTheme}
          left={<TextInput.Icon icon="account" color="#ff7900" />}
        />

        <TextInput
          label="Last Name"
          value={lastName}
          onChangeText={setLastName}
          mode="outlined"
          style={styles.input}
          theme={inputTheme}
          left={<TextInput.Icon icon="account" color="#ff7900" />}
        />

        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
          theme={inputTheme}
          left={<TextInput.Icon icon="email" color="#ff7900" />}
        />

        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          mode="outlined"
          secureTextEntry={secureText}
          style={styles.input}
          theme={inputTheme}
          left={<TextInput.Icon icon="lock" color="#ff7900" />}
          right={
            <TextInput.Icon
              icon={secureText ? "eye-off-outline" : "eye-outline"}
              onPress={() => setSecureText(!secureText)}
              color="#ff7900"
            />
          }
        />

        <TextInput
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          mode="outlined"
          secureTextEntry={secureText}
          style={styles.input}
          theme={inputTheme}
          left={<TextInput.Icon icon="lock-check" color="#ff7900" />}
        />

        <Button
          mode="contained"
          onPress={handleRegister}
          style={styles.button}
          loading={loading}
          disabled={loading}
        >
          {loading ? "" : "Register"}
        </Button>
      </View>

      <View style={styles.footer}>
        <Text variant="bodyMedium" style={{ color: "#64748b" }}>
          Already have an account?
        </Text>
        <Button
          compact
          onPress={() => navigation.navigate("Login")}
          style={styles.link}
          labelStyle={{ color: "#ff7900", fontWeight: "600" }}
          disabled={loading}
        >
          Login
        </Button>
      </View>
    </View>
  );
}

const inputTheme = {
  roundness: 10,
  colors: {
    primary: "#2563eb",
    background: "#ffffff",
    placeholder: "#94a3b8",
    text: "#1e293b",
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: "center",
  },
  logo: { height: 120, width: 120, alignSelf: "center", marginBottom: 24 },
  title: { fontWeight: "bold", marginBottom: 8, textAlign: "center" },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 24,
    elevation: 4,
  },
  input: { marginBottom: 16, backgroundColor: "#ffffff" },
  button: {
    marginTop: 8,
    borderRadius: 10,
    height: 48,
    justifyContent: "center",
    backgroundColor: "#f97316",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },
  link: { marginLeft: 4 },
});
