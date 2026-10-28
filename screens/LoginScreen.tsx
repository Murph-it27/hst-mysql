import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity, ColorValue } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { login } from '../services/authService';
import { useTheme } from '../contexts/ThemeContext';

import { RootStackParamList } from '../App';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'LoginScreen'>;

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { theme } = useTheme();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    try {
      await login(email, password);
      navigation.replace('MainTabs');
    } catch (error: any) {
      Alert.alert('Login Failed', error.message);
    }
  };

  const children = (
    <>
      <Text style={[styles.title, { color: theme.textColor }]}>Login</Text>
      <TextInput
        style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.inputTextColor }]}
        placeholder="Email or User ID"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.inputTextColor }]}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={[styles.button, { backgroundColor: theme.buttonColor }]} onPress={handleLogin}>
        <Text style={[styles.buttonText, { color: theme.buttonTextColor }]}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, { backgroundColor: theme.buttonColor }]} onPress={() => navigation.navigate('ForgotPasswordScreen')}>
        <Text style={[styles.buttonText, { color: theme.buttonTextColor }]}>Forgot Password</Text>
      </TouchableOpacity>
      <Text style={[styles.linkText, { color: theme.textColor }]}>Don't have an account?</Text>
      <TouchableOpacity style={[styles.button, { backgroundColor: theme.buttonColor }]} onPress={() => navigation.navigate('SignupScreen')}>
        <Text style={[styles.buttonText, { color: theme.buttonTextColor }]}>Sign Up</Text>
      </TouchableOpacity>
    </>
  );

  if (theme.backgroundGradient) {
    return (
      <LinearGradient
        colors={theme.backgroundGradient!}
        style={styles.container}
      >
        {children}
      </LinearGradient>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  button: {
    padding: 15,
    borderRadius: 20,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonContainer: {
    marginBottom: 10,
  },
  linkText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
});

export default LoginScreen;
