// src/screens/ProfileScreen.tsx
import React from 'react';
// 2. Importar Switch
import { View, Text, StyleSheet, Button, Image, Alert, Switch } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import { useTheme } from '../context/ThemeContext'; // 1. Importar useTheme

const defaultProfilePic = 'https://via.placeholder.com/150/CCCCCC/FFFFFF?text=User';

export default function ProfileScreen() {
    // 3. Obter dados do tema
    const { colors, isDarkTheme, toggleTheme } = useTheme();
    const user = auth.currentUser;

    const handleLogout = async () => {
        try {
            await signOut(auth);
            console.log("Logout da tela de Perfil");
        } catch (error: any) {
            console.error("Erro ao fazer logout:", error);
            Alert.alert("Erro", "Não foi possível fazer logout: " + error.message);
        }
    };

    // Adapta os estilos dinamicamente ou cria estilos separados
    const dynamicStyles = StyleSheet.create({
        container: {
            flex: 1,
            alignItems: 'center',
            paddingTop: 40,
            backgroundColor: colors.background, // Usa cor do tema
            paddingHorizontal: 20,
        },
        profileImage: {
            width: 120,
            height: 120,
            borderRadius: 60,
            marginBottom: 20,
            backgroundColor: colors.border, // Usa cor de borda como placeholder
        },
        userName: {
            fontSize: 22,
            fontWeight: 'bold',
            color: colors.text, // Usa cor do tema
            marginBottom: 8,
        },
        emailText: {
            fontSize: 16,
            color: colors.textSecondary, // Usa cor secundária
            marginBottom: 40,
        },
        buttonContainer: {
            width: '80%',
            marginBottom: 20,
        },
        themeToggleContainer: { // Container para o switch e label
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between', // Espaça o texto e o switch
            width: '80%', // Mesma largura do botão
            marginTop: 20,
            marginBottom: 20,
            paddingVertical: 10,
            paddingHorizontal: 15,
            backgroundColor: colors.card, // Fundo do card
            borderRadius: 8,
            borderWidth: 1,
            borderColor: colors.border,
        },
        themeToggleText: {
            fontSize: 16,
            color: colors.text,
        },
        placeholder: {
            fontSize: 16,
            color: colors.textSecondary,
            marginTop: 10,
        }
    });

    return (
        // Usa os estilos dinâmicos
        <View style={dynamicStyles.container}>
            <Image
                source={{ uri: user?.photoURL || defaultProfilePic }}
                style={dynamicStyles.profileImage}
            />
            <Text style={dynamicStyles.userName}>
                {user?.displayName || 'Nome não definido'}
            </Text>
            <Text style={dynamicStyles.emailText}>
                {user?.email ?? 'E-mail não encontrado'}
            </Text>

            {/* 4. Adicionar o controle do Tema */}
            <View style={dynamicStyles.themeToggleContainer}>
                <Text style={dynamicStyles.themeToggleText}>Tema Escuro</Text>
                <Switch
                    trackColor={{ false: "#767577", true: "#81b0ff" }} // Cores da trilha
                    thumbColor={isDarkTheme ? colors.primary : "#f4f3f4"} // Cor do botão (polegar)
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={toggleTheme} // Chama a função do contexto
                    value={isDarkTheme} // Define se está ligado ou desligado
                />
            </View>

            <View style={dynamicStyles.buttonContainer}>
                <Button title="Sair (Logout)" onPress={handleLogout} color={colors.notification} /> {/* Usa cor do tema */}
            </View>

            <Text style={dynamicStyles.placeholder}>Mais opções em breve...</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f8f8',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
    },
    emailText: {
        fontSize: 16,
        color: '#555',
        marginBottom: 30,
    },
    buttonContainer: {
        width: '80%', // Para limitar a largura do botão
        marginBottom: 20,
    },
    placeholder: {
        fontSize: 16,
        color: '#888',
        marginTop: 10,
    }
});