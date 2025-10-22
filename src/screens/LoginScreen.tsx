// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import { RootStackParamList } from '../types/navigation';
import { useTheme } from '../context/ThemeContext';
import { lightColors } from '../theme/colors';
import { useTranslation } from 'react-i18next';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigation = useNavigation<LoginScreenNavigationProp>();
    const { colors } = useTheme();
    const { t } = useTranslation();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert(t('alertErrorTitle'), t('errorFillFields'));
            return;
        }
        try {
            await signInWithEmailAndPassword(auth, email, password);
            console.log('Login bem-sucedido!');
        } catch (error: any) {
            console.error("Erro no login:", error);
            Alert.alert(t('alertErrorTitle'), t('errorLoginFailed'));
        }
    };

    const styles = StyleSheet.create({
        scrollContainer: {
            flexGrow: 1,
            justifyContent: 'center', // Centraliza o conteúdo dentro do ScrollView
        },
        container: {
            // flex: 1, // Removido
            justifyContent: 'center',
            padding: 20,
            backgroundColor: colors.background, // Cor do tema
        },
        title: {
            fontSize: 32, // Maior
            fontWeight: 'bold',
            marginBottom: 30, // Mais espaço
            textAlign: 'center',
            color: colors.primary, // Cor primária no título
        },
        input: {
            height: 50,
            borderColor: colors.border, // Cor do tema
            borderWidth: 1,
            marginBottom: 15,
            paddingHorizontal: 15,
            borderRadius: 8,
            fontSize: 16,
            backgroundColor: colors.card, // Cor do tema
            color: colors.text, // Cor do texto digitado
        },
        button: {
            backgroundColor: colors.primary, // Cor do tema
            paddingVertical: 15,
            borderRadius: 8,
            alignItems: 'center',
            marginBottom: 20,
            marginTop: 10,
        },
        buttonText: {
            color: colors.card, // Texto contrastante (branco)
            fontSize: 16,
            fontWeight: 'bold',
        },
        linkText: {
            color: colors.primary, // Cor do tema
            textAlign: 'center',
            fontSize: 16,
        }
    });

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }} >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.container}>
                    {/* 3. Usar t() para textos visíveis */}
                    <Text style={styles.title}>{t('loginTitle')}</Text>
                    <TextInput
                        style={styles.input}
                        placeholder={t('loginEmailPlaceholder')}
                        placeholderTextColor={colors.placeholder}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        keyboardAppearance={colors.text === lightColors.text ? 'light' : 'dark'}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder={t('loginPasswordPlaceholder')}
                        placeholderTextColor={colors.placeholder}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        keyboardAppearance={colors.text === lightColors.text ? 'light' : 'dark'}
                    />
                    <TouchableOpacity style={styles.button} onPress={handleLogin}>
                        <Text style={styles.buttonText}>{t('loginButton')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                        <Text style={styles.linkText}>{t('loginSignupLink')}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}