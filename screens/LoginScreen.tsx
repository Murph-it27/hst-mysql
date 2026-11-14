
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { login } from '../services/authService';
import { useTheme } from '../contexts/ThemeContext';

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation<any>();
  const { theme } = useTheme();

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Error', 'Please enter your email and password.');
      return;
    }

    try {
      setLoading(true);
      await login(email.trim(), password);
      navigation.replace('MainTabs');
    } catch (error: any) {
      Alert.alert('Login Failed', error?.message || 'Unable to login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.backgroundColor },
      ]}
    >
      <View style={styles.formCard}>
        <Text style={[styles.title, { color: theme.textColor }]}>
          Welcome Back
        </Text>

        <Text style={[styles.subtitle, { color: theme.mutedColor }]}>
          Login to your HomeStock account
        </Text>

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.inputBackground,
              color: theme.inputTextColor,
            },
          ]}
          placeholder="Email"
          placeholderTextColor={theme.mutedColor}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.inputBackground,
              color: theme.inputTextColor,
            },
          ]}
          placeholder="Password"
          placeholderTextColor={theme.mutedColor}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: theme.buttonColor },
          ]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={[styles.buttonText, { color: theme.buttonTextColor }]}>
            {loading ? 'Logging in...' : 'Login'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.textButton}
          onPress={() => navigation.navigate('ForgotPasswordScreen')}
        >
          <Text style={[styles.linkText, { color: theme.accentColor }]}>
            Forgot Password?
          </Text>
        </TouchableOpacity>

        <View style={styles.signupSection}>
          <Text style={[styles.accountText, { color: theme.textColor }]}>
            Don't have an account?
          </Text>

          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: theme.buttonColor },
            ]}
            onPress={() => navigation.navigate('SignupScreen')}
          >
            <Text
              style={[styles.buttonText, { color: theme.buttonTextColor }]}
            >
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  formCard: {
    width: 400,
    maxWidth: '100%',
    alignSelf: 'center',
    alignItems: 'center',
    padding: 25,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 25,
  },

  input: {
    width: '100%',
    maxWidth: 350,
    height: 48,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 15,
    paddingHorizontal: 14,
    borderRadius: 10,
    fontSize: 15,
  },

  button: {
    width: '100%',
    maxWidth: 350,
    padding: 15,
    borderRadius: 10,
    marginTop: 8,
    alignItems: 'center',
  },

  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  textButton: {
    alignItems: 'center',
    paddingVertical: 14,
  },

  linkText: {
    fontSize: 14,
    fontWeight: '600',
  },

  accountText: {
    fontSize: 14,
    textAlign: 'center',
  },

  signupSection: {
    marginTop: 8,
    alignItems: 'center',
    width: '100%',
  },

  loginSection: {
    marginTop: 22,
    alignItems: 'center',
    width: '100%',
  },
});

export default LoginScreen;
