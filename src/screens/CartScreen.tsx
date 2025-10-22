// src/screens/CartScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function CartScreen() {
    // Por enquanto, apenas uma tela placeholder
    // A lógica do carrinho virá no próximo passo com Context API

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Meu Carrinho</Text>
            <Text style={styles.emptyText}>Seu carrinho está vazio.</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f8f8f8',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
    }
});