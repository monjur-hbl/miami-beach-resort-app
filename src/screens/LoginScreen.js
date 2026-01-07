// Miami Beach Resort - Login Screen

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../context/AuthContext';
import Colors from '../constants/colors';

const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter username and password');
      return;
    }

    setLoading(true);
    try {
      const result = await login(username.trim(), password);
      if (!result.success) {
        Alert.alert('Login Failed', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar style="light" />
      
      {/* Background gradient effect */}
      <View style={styles.backgroundTop} />
      
      <View style={styles.content}>
        {/* Logo/Header */}
        <View style={styles.header}>
          <Text style={styles.emoji}>🏨</Text>
          <Text style={styles.title}>MIAMI BEACH</Text>
          <Text style={styles.subtitle}>RESORT</Text>
          <Text style={styles.location}>Cox's Bazar, Bangladesh</Text>
        </View>

        {/* Login Form */}
        <View style={styles.form}>
          <Text style={styles.formTitle}>Staff Login</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor={Colors.textMuted}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={Colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>

          {/* Demo credentials hint */}
          <View style={styles.hint}>
            <Text style={styles.hintText}>Demo Accounts:</Text>
            <Text style={styles.hintCredential}>admin / admin123</Text>
            <Text style={styles.hintCredential}>frontdesk / fd123</Text>
            <Text style={styles.hintCredential}>hkteam / team123</Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>Front Desk Management System v1.0</Text>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.darkSlate,
  },
  backgroundTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: Colors.teal,
    opacity: 0.3,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  emoji: {
    fontSize: 60,
    marginBottom: 15,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.gold,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '300',
    color: Colors.white,
    letterSpacing: 4,
  },
  location: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  form: {
    width: '100%',
    maxWidth: 350,
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 30,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 25,
  },
  input: {
    backgroundColor: Colors.cardHover,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: 12,
    padding: 16,
    color: Colors.white,
    fontSize: 16,
    marginBottom: 15,
  },
  button: {
    backgroundColor: Colors.teal,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  hint: {
    marginTop: 25,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    alignItems: 'center',
  },
  hintText: {
    color: Colors.textMuted,
    fontSize: 12,
    marginBottom: 8,
  },
  hintCredential: {
    color: Colors.textSecondary,
    fontSize: 11,
    marginBottom: 3,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    color: Colors.textMuted,
    fontSize: 12,
  },
});

export default LoginScreen;
