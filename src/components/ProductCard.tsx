// src/components/ProductCard.tsx
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Product } from '../types/navigation';
import { useTheme } from '../context/ThemeContext'; // 1. Importar useTheme

interface ProductCardProps {
    product: Product;
    onPress: () => void;
}

const { width } = Dimensions.get('window');
const numColumns = 2;
const itemMargin = 8;
const itemWidth = (width - itemMargin * (numColumns + 1)) / numColumns;

const ProductCard: React.FC<ProductCardProps> = ({ product, onPress }) => {
    const { colors } = useTheme(); // 2. Obter cores do tema

    // 3. Mover StyleSheet para dentro para acessar 'colors'
    const styles = StyleSheet.create({
        card: {
            width: itemWidth,
            backgroundColor: colors.card, // Usar cor do tema
            borderRadius: 8,
            overflow: 'hidden',
            marginBottom: itemMargin,
            marginHorizontal: itemMargin / 2,
            shadowColor: '#000', // Sombra pode ser ajustada para tema escuro se desejar
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 3,
        },
        image: {
            width: '100%',
            height: itemWidth * 1.1,
            backgroundColor: colors.border, // Usar cor de borda como placeholder
        },
        infoContainer: {
            paddingVertical: 8,
            paddingHorizontal: 10,
        },
        category: {
            fontSize: 11,
            color: colors.textSecondary, // Usar cor do tema
            marginBottom: 3,
            textTransform: 'uppercase',
        },
        name: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.text, // Usar cor do tema
            marginBottom: 4,
            minHeight: 34,
        },
        price: {
            fontSize: 15,
            fontWeight: 'bold',
            color: colors.primary, // Usar cor do tema
            marginTop: 'auto',
        },
    });

    return (
        // O JSX não muda, apenas os estilos aplicados
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
            <Image
                source={{ uri: product.imageUrl }}
                style={styles.image}
                resizeMode="cover"
            />
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

// Remover o StyleSheet daqui de fora

export default ProductCard;