import { Platform } from 'react-native';

// Address of the hosted backend (e.g. your Render address). When this is filled in,
// the app (website or phone) always uses it and nothing needs to run on your computer.
const HOSTED_URL: string = ''; // e.g. 'https://hst-backend.onrender.com'

// Only used while developing on your own PC (backend running locally):
// - Android emulator : http://10.0.2.2:4000
// - iOS simulator/web: http://localhost:4000
// - Real phone       : set LAN_URL to http://<YOUR-PC-LAN-IP>:4000
const LAN_URL: string | null = null;

const localUrl = LAN_URL ?? (Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000');

export const API_URL = `${HOSTED_URL || localUrl}/api`;
