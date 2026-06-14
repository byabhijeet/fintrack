import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Alert } from '@/lib/alert';
import { Eye, EyeOff } from 'lucide-react-native';
import { useAppTheme } from '../theme';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';

export default function LoginScreen() {
  const { colors, typography, spacing, borderRadius } = useAppTheme();
  const { signIn, verifyOtp, signInWithPassword, signUp } = useAuthStore();
  
  const [loginMode, setLoginMode] = useState<'otp' | 'password' | 'signup'>('password');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [signupStep, setSignupStep] = useState<'details' | 'otp'>('details');
  const [signupOtp, setSignupOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

  const handleSignupSendOtp = async () => {
    if (!email || !password || !fullName || !phoneNumber) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    setLoading(true);
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
    const { error } = await signUp(formattedPhone, fullName, email);
    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setSignupStep('otp');
    }
  };

  const handleSignupVerifyOtp = async () => {
    if (!signupOtp || signupOtp.length < 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }
    setLoading(true);
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
    const { error: verifyError } = await verifyOtp(formattedPhone, signupOtp);

    if (verifyError) {
      Alert.alert('Error', verifyError.message);
      setLoading(false);
      return;
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
        data: {
          full_name: fullName,
          email_confirmed: true,
        },
      });

      if (updateError) {
        Alert.alert('Error', 'Verified, but could not set password: ' + updateError.message);
        setLoading(false);
        return;
      }

      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        await supabase
          .from('accounts')
          .update({ email, full_name: fullName })
          .eq('auth_id', currentUser.id);
      }
    } catch (err) {
      Alert.alert('Error', 'Verified, but failed to finalize account.');
    }

    setLoading(false);
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

      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg }}>
        <TouchableOpacity onPress={() => setLoginMode('password')} style={{ marginRight: spacing.md }}>
          <Text style={[typography.bodySm, { color: colors.textSecondary }]}>
            Use Email
          </Text>
        </TouchableOpacity>
        <Text style={[typography.bodySm, { color: colors.textMuted }]}>|</Text>
        <TouchableOpacity onPress={() => setLoginMode('signup')} style={{ marginLeft: spacing.md }}>
          <Text style={[typography.bodySm, { color: colors.primary }]}>
            Join Now
          </Text>
        </TouchableOpacity>
      </View>
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

      <View style={[styles.passwordContainer, { marginBottom: spacing.xl }]}>
        <TextInput
          style={[
            styles.input,
            typography.bodyMd,
            {
              backgroundColor: colors.inputBackground,
              color: colors.textPrimary,
              borderRadius: borderRadius.pill,
              paddingLeft: spacing.lg,
              paddingRight: 50,
              paddingVertical: spacing.md,
            }
          ]}
          placeholder="Password"
          placeholderTextColor={colors.textMuted}
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <EyeOff size={20} color={colors.textSecondary} />
          ) : (
            <Eye size={20} color={colors.textSecondary} />
          )}
        </TouchableOpacity>
      </View>

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

      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg }}>
        <TouchableOpacity onPress={() => setLoginMode('otp')} style={{ marginRight: spacing.md }}>
          <Text style={[typography.bodySm, { color: colors.textSecondary }]}>
            Use OTP
          </Text>
        </TouchableOpacity>
        <Text style={[typography.bodySm, { color: colors.textMuted }]}>|</Text>
        <TouchableOpacity onPress={() => setLoginMode('signup')} style={{ marginLeft: spacing.md }}>
          <Text style={[typography.bodySm, { color: colors.primary }]}>
            Join Now
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderSignupForm = () => (
    <>
      <Text style={[typography.bodyMd, { color: colors.textSecondary, marginBottom: spacing.xl }]}>
        {signupStep === 'details' 
          ? 'Create a new account to get started.' 
          : `We sent a 6-digit code to +91 ${phoneNumber}`}
      </Text>

      {signupStep === 'details' ? (
        <>
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
            placeholder="Full Name"
            placeholderTextColor={colors.textMuted}
            value={fullName}
            onChangeText={setFullName}
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
                marginBottom: spacing.md
              }
            ]}
            placeholder="Mobile Number"
            placeholderTextColor={colors.textMuted}
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            maxLength={10}
          />
          <View style={[styles.passwordContainer, { marginBottom: spacing.xl }]}>
            <TextInput
              style={[
                styles.input,
                typography.bodyMd,
                {
                  backgroundColor: colors.inputBackground,
                  color: colors.textPrimary,
                  borderRadius: borderRadius.pill,
                  paddingLeft: spacing.lg,
                  paddingRight: 50,
                  paddingVertical: spacing.md,
                }
              ]}
              placeholder="Password"
              placeholderTextColor={colors.textMuted}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff size={20} color={colors.textSecondary} />
              ) : (
                <Eye size={20} color={colors.textSecondary} />
              )}
            </TouchableOpacity>
          </View>
        </>
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
          value={signupOtp}
          onChangeText={setSignupOtp}
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
        onPress={signupStep === 'details' ? handleSignupSendOtp : handleSignupVerifyOtp}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#000000" />
        ) : (
          <Text style={[typography.labelCaps, { color: '#000000', textAlign: 'center' }]}>
            {signupStep === 'details' ? 'Sign Up' : 'Verify & Complete'}
          </Text>
        )}
      </TouchableOpacity>

      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg }}>
        <Text style={[typography.bodySm, { color: colors.textSecondary }]}>
          Already have an account?{' '}
        </Text>
        <TouchableOpacity onPress={() => setLoginMode('password')}>
          <Text style={[typography.bodySm, { color: colors.primary }]}>
            Log In
          </Text>
        </TouchableOpacity>
      </View>
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
            {loginMode === 'otp' && step === 'otp' 
              ? 'Enter OTP' 
              : loginMode === 'signup' 
                ? 'Join BillZest' 
                : 'Welcome to BillZest'}
          </Text>

          {loginMode === 'otp' && renderOtpForm()}
          {loginMode === 'password' && renderPasswordForm()}
          {loginMode === 'signup' && renderSignupForm()}
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
  passwordContainer: {
    width: '100%',
    position: 'relative',
    justifyContent: 'center',
  },
  eyeIcon: {
    position: 'absolute',
    right: 20,
    zIndex: 1,
  },
  button: {
    width: '100%',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  }
});