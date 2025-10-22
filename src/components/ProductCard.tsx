// src/components/ProductCard.tsx
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Product } from '../types/navigation';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons'; // 1. Importar Ionicons
import { useWishlist } from '../context/WishlistContext'; // 1. Importar useWishlist

interface ProductCardProps {
    product: Product;
    onPress: () => void;
}

const { width } = Dimensions.get('window');
const numColumns = 2;
const itemMargin = 8;
const itemWidth = (width - itemMargin * (numColumns + 1)) / numColumns;

const ProductCard: React.FC<ProductCardProps> = ({ product, onPress }) => {
    const { colors } = useTheme();
    // 2. Obter dados e funções da wishlist
    const { isInWishlist, toggleWishlist, loadingWishlist } = useWishlist();

    // Determina se o produto atual está na wishlist
    const isFavorite = isInWishlist(product.id);

    // Função para lidar com o toque no coração
    const handleToggleWishlist = () => {
        // Evita múltiplos cliques rápidos enquanto a operação está em andamento (opcional, mas bom)
        if (loadingWishlist) return;
        toggleWishlist(product); // Chama a função do contexto
    };

    const styles = StyleSheet.create({
        card: {
            width: itemWidth,
            backgroundColor: colors.card,
            borderRadius: 8,
            overflow: 'hidden',
            marginBottom: itemMargin,
            marginHorizontal: itemMargin / 2,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 3,
            position: 'relative', // Necessário para posicionar o botão de wishlist
        },
        imageContainer: { // Container para a imagem e o botão por cima
            position: 'relative',
        },
        image: {
            width: '100%',
            height: itemWidth * 1.1,
            backgroundColor: colors.border,
        },
        wishlistButton: { // Estilo do botão de coração
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: 'rgba(0, 0, 0, 0.4)', // Fundo semitransparente
            borderRadius: 15, // Círculo
            padding: 5,
            zIndex: 1, // Garante que fique sobre a imagem
        },
        infoContainer: {
            paddingVertical: 8,
            paddingHorizontal: 10,
        },
        category: {
            fontSize: 11,
            color: colors.textSecondary,
            marginBottom: 3,
            textTransform: 'uppercase',
        },
        name: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 4,
            minHeight: 34,
        },
        price: {
            fontSize: 15,
            fontWeight: 'bold',
            color: colors.primary,
            marginTop: 'auto',
        },
    });

    return (
        // A TouchableOpacity principal ainda navega para os detalhes
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
            {/* 3. Botão de Wishlist posicionado sobre a imagem */}
            <View style={styles.imageContainer}>
                <TouchableOpacity
                    style={styles.wishlistButton}
                    onPress={handleToggleWishlist}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} // Aumenta área de toque
                >
                    <Ionicons
                        name={isFavorite ? "heart" : "heart-outline"} // Muda o ícone
                        size={20}
                        color={isFavorite ? colors.notification : "#fff"} // Cor vermelha se favorito, branca caso contrário
                    />
                </TouchableOpacity>
                <Image
                    source={{ uri: product.imageUrl }}
                    style={styles.image}
                    resizeMode="cover"
                />
            </View>
            {/* Informações do produto */}
            <View style={styles.infoContainer}>
                <Text style={styles.category}>{product.category}</Text>
                <Text style={styles.name} numberOfLines={2} ellipsizeMode="tail">
                    {product.name}
                </Text>
                <Text style={styles.price}>R$ {product.price.toFixed(2)}</Text>
            </View>
        </TouchableOpacity>
    );
};

export default ProductCard;