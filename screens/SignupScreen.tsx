
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
import { signup } from '../services/authService';
import { useTheme } from '../contexts/ThemeContext';

const SignupScreen: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation<any>();
  const { theme } = useTheme();

  const handleSignup = async () => {
    if (!username.trim() || !email.trim() || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    if (!/^[A-Za-z0-9_]{3,20}$/.test(username.trim())) {
      Alert.alert(
        'Invalid Username',
        'Username must be 3-20 characters and contain only letters, numbers or underscores.'
      );
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Invalid Password', 'Password must be at least 6 characters.');
      return;
    }

    try {
      setLoading(true);
      await signup(username.trim(), email.trim(), password);

      Alert.alert('Success', 'Account created successfully.');
      navigation.replace('MainTabs');
    } catch (error: any) {
      Alert.alert(
        'Signup Failed',
        error?.message || 'Unable to create your account.'
      );
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
          Create Account
        </Text>

        <Text style={[styles.subtitle, { color: theme.mutedColor }]}>
          Start managing your household with HomeStock
        </Text>

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.inputBackground,
              color: theme.inputTextColor,
            },
          ]}
          placeholder="Username"
          placeholderTextColor={theme.mutedColor}
          value={username}
          onChangeText={setUsername}
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
          onPress={handleSignup}
          disabled={loading}
        >
          <Text style={[styles.buttonText, { color: theme.buttonTextColor }]}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </Text>
        </TouchableOpacity>

        <View style={styles.loginSection}>
          <Text style={[styles.accountText, { color: theme.textColor }]}>
            Already have an account?
          </Text>

          <TouchableOpacity
            style={styles.textButton}
            onPress={() => navigation.navigate('LoginScreen')}
          >
            <Text style={[styles.linkText, { color: theme.accentColor }]}>
              Login
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

export default SignupScreen;
