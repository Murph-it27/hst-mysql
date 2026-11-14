import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as SplashScreen from 'expo-splash-screen';
import { useTheme } from '../contexts/ThemeContext';

type RootStackParamList = {
  SplashScreen: undefined;
  LoginScreen: undefined;
  SignupScreen: undefined;
  ForgotPasswordScreen: undefined;
  HomeScreen: undefined;
  AddItemScreen: { item?: any };
  ReportsScreen: undefined;
  ProfileScreen: undefined;
};

type SplashScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SplashScreen'>;

const SplashScreenComponent: React.FC = () => {
  const navigation = useNavigation<SplashScreenNavigationProp>();
  const { theme } = useTheme();

  useEffect(() => {
    const prepareApp = async () => {
      try {
        await SplashScreen.preventAutoHideAsync();
        setTimeout(async () => {
          await SplashScreen.hideAsync();
          navigation.replace('LoginScreen');
        }, 2000);
      } catch (error) {
        console.warn(error);
      }
    };

    prepareApp();
  }, [navigation]);

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <Image source={require('../assets/splash-icon.png')} style={styles.logo} />
      <Text style={[styles.text, { color: theme.textColor }]}></Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 450,
    height: 450,
    marginBottom: 20,
    resizeMode: 'contain',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default SplashScreenComponent;
