// src/screens/WishlistScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native'; // Importar useNavigation
import { NativeStackNavigationProp } from '@react-navigation/native-stack'; // Para navegação
import { useTheme } from '../context/ThemeContext';
import { useWishlist } from '../context/WishlistContext'; // Hook da wishlist
import { Product, RootStackParamList } from '../types/navigation'; // Tipo Product
import { db, collection, getDocs, query, where } from '../firebase/firebaseConfig'; // Funções do Firestore
import ProductCard from '../components/ProductCard'; // Componente para exibir o produto
import { useTranslation } from 'react-i18next'; // Para traduções
import { documentId } from 'firebase/firestore';

type WishlistScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Wishlist'>;

export default function WishlistScreen() {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const navigation = useNavigation<WishlistScreenNavigationProp>(); // Hook de navegação
    const { wishlistProductIds, loadingWishlist: loadingContext } = useWishlist(); // Pega IDs e loading do contexto
    const [wishlistItems, setWishlistItems] = useState<Product[]>([]); // Estado para os detalhes dos produtos
    const [loadingProducts, setLoadingProducts] = useState(false); // Loading para busca dos detalhes

    const fetchWishlistProductDetails = useCallback(async () => {
        if (wishlistProductIds.length === 0 || loadingContext) {
            setWishlistItems([]); // Limpa a lista se não houver IDs ou contexto carregando
            setLoadingProducts(false); // Garante que não está carregando
            return;
        }

        setLoadingProducts(true); // Inicia loading da busca de detalhes
        try {
            const productsRef = collection(db, 'products');
            const q = query(productsRef, where(documentId(), 'in', wishlistProductIds));

            const querySnapshot = await getDocs(q);
            const items = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            })) as Product[];

            items.sort((a, b) => wishlistProductIds.indexOf(a.id) - wishlistProductIds.indexOf(b.id));

            setWishlistItems(items);

        } catch (error) {
            console.error("Erro ao buscar detalhes dos produtos da wishlist:", error);
            setWishlistItems([]);
        } finally {
            setLoadingProducts(false);
        }
    }, [wishlistProductIds, loadingContext]);

    useFocusEffect(
        useCallback(() => {
            fetchWishlistProductDetails();
        }, [fetchWishlistProductDetails])
    );

    const renderItem = ({ item }: { item: Product }) => (
        <ProductCard
            product={item}
            onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
        />
    );

    // Define os estilos dinamicamente com base no tema
    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        centerContent: { // Para loading e mensagem de vazio
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
            paddingHorizontal: 8 / 2, // Mesma lógica de padding da ProductListScreen
            paddingTop: 8,
            paddingBottom: 8,
        },
        title: {
            fontSize: 24,
            fontWeight: 'bold',
            color: colors.text,
            padding: 15,
            textAlign: 'center',
            backgroundColor: colors.card,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
    });

    if (loadingContext || loadingProducts) {
        return (
            <View style={styles.centerContent}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Carregando favoritos...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* O título agora virá do BottomTabNavigator */}
            {/* <Text style={styles.title}>{t('wishlistTab')}</Text> */}

            {wishlistItems.length === 0 ? (
                <View style={styles.centerContent}>
                    <Text style={styles.emptyText}>Sua lista de desejos está vazia.</Text>
                </View>
            ) : (
                <FlatList
                    data={wishlistItems}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    numColumns={2} // Usar 2 colunas como na lista principal
                    contentContainerStyle={styles.listContainer}
                />
            )}
        </View>
    );
}