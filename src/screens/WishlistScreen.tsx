// src/screens/WishlistScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext'; // 1. Importar

export default function WishlistScreen() {
    const { colors } = useTheme(); // 2. Obter cores

    // 3. Mover StyleSheet para dentro
    const styles = StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: colors.background, // Cor do tema
            padding: 20,
        },
        title: {
            fontSize: 24,
            fontWeight: 'bold',
            color: colors.text, // Cor do tema
            marginBottom: 10,
        },
        placeholder: {
            fontSize: 16,
            color: colors.textSecondary, // Cor do tema
        }
    });

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Lista de Desejos</Text>
            <Text style={styles.placeholder}>Em breve...</Text>
        </View>
    );
}