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
            justifyContent: 'center',
        },
        container: {
            flex: 1,
            justifyContent: 'center',
            padding: 20,
            backgroundColor: colors.background
        },
        title: {
            fontSize: 32,
            fontWeight: 'bold',
            marginBottom: 30,
            textAlign: 'center',
            color: colors.primary,
        },
        input: {
            height: 50,
            borderColor: colors.border,
            borderWidth: 1,
            marginBottom: 15,
            paddingHorizontal: 15,
            borderRadius: 8,
            fontSize: 16,
            backgroundColor: colors.card,
            color: colors.text,
        },
        button: {
            backgroundColor: colors.primary,
            paddingVertical: 15,
            borderRadius: 8,
            alignItems: 'center',
            marginBottom: 20,
            marginTop: 10,
        },
        buttonText: {
            color: colors.card,
            fontSize: 16,
            fontWeight: 'bold',
        },
        linkText: {
            color: colors.primary,
            textAlign: 'center',
            fontSize: 16,
        }
    });

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }} >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.container}>
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