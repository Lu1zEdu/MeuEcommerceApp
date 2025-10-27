import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import { RootStackParamList } from '../types/navigation';
import { useTheme } from '../context/ThemeContext';
import { lightColors } from '../theme/colors';
import { useTranslation } from 'react-i18next';

type SignupScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Signup'>;

export default function SignupScreen() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigation = useNavigation<SignupScreenNavigationProp>();
    const { colors } = useTheme();
    const { t } = useTranslation();

    const handleSignup = async () => {
        if (!name || !email || !password || !confirmPassword) {
            Alert.alert(t('alertErrorTitle'), t('errorFillFields'));
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert(t('alertErrorTitle'), t('errorPasswordsMismatch'));
            return;
        }
        if (password.length < 6) {
            Alert.alert(t('alertErrorTitle'), t('errorPasswordTooShort'));
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            await updateProfile(user, { displayName: name });
            console.log('Cadastro e atualização de perfil bem-sucedidos!');
            Alert.alert(t('alertSuccessTitle'), t('successAccountCreated', { name: name }));
            navigation.navigate('Login');
        } catch (error: any) {
            console.error("Erro no cadastro:", error);
            let errorMessage = t('errorSignupFailed');
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = t('errorEmailInUse');
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = t('errorInvalidEmail');
            } else if (error.code === 'auth/weak-password') {
                errorMessage = t('errorWeakPassword');
            }
            Alert.alert(t('alertErrorTitle'), errorMessage);
        }
    };

    const styles = StyleSheet.create({
        scrollContainer: {
            flexGrow: 1,
            justifyContent: 'center',
        },
        container: {
            justifyContent: 'center',
            padding: 20,
            backgroundColor: colors.background,
        },
        title: {
            fontSize: 28,
            fontWeight: 'bold',
            marginBottom: 25,
            textAlign: 'center',
            color: colors.text,
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
            backgroundColor: '#28a745',
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
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1, backgroundColor: colors.background }}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.container}>
                    <TextInput
                        style={styles.input}
                        placeholder={t('signupNamePlaceholder')}
                        placeholderTextColor={colors.placeholder}
                        value={name}
                        onChangeText={setName}
                        autoCapitalize="words"
                        keyboardAppearance={colors.text === lightColors.text ? 'light' : 'dark'}
                    />
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
                        placeholder={t('signupPasswordMinChars')}
                        placeholderTextColor={colors.placeholder}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        keyboardAppearance={colors.text === lightColors.text ? 'light' : 'dark'}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder={t('signupPasswordConfirmPlaceholder')}
                        placeholderTextColor={colors.placeholder}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                        keyboardAppearance={colors.text === lightColors.text ? 'light' : 'dark'}
                    />
                    <TouchableOpacity style={styles.button} onPress={handleSignup}>
                        <Text style={styles.buttonText}>{t('signupButton')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text style={styles.linkText}>{t('signupLoginLink')}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}