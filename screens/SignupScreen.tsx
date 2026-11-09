import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity, ColorValue } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { signup } from '../services/authService';
import { useTheme } from '../contexts/ThemeContext';

import { RootStackParamList } from '../App';

type SignupScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SignupScreen'>;

const SignupScreen: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation<SignupScreenNavigationProp>();
  const { theme } = useTheme();

  const handleSignup = async () => {
    if (!username || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (!/^[A-Za-z0-9_]{3,20}$/.test(username)) {
      Alert.alert('Error', 'User ID must be 3-20 characters: letters, numbers or underscore');
      return;
    }
    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    try {
      await signup(username, email, password);
      Alert.alert('Success', 'Account created successfully');
      navigation.replace('MainTabs');
    } catch (error: any) {
      Alert.alert('Signup Failed', error.message);
    }
  };

  const children = (
    <>
      <Text style={[styles.title, { color: theme.textColor }]}>Create a new account</Text>
      <TextInput
        style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.inputTextColor }]}
        placeholder="User Name"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.inputTextColor }]}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.inputTextColor }]}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={[styles.button, { backgroundColor: theme.buttonColor }]} onPress={handleSignup}>
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
});

export default SignupScreen;
