import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import { useWishlist } from '../context/WishlistContext';
import { Product, RootStackParamList } from '../types/navigation';
import { db, collection, getDocs, query, where, documentId } from '../firebase/firebaseConfig';
import ProductCard from '../components/ProductCard';
import { useTranslation } from 'react-i18next';

type WishlistScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Wishlist'>;

export default function WishlistScreen() {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const navigation = useNavigation<WishlistScreenNavigationProp>();
    const { wishlistProductIds, loadingWishlist: loadingContext } = useWishlist();
    const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const fetchWishlistProductDetails = useCallback(async (isRefresh = false) => {
        console.log(`[WishlistScreen] fetchWishlistProductDetails chamado. Context loading: ${loadingContext}, IDs no context: ${JSON.stringify(wishlistProductIds)}`);

        if (!wishlistProductIds || wishlistProductIds.length === 0) {
            setWishlistItems([]);
            if (!isRefresh) setLoadingProducts(false);
            setRefreshing(false);
            console.log("[WishlistScreen] Lista de IDs vazia ou nula. Busca pulada.");
            return;
        }

        if (!isRefresh) {
            setLoadingProducts(true);
        }

        try {
            const idsToFetch = wishlistProductIds.slice(0, 30);
            if (wishlistProductIds.length > 30) {
                console.warn("[WishlistScreen] Exibindo apenas os primeiros 30 itens da wishlist (limitação Firestore).");
            }

            if (idsToFetch.length === 0) {
                setWishlistItems([]);
                console.log("[WishlistScreen] Nenhum ID válido para buscar após slice/filtro.");
            } else {
                console.log(`[WishlistScreen] Executando query na coleção 'products' com IDs: ${JSON.stringify(idsToFetch)}`); // LOG IMPORTANTE
                const productsRef = collection(db, 'products');
                const q = query(productsRef, where(documentId(), 'in', idsToFetch));

                const querySnapshot = await getDocs(q);
                const items = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Product[];

                console.log(`[WishlistScreen] Firestore retornou ${items.length} produtos. IDs encontrados: ${items.map(p => p.id).join(', ')}`);

                if (items.length < idsToFetch.length) {
                    const notFoundIds = idsToFetch.filter(id => !items.some(item => item.id === id));
                    console.warn(`[WishlistScreen] IDs da wishlist não encontrados na coleção 'products': ${JSON.stringify(notFoundIds)}`);
                }

                items.sort((a, b) => idsToFetch.indexOf(a.id) - idsToFetch.indexOf(b.id));
                setWishlistItems(items);
            }

        } catch (error) {
            console.error("[WishlistScreen] Erro CRÍTICO ao buscar detalhes dos produtos:", error);
            setWishlistItems([]);
            alert(t('errorLoadingWishlist', 'Erro ao carregar favoritos. Verifique o console.'));
        } finally {
            setLoadingProducts(false);
            setRefreshing(false);
        }
    }, [wishlistProductIds, t, loadingContext]);

    useFocusEffect(
        useCallback(() => {
            console.log(`[WishlistScreen] Tela focada. Context loading: ${loadingContext}`);
            if (!loadingContext) {
                fetchWishlistProductDetails();
            } else {
                setLoadingProducts(true);
            }
        }, [loadingContext, fetchWishlistProductDetails])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchWishlistProductDetails(true);
    }, [fetchWishlistProductDetails]);


    const renderItem = ({ item }: { item: Product }) => (
        <ProductCard
            product={item}
            onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
        />
    );

    const styles = StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
        loadingText: { marginTop: 10, fontSize: 16, color: colors.textSecondary },
        emptyText: { fontSize: 16, color: colors.textSecondary, textAlign: 'center' },
        listContainer: { paddingHorizontal: 4, paddingTop: 8, paddingBottom: 8 },
    });

    const isLoading = (loadingContext || loadingProducts) && !refreshing;

    if (isLoading) {
        return (
            <View style={styles.centerContent}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>{t('loadingWishlist', 'Carregando favoritos...')}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {(wishlistProductIds.length === 0 || wishlistItems.length === 0) && !loadingProducts ? (
                <View style={styles.centerContent}>
                    <Text style={styles.emptyText}>{t('wishlistEmpty', 'Sua lista de desejos está vazia.')}</Text>
                    <TouchableOpacity onPress={onRefresh} style={{ marginTop: 15 }}>
                        <Text style={{ color: colors.primary }}>{t('tryRefresh', 'Tentar recarregar')}</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={wishlistItems}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    contentContainerStyle={styles.listContainer}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[colors.primary]}
                            tintColor={colors.primary}
                        />
                    }
                />
            )}
        </View>
    );
}