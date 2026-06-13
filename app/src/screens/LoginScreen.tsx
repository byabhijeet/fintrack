import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../theme';
import { useAuthStore } from '../store/authStore';

export default function LoginScreen() {
  const { colors, typography, spacing, borderRadius } = useAppTheme();
  const { signIn, verifyOtp, signInWithPassword } = useAuthStore();
  
  const [loginMode, setLoginMode] = useState<'otp' | 'password'>('password');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return;
    }
    setLoading(true);
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
    const { error } = await signIn(formattedPhone);
    setLoading(false);
    
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setStep('otp');
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }
    setLoading(true);
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
    const { error } = await verifyOtp(formattedPhone, otp);
    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handlePasswordLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    setLoading(true);
    const { error } = await signInWithPassword(email, password);
    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
    }
  };

  const renderOtpForm = () => (
    <>
      <Text style={[typography.bodyMd, { color: colors.textSecondary, marginBottom: spacing.xl }]}>
        {step === 'phone' 
          ? 'Enter your mobile number to get started.' 
          : `We sent a 6-digit code to +91 ${phoneNumber}`}
      </Text>

      {step === 'phone' ? (
        <TextInput
          style={[
            styles.input,
            typography.bodyMd,
            { 
              backgroundColor: colors.inputBackground, 
              color: colors.textPrimary,
              borderRadius: borderRadius.pill,
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.md,
              marginBottom: spacing.xl
            }
          ]}
          placeholder="Mobile Number"
          placeholderTextColor={colors.textMuted}
          keyboardType="phone-pad"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          maxLength={10}
        />
      ) : (
        <TextInput
          style={[
            styles.input,
            typography.bodyMd,
            { 
              backgroundColor: colors.inputBackground, 
              color: colors.textPrimary,
              borderRadius: borderRadius.pill,
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.md,
              marginBottom: spacing.xl,
              textAlign: 'center',
              letterSpacing: 4
            }
          ]}
          placeholder="000000"
          placeholderTextColor={colors.textMuted}
          keyboardType="number-pad"
          value={otp}
          onChangeText={setOtp}
          maxLength={6}
        />
      )}

      <TouchableOpacity 
        style={[
          styles.button, 
          { 
            backgroundColor: colors.primary,
            borderRadius: borderRadius.pill,
            paddingVertical: spacing.md,
          }
        ]}
        onPress={step === 'phone' ? handleSendOtp : handleVerifyOtp}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#000000" />
        ) : (
          <Text style={[typography.labelCaps, { color: '#000000', textAlign: 'center' }]}>
            {step === 'phone' ? 'Send OTP' : 'Verify & Continue'}
          </Text>
        )}
      </TouchableOpacity>
      
      {step === 'otp' && (
        <TouchableOpacity 
          style={{ marginTop: spacing.lg }} 
          onPress={() => setStep('phone')}
        >
          <Text style={[typography.bodySm, { color: colors.primary, textAlign: 'center' }]}>
            Change mobile number
          </Text>
        </TouchableOpacity>
      )}

      {step === 'phone' && (
        <TouchableOpacity 
          style={{ marginTop: spacing.lg }} 
          onPress={() => setLoginMode('password')}
        >
          <Text style={[typography.bodySm, { color: colors.textSecondary, textAlign: 'center' }]}>
            Login with Email & Password
          </Text>
        </TouchableOpacity>
      )}
    </>
  );

  const renderPasswordForm = () => (
    <>
      <Text style={[typography.bodyMd, { color: colors.textSecondary, marginBottom: spacing.xl }]}>
        Enter your email and password to log in.
      </Text>

      <TextInput
        style={[
          styles.input,
          typography.bodyMd,
          { 
            backgroundColor: colors.inputBackground, 
            color: colors.textPrimary,
            borderRadius: borderRadius.pill,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            marginBottom: spacing.md
          }
        ]}
        placeholder="Email Address"
        placeholderTextColor={colors.textMuted}
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={[
          styles.input,
          typography.bodyMd,
          { 
            backgroundColor: colors.inputBackground, 
            color: colors.textPrimary,
            borderRadius: borderRadius.pill,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            marginBottom: spacing.xl
          }
        ]}
        placeholder="Password"
        placeholderTextColor={colors.textMuted}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity 
        style={[
          styles.button, 
          { 
            backgroundColor: colors.primary,
            borderRadius: borderRadius.pill,
            paddingVertical: spacing.md,
          }
        ]}
        onPress={handlePasswordLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#000000" />
        ) : (
          <Text style={[typography.labelCaps, { color: '#000000', textAlign: 'center' }]}>
            Login
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity 
        style={{ marginTop: spacing.lg }} 
        onPress={() => setLoginMode('otp')}
      >
        <Text style={[typography.bodySm, { color: colors.textSecondary, textAlign: 'center' }]}>
          Login with Phone OTP
        </Text>
      </TouchableOpacity>
    </>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.keyboardView}
      >
        <View style={[styles.content, { padding: spacing.lg }]}>
          <Text style={[typography.displayLg, { color: colors.textPrimary, marginBottom: spacing.md }]}>
            {loginMode === 'otp' && step === 'otp' ? 'Enter OTP' : 'Welcome to BillZest'}
          </Text>

          {loginMode === 'otp' ? renderOtpForm() : renderPasswordForm()}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  input: {
    width: '100%',
  },
  button: {
    width: '100%',
    shadowColor: '#1ED760',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  }
});
