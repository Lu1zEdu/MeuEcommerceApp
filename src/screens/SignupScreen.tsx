// src/screens/SignupScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import { RootStackParamList } from '../types/navigation';
import { useTheme } from '../context/ThemeContext'; // 1. Importar
import { lightColors } from '../theme/colors'; // Para keyboardAppearance

type SignupScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Signup'>;

export default function SignupScreen() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigation = useNavigation<SignupScreenNavigationProp>();
    const { colors } = useTheme(); // 2. Obter cores

    const handleSignup = async () => {
        // ... (lógica de signup inalterada) ...
        if (!name || !email || !password || !confirmPassword) {
            Alert.alert("Erro", "Por favor, preencha todos os campos.");
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert("Erro", "As senhas não coincidem.");
            return;
        }
        if (password.length < 6) {
            Alert.alert("Erro", "A senha deve ter pelo menos 6 caracteres.");
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            await updateProfile(user, { displayName: name });
            console.log('Cadastro e atualização de perfil bem-sucedidos!');
            Alert.alert("Sucesso", `Conta para ${name} criada com sucesso! Faça o login agora.`);
            navigation.navigate('Login');
        } catch (error: any) {
            // ... (tratamento de erro inalterado) ...
            console.error("Erro no cadastro:", error);
            let errorMessage = "Não foi possível criar a conta.";
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'Este endereço de e-mail já está em uso.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'O endereço de e-mail fornecido não é válido.';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'A senha é muito fraca. Use pelo menos 6 caracteres.';
            }
            Alert.alert("Erro no Cadastro", errorMessage);
        }
    };

    // 3. Mover StyleSheet para dentro
    const styles = StyleSheet.create({
        scrollContainer: {
            flexGrow: 1,
            justifyContent: 'center',
        },
        container: {
            justifyContent: 'center',
            padding: 20,
            backgroundColor: colors.background, // Cor do tema
        },
        title: {
            fontSize: 28,
            fontWeight: 'bold',
            marginBottom: 25,
            textAlign: 'center',
            color: colors.text, // Cor do tema
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
            // Usar uma cor diferente para cadastro? Ou manter primary?
            backgroundColor: '#28a745', // Verde mantido por enquanto
            paddingVertical: 15,
            borderRadius: 8,
            alignItems: 'center',
            marginBottom: 20,
            marginTop: 10,
        },
        buttonText: {
            color: colors.card, // Texto branco
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
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1, backgroundColor: colors.background }} // Fundo no KAV
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.container}>
                    {/* Título será colorido pelo header do AppNavigator */}
                    {/* <Text style={styles.title}>Criar Conta</Text> */}
                    <TextInput
                        style={styles.input}
                        placeholder="Nome Completo"
                        placeholderTextColor={colors.placeholder}
                        value={name}
                        onChangeText={setName}
                        autoCapitalize="words"
                        keyboardAppearance={colors.text === lightColors.text ? 'light' : 'dark'}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="E-mail"
                        placeholderTextColor={colors.placeholder}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        keyboardAppearance={colors.text === lightColors.text ? 'light' : 'dark'}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Senha (mínimo 6 caracteres)"
                        placeholderTextColor={colors.placeholder}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        keyboardAppearance={colors.text === lightColors.text ? 'light' : 'dark'}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Confirmar Senha"
                        placeholderTextColor={colors.placeholder}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                        keyboardAppearance={colors.text === lightColors.text ? 'light' : 'dark'}
                    />
                    <TouchableOpacity style={styles.button} onPress={handleSignup}>
                        <Text style={styles.buttonText}>Cadastrar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text style={styles.linkText}>Já tem uma conta? Faça login</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}