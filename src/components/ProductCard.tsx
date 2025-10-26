import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Product } from '../types/navigation';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useWishlist } from '../context/WishlistContext';

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
    const { isInWishlist, toggleWishlist, loadingWishlist } = useWishlist();
    const isFavorite = isInWishlist(product.id);

    const handleToggleWishlist = () => {
        if (loadingWishlist) return;
        toggleWishlist(product);
    };

    const displayImageUrl = product.imageUrls && product.imageUrls.length > 0
        ? product.imageUrls[0]
        : product.imageUrl;

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
            position: 'relative',
        },
        imageContainer: {
            position: 'relative',
            backgroundColor: colors.border,
        },
        image: {
            width: '100%',
            height: itemWidth * 1.1,
        },
        placeholderContainer: {
            width: '100%',
            height: itemWidth * 1.1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: colors.border,
        },
        wishlistButton: {
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            borderRadius: 15,
            padding: 5,
            zIndex: 1,
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
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
            <View style={styles.imageContainer}>
                <TouchableOpacity
                    style={styles.wishlistButton}
                    onPress={handleToggleWishlist}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons
                        name={isFavorite ? "heart" : "heart-outline"}
                        size={20}
                        color={isFavorite ? colors.notification : "#fff"}
                    />
                </TouchableOpacity>

                {displayImageUrl ? (
                    <Image
                        source={{ uri: displayImageUrl }}
                        style={styles.image}
                        resizeMode="cover"
                        onError={(e) => console.log("Falha ao carregar imagem:", displayImageUrl, e.nativeEvent.error)}
                    />
                ) : (
                    <View style={styles.placeholderContainer}>
                        <Ionicons name="image-outline" size={itemWidth * 0.4} color={colors.textSecondary} />
                    </View>
                )}

            </View>
            <View style={styles.infoContainer}>
                {product.category && <Text style={styles.category}>{product.category}</Text>}
                <Text style={styles.name} numberOfLines={2} ellipsizeMode="tail">
                    {product.name}
                </Text>
                <Text style={styles.price}>{product.currency === 'BRL' ? 'R$' : ''} {product.price.toFixed(2)}</Text>
            </View>
        </TouchableOpacity>
    );
};

export default ProductCard;