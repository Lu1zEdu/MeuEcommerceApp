// src/screens/ProductDetailScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { PRODUCTS } from '../data/products'; // Ainda usando dados locais aqui
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext'; // 1. Importar

type ProductDetailRouteProp = RouteProp<RootStackParamList, 'ProductDetail'>;

export default function ProductDetailScreen() {
    const route = useRoute<ProductDetailRouteProp>();
    const { productId } = route.params;
    const { addToCart } = useCart();
    const { colors } = useTheme(); // 2. Obter cores

    // Lógica para encontrar o produto (pode vir do Firestore no futuro)
    const product = PRODUCTS.find(p => p.id === productId);

    // 3. Mover StyleSheet para dentro
    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background, // Cor do tema
        },
        loadingContainer: { // Para o caso de produto não encontrado
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: colors.background,
        },
        loadingText: {
            fontSize: 16,
            color: colors.textSecondary,
        },
        image: {
            width: '100%',
            height: 300,
            resizeMode: 'cover',
            backgroundColor: colors.border, // Placeholder enquanto carrega
        },
        detailsContainer: {
            padding: 20,
            backgroundColor: colors.card, // Fundo do card para detalhes
            borderTopLeftRadius: 15, // Efeito visual opcional
            borderTopRightRadius: 15,
            marginTop: -15, // Puxa para cima da imagem
        },
        name: {
            fontSize: 24,
            fontWeight: 'bold',
            marginBottom: 5,
            color: colors.text, // Cor do tema
        },
        category: {
            fontSize: 14,
            color: colors.textSecondary, // Cor do tema
            marginBottom: 10,
        },
        price: {
            fontSize: 20,
            color: colors.primary, // Cor do tema
            fontWeight: 'bold',
            marginBottom: 15,
        },
        description: {
            fontSize: 16,
            color: colors.textSecondary, // Cor do tema
            lineHeight: 24,
            marginBottom: 25, // Mais espaço antes do botão
        },
        addButton: {
            backgroundColor: colors.primary, // Cor do tema
            paddingVertical: 15,
            borderRadius: 8,
            alignItems: 'center',
        },
        addButtonText: {
            // Cor do texto deve contrastar com colors.primary (geralmente branco)
            color: colors.card, // Assumindo que card é branco/claro
            fontSize: 16,
            fontWeight: 'bold',
        },
    });


    if (!product) {
        // Estilo simples para produto não encontrado
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Produto não encontrado!</Text>
            </View>
        );
    }

    const handleAddToCart = () => {
        if (product) {
            addToCart(product);
            Alert.alert("Sucesso", `${product.name} adicionado ao carrinho!`);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Image source={{ uri: product.imageUrl }} style={styles.image} />
            <View style={styles.detailsContainer}>
                <Text style={styles.name}>{product.name}</Text>
                <Text style={styles.category}>Categoria: {product.category}</Text>
                <Text style={styles.price}>R$ {product.price.toFixed(2)}</Text>
                <Text style={styles.description}>{product.description}</Text>
                <TouchableOpacity style={styles.addButton} onPress={handleAddToCart}>
                    <Text style={styles.addButtonText}>Adicionar ao Carrinho</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}