// src/screens/ProductDetailScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { PRODUCTS } from '../data/products';

// Definindo o tipo da propriedade de rota
type ProductDetailRouteProp = RouteProp<RootStackParamList, 'ProductDetail'>;

export default function ProductDetailScreen() {
    const route = useRoute<ProductDetailRouteProp>();
    const { productId } = route.params;

    // Encontra o produto pelo ID (em um app real, isso viria de uma API ou estado)
    const product = PRODUCTS.find(p => p.id === productId);

    if (!product) {
        return (
            <View style={styles.container}>
                <Text>Produto não encontrado!</Text>
            </View>
        );
    }

    const handleAddToCart = () => {
        // Lógica para adicionar ao carrinho (será implementada no próximo passo)
        console.log(`Adicionado ao carrinho: ${product.name}`);
        alert(`${product.name} adicionado ao carrinho!`); // Feedback simples por enquanto
    };

    return (
        <ScrollView style={styles.container}>
            <Image source={{ uri: product.imageUrl }} style={styles.image} />
            <View style={styles.detailsContainer}>
                <Text style={styles.name}>{product.name}</Text>
                <Text style={styles.price}>R$ {product.price.toFixed(2)}</Text>
                <Text style={styles.description}>{product.description}</Text>
                <TouchableOpacity style={styles.addButton} onPress={handleAddToCart}>
                    <Text style={styles.addButtonText}>Adicionar ao Carrinho</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    image: {
        width: '100%',
        height: 300,
        resizeMode: 'cover',
    },
    detailsContainer: {
        padding: 20,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    price: {
        fontSize: 20,
        color: '#888',
        marginBottom: 15,
    },
    description: {
        fontSize: 16,
        color: '#555',
        lineHeight: 24,
        marginBottom: 20,
    },
    addButton: {
        backgroundColor: '#28a745',
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});