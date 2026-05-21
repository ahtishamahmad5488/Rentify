import { StatusBar } from 'react-native';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '../store/useAuthStore';

// Common
import SplashScreen from '../screens/common/SplashScreen';
import OnboardingScreen from '../screens/common/OnboardingScreen';

// Auth
import SignupScreen from '../screens/auth/SignupScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import FogetPasswordScreen from '../screens/auth/FogetPasswordScreen';
import OtpVerifyResetScreen from '../screens/auth/OtpVerifyResetScreen';
import CreatePasswordScreen from '../screens/auth/CreatePasswordScreen';

// Main app
import DrawerNavigationScreen from './drawer/DrawerNavigationScreen';
import RoomDetailScreen from '../screens/main/rooms/RoomDetailScreen';
import BookingScreen from '../screens/main/rooms/BookingScreen';
import PaymentScreen from '../screens/main/rooms/PaymentScreen';
import ChatDetailScreen from '../screens/main/chats/ChatDetailScreen';
import NotificationScreen from '../screens/main/NotificationScreen';
import WelcomeScreen from '../screens/main/WelcomeScreen';

// Profile sub-screens
import EditProfileScreen from '../screens/main/profile/EditProfileScreen';
import ChangePasswordScreen from '../screens/main/profile/ChangePasswordScreen';
import LanguageScreen from '../screens/main/profile/LanguageScreen';
import HelpScreen from '../screens/main/profile/HelpScreen';
import SendFeedbackScreen from '../screens/main/profile/SendFeedbackScreen';
import AboutScreen from '../screens/main/profile/AboutScreen';
import Header from '../components/Header';
import ChatBotScreen from '../screens/main/chatBotScreen';
const Stack = createNativeStackNavigator();

export default function StackNavigationScreen() {
  const [showSplash, setShowSplash] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(t);
  }, []);

  const token = useAuthStore(state => state.token);

  return (
    <>
      <NavigationContainer>
        <StatusBar barStyle="dark-content" />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {showSplash ? (
            // ── Splash (always first) ──────────────────────────────────────
            <Stack.Screen name="splash" component={SplashScreen} />
          ) : token ? (
            // ── Authenticated screens ──────────────────────────────────────
            <>
              <Stack.Screen
                name="drawer-navigation"
                component={DrawerNavigationScreen}
              />
              <Stack.Screen
                name="room-details"
                component={RoomDetailScreen}
                options={{ animation: 'slide_from_bottom' }}
              />
              <Stack.Screen
                name="booking"
                component={BookingScreen}
                options={{ animation: 'slide_from_bottom' }}
              />
              <Stack.Screen
                name="payment"
                component={PaymentScreen}
                options={{ animation: 'slide_from_bottom' }}
              />
              <Stack.Screen
                name="chat-details"
                component={ChatDetailScreen}
                options={{ animation: 'slide_from_bottom' }}
              />
              <Stack.Screen
                name="notication"
                component={NotificationScreen}
                options={{
                  headerShown: true,
                  animation: 'slide_from_bottom',
                  header: () => <Header title="Notifications" />,
                }}
              />
              <Stack.Screen
                name="AI"
                component={ChatBotScreen}
                options={{ animation: 'slide_from_bottom' }}
              />
              <Stack.Screen
                name="edit-profile"
                component={EditProfileScreen}
                options={{
                  headerShown: true,
                  animation: 'slide_from_bottom',
                  header: () => <Header title="Edit Profile" />,
                }}
              />
              <Stack.Screen
                name="change-password"
                component={ChangePasswordScreen}
                options={{
                  headerShown: true,
                  header: () => <Header title="Change Password" />,
                  animation: 'slide_from_bottom',
                }}
              />
              <Stack.Screen
                name="language"
                component={LanguageScreen}
                options={{
                  headerShown: true,
                  header: () => <Header title="Language" />,
                  animation: 'slide_from_bottom',
                }}
              />
              <Stack.Screen
                name="help"
                component={HelpScreen}
                options={{
                  headerShown: true,
                  header: () => <Header title="Help Center" />,
                  animation: 'slide_from_bottom',
                }}
              />
              <Stack.Screen
                name="send-feedback"
                component={SendFeedbackScreen}
                options={{
                  headerShown: true,
                  header: () => <Header title="Send Feedback" />,
                  animation: 'slide_from_bottom',
                }}
              />
              <Stack.Screen
                name="about-us"
                component={AboutScreen}
                options={{
                  headerShown: true,
                  header: () => <Header title="About Us" />,
                  animation: 'slide_from_bottom',
                }}
              />
            </>
          ) : (
            // ── Unauthenticated screens ────────────────────────────────────
            <>
              <Stack.Screen
                name="welcome"
                component={WelcomeScreen}
                options={{ animation: 'slide_from_bottom' }}
              />
              <Stack.Screen
                name="onboarding"
                component={OnboardingScreen}
                options={{ animation: 'slide_from_bottom' }}
              />
              <Stack.Screen
                name="login"
                component={LoginScreen}
                options={{ animation: 'slide_from_bottom' }}
              />
              <Stack.Screen
                name="signup"
                component={SignupScreen}
                options={{ animation: 'slide_from_bottom' }}
              />
              <Stack.Screen
                name="forgot-password"
                component={FogetPasswordScreen}
                options={{ animation: 'slide_from_bottom' }}
              />
              <Stack.Screen
                name="otp-verify"
                component={OtpVerifyResetScreen}
                options={{ animation: 'slide_from_bottom' }}
              />
              <Stack.Screen
                name="create-password"
                component={CreatePasswordScreen}
                options={{ animation: 'slide_from_bottom' }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
      <Toast />
    </>
  );
}
