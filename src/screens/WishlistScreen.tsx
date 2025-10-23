import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import { useWishlist } from '../context/WishlistContext';
import { Product, RootStackParamList } from '../types/navigation';
import { db, collection, getDocs, query, where } from '../firebase/firebaseConfig';
import ProductCard from '../components/ProductCard';
import { useTranslation } from 'react-i18next';
import { documentId } from 'firebase/firestore';

type WishlistScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Wishlist'>;

export default function WishlistScreen() {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const navigation = useNavigation<WishlistScreenNavigationProp>();
    const { wishlistProductIds, loadingWishlist: loadingContext } = useWishlist();
    const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(false);

    const fetchWishlistProductDetails = useCallback(async () => {
        console.log("fetchWishlistProductDetails chamada com IDs:", wishlistProductIds);

        if (wishlistProductIds.length === 0) {
            setWishlistItems([]);
            setLoadingProducts(false);
            console.log("Wishlist vazia, busca de detalhes pulada.");
            return;
        }

        if (loadingContext) {
            console.log("Contexto da Wishlist ainda carregando, aguardando...");
            setLoadingProducts(true);
            return;
        }

        setLoadingProducts(true);
        try {
            const idsToFetch = wishlistProductIds.slice(0, 30);
            if (wishlistProductIds.length > 30) {
                console.warn("A query 'in' do Firestore é limitada a 30 IDs. Exibindo apenas os primeiros 30 itens da wishlist.");
            }

            if (idsToFetch.length === 0) {
                setWishlistItems([]);
                setLoadingProducts(false);
                return;
            }

            const productsRef = collection(db, 'products');
            const q = query(productsRef, where(documentId(), 'in', idsToFetch));

            const querySnapshot = await getDocs(q);
            const items = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            })) as Product[];

            items.sort((a, b) => idsToFetch.indexOf(a.id) - idsToFetch.indexOf(b.id));

            console.log("Detalhes dos produtos da wishlist buscados:", items.length);
            setWishlistItems(items);

        } catch (error) {
            console.error("Erro ao buscar detalhes dos produtos da wishlist:", error);
            setWishlistItems([]);
        } finally {
            setLoadingProducts(false);
        }
    }, [wishlistProductIds, loadingContext]);

    useEffect(() => {
        fetchWishlistProductDetails();
    }, [fetchWishlistProductDetails]);

    const renderItem = ({ item }: { item: Product }) => (
        <ProductCard
            product={item}
            onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
        />
    );

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        centerContent: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
        },
        loadingText: {
            marginTop: 10,
            fontSize: 16,
            color: colors.textSecondary,
        },
        emptyText: {
            fontSize: 16,
            color: colors.textSecondary,
            textAlign: 'center',
        },
        listContainer: {
            paddingHorizontal: 8 / 2,
            paddingTop: 8,
            paddingBottom: 8,
        },
    });

    const isLoading = loadingContext || loadingProducts;
    if (isLoading) {
        return (
            <View style={styles.centerContent}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Carregando favoritos...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {wishlistItems.length === 0 ? (
                <View style={styles.centerContent}>
                    <Text style={styles.emptyText}>{t('wishlistEmpty', 'Sua lista de desejos está vazia.')}</Text>
                </View>
            ) : (
                <FlatList
                    data={wishlistItems}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    contentContainerStyle={styles.listContainer}
                />
            )}
        </View>
    );
}