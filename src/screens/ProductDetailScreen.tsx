import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Button } from 'react-native'; // Adicionado ActivityIndicator
import { RouteProp, useRoute, useFocusEffect, useNavigation } from '@react-navigation/native'; // Adicionado useFocusEffect
import { NativeStackNavigationProp } from '@react-navigation/native-stack'; // Para navegação
import { Product, RootStackParamList } from '../types/navigation';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useWishlist } from '../context/WishlistContext';
import { useTranslation } from 'react-i18next';
import { db, doc, getDoc } from '../firebase/firebaseConfig'; // Para buscar produto individual

type ProductDetailRouteProp = RouteProp<RootStackParamList, 'ProductDetail'>;
type ProductDetailNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ProductDetail'>; // Para tipar navigation

export default function ProductDetailScreen() {
    const route = useRoute<ProductDetailRouteProp>();
    const navigation = useNavigation<ProductDetailNavigationProp>(); // Hook de navegação
    const { productId } = route.params;
    const { addToCart } = useCart();
    const { colors } = useTheme();
    const { isInWishlist, toggleWishlist, loadingWishlist } = useWishlist();
    const { t } = useTranslation(); // Hook de tradução

    const [product, setProduct] = useState<Product | null>(null); // Estado para o produto
    const [loadingProduct, setLoadingProduct] = useState(true); // Estado de loading para busca no Firestore

    // Busca o produto específico no Firestore quando a tela carrega ou productId muda
    useEffect(() => {
        const fetchProduct = async () => {
            setLoadingProduct(true);
            try {
                const productRef = doc(db, 'products', productId);
                const docSnap = await getDoc(productRef);

                if (docSnap.exists()) {
                    setProduct({ id: docSnap.id, ...docSnap.data() } as Product);
                } else {
                    console.warn("Produto não encontrado no Firestore:", productId);
                    setProduct(null); // Define como null se não encontrar
                    Alert.alert(t('alertErrorTitle'), "Produto não encontrado."); // Informa usuário
                    // Opcional: navegar de volta navigation.goBack();
                }
            } catch (error) {
                console.error("Erro ao buscar detalhes do produto:", error);
                setProduct(null);
                Alert.alert(t('alertErrorTitle'), "Erro ao carregar detalhes do produto.");
            } finally {
                setLoadingProduct(false);
            }
        };

        fetchProduct();
    }, [productId, t]); // Adiciona t como dependência para tradução dos alertas

    // Verifica se o produto atual está na wishlist (só executa se product não for null)
    const isFavorite = product ? isInWishlist(product.id) : false;

    const handleAddToCart = () => {
        if (product) {
            addToCart(product);
            // Usando interpolação para o nome do produto na mensagem
            Alert.alert(t('alertSuccessTitle'), t('successAddedToCart', { productName: product.name }));
        }
    };

    const handleToggleWishlist = () => {
        if (!product || loadingWishlist) return;
        toggleWishlist(product);
    };

    // Estilos movidos para dentro para usar 'colors'
    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: colors.background,
        },
        loadingText: {
            marginTop: 10,
            fontSize: 16,
            color: colors.textSecondary,
        },
        image: {
            width: '100%',
            height: 350, // Imagem um pouco maior
            resizeMode: 'cover',
            backgroundColor: colors.border,
        },
        detailsContainer: {
            padding: 20,
            backgroundColor: colors.card,
            borderTopLeftRadius: 20, // Bordas mais arredondadas
            borderTopRightRadius: 20,
            marginTop: -20, // Puxa mais para cima
            paddingBottom: 30, // Mais espaço embaixo
        },
        headerRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 8, // Ajustado
        },
        name: {
            flex: 1, // Permite que o nome quebre linha se necessário
            fontSize: 24,
            fontWeight: 'bold',
            color: colors.text,
            marginRight: 10, // Espaço antes do coração
        },
        wishlistButtonDetail: {
            padding: 8,
            marginTop: 4, // Alinha um pouco melhor com o texto
        },
        category: {
            fontSize: 14,
            color: colors.textSecondary,
            marginBottom: 12,
        },
        price: {
            fontSize: 22, // Preço um pouco maior
            color: colors.primary,
            fontWeight: 'bold',
            marginBottom: 20,
        },
        description: {
            fontSize: 16,
            color: colors.textSecondary,
            lineHeight: 24,
            marginBottom: 30,
        },
        addButton: {
            backgroundColor: colors.primary,
            paddingVertical: 15,
            borderRadius: 8,
            alignItems: 'center',
        },
        addButtonText: {
            color: colors.card,
            fontSize: 16,
            fontWeight: 'bold',
        },
    });

    // Se ainda estiver carregando os dados do produto
    if (loadingProduct) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Carregando detalhes...</Text>
            </View>
        );
    }

    if (!product) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Produto não encontrado!</Text>
                <Button title="Voltar" onPress={() => navigation.goBack()} color={colors.primary} />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
            <Image source={{ uri: product.imageUrl }} style={styles.image} />
            <View style={styles.detailsContainer}>
                <View style={styles.headerRow}>
                    <Text style={styles.name}>{product.name}</Text>
                    <TouchableOpacity
                        style={styles.wishlistButtonDetail}
                        onPress={handleToggleWishlist}
                    >
                        <Ionicons
                            name={isFavorite ? "heart" : "heart-outline"}
                            size={30}
                            color={isFavorite ? colors.notification : colors.textSecondary}
                        />
                    </TouchableOpacity>
                </View>

                <Text style={styles.category}>{t('categoryLabel')} {product.category}</Text>
                <Text style={styles.price}>R$ {product.price.toFixed(2)}</Text>
                <Text style={styles.description}>{product.description}</Text>
                <TouchableOpacity style={styles.addButton} onPress={handleAddToCart}>
                    <Text style={styles.addButtonText}>{t('addToCartButton')}</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}