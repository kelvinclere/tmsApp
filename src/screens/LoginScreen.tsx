import React, { useState } from 'react';
import { View, StyleSheet, Image, Alert } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    const response = await login({ email, password });

    if (!response.success) {
      Alert.alert('Error', response.error || 'Login failed');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text variant="headlineMedium" style={[styles.cardTitle, { color: '#2563eb' }]}>
          Welcome Back
        </Text>
        <Image
          source={require('../../assets/images/icon.png')}
          style={styles.cardLogo}
          resizeMode="contain"
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
              icon={secureText ? 'eye-off-outline' : 'eye-outline'}
              onPress={() => setSecureText(!secureText)}
              color="#ff7900"
            />
          }
        />

        <Button
          mode="contained"
          textColor="white"
          onPress={handleLogin}
          style={styles.button}
          loading={loading}
          disabled={loading}
        >
          {loading ? '' : 'Login'}
        </Button>
      </View>

      <View style={styles.footer}>
        <Text variant="bodyMedium" style={{ color: '#64748b' }}>
          Don’t have an account?
        </Text>
        <Button
          compact
          onPress={() => navigation.navigate('Register')}
          style={styles.link}
          labelStyle={{ color: '#ff7900', fontWeight: '600' }}
          disabled={loading}
        >
          Sign up
        </Button>
      </View>
    </View>
  );
}

const inputTheme = {
  roundness: 10,
  colors: {
    primary: '#2563eb',
    background: '#ffffff',
    placeholder: '#94a3b8',
    text: '#1e293b',
  },
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingVertical: 32, justifyContent: 'center' },
  card: { backgroundColor: '#ffffff', borderRadius: 12, padding: 24, elevation: 4, alignItems: 'center' },
  cardTitle: { fontWeight: 'bold', marginBottom: 16, textAlign: 'center' }, 
  cardLogo: { height: 100, width: 140, alignSelf: 'center', marginBottom: 50 },
  input: { marginBottom: 16, backgroundColor: '#ffffff', width: '100%' },
  button: { marginTop: 8, borderRadius: 10, height: 48, justifyContent: 'center', backgroundColor: '#f97316', width: '100%' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 24 },
  link: { marginLeft: 4 },
});