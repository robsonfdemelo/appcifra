import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { AppLogo } from '../components/AppLogo';
import { colors } from '../theme';

type Props = {
  onLogin: () => void;
};

export function LoginScreen({ onLogin }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.hero}>
            <AppLogo />
          </View>

          <View style={styles.form}>
            <View style={styles.inputShell}>
              <Text style={styles.inputIcon}>@</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="seu@email.com"
                placeholderTextColor="#98A2A0"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
              />
            </View>

            <View style={styles.inputShell}>
              <Text style={styles.inputIcon}>⌑</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Sua senha"
                placeholderTextColor="#98A2A0"
                secureTextEntry={!showPassword}
                style={styles.input}
              />
              <Pressable
                onPress={() => setShowPassword(value => !value)}
                style={styles.eyeButton}
              >
                <Text style={styles.eyeText}>{showPassword ? '◉' : '◎'}</Text>
              </Pressable>
            </View>

            <Pressable style={styles.primaryButton} onPress={onLogin}>
              <Text style={styles.primaryText}>Entrar</Text>
            </Pressable>

            <Pressable style={styles.googleButton} onPress={onLogin}>
              <View style={styles.googleMark}>
                <Text style={styles.googleLetter}>G</Text>
              </View>
              <Text style={styles.googleText}>Continuar com Google</Text>
            </Pressable>

            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.orText}>ou</Text>
              <View style={styles.divider} />
            </View>

            <Pressable style={styles.createButton} onPress={onLogin}>
              <Text style={styles.createText}>Criar conta</Text>
            </Pressable>
          </View>

          <View style={styles.bottomMessage}>
            <Text style={styles.bottomText}>Música boa aproxima pessoas</Text>
            <View style={styles.bottomAccent} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  flex: {
    flex: 1
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 44,
    paddingBottom: 28
  },
  hero: {
    alignItems: 'center',
    paddingTop: 18,
    paddingBottom: 46
  },
  form: {
    gap: 12
  },
  inputShell: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 15
  },
  inputIcon: {
    width: 28,
    color: '#6D7874',
    fontSize: 18,
    fontWeight: '800'
  },
  input: {
    flex: 1,
    minHeight: 56,
    color: colors.ink,
    fontSize: 16
  },
  eyeButton: {
    width: 42,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center'
  },
  eyeText: {
    color: '#66726E',
    fontSize: 18
  },
  primaryButton: {
    minHeight: 56,
    borderRadius: 16,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900'
  },
  googleButton: {
    minHeight: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10
  },
  googleMark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5'
  },
  googleLetter: {
    color: '#4285F4',
    fontWeight: '900',
    fontSize: 15
  },
  googleText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800'
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 7
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border
  },
  orText: {
    color: '#98A2A0',
    fontSize: 12
  },
  createButton: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center'
  },
  createText: {
    color: colors.greenDark,
    fontSize: 14,
    fontWeight: '900',
    textDecorationLine: 'underline'
  },
  bottomMessage: {
    flex: 1,
    minHeight: 120,
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  bottomText: {
    color: '#8A9490',
    fontSize: 12
  },
  bottomAccent: {
    width: 34,
    height: 3,
    borderRadius: 999,
    backgroundColor: colors.green,
    marginTop: 12
  }
});
