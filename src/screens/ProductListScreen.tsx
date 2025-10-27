import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    RefreshControl
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Product, RootStackParamList } from '../types/navigation';
import { db, collection, getDocs } from '../firebase/firebaseConfig';
import ProductCard from '../components/ProductCard';
import HomeHeader from '../components/HomeHeader';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

type ProductListNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ProductList'>;

const numColumns = 2;
const itemMargin = 8;

export default function ProductListScreen() {
    const navigation = useNavigation<ProductListNavigationProp>();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [firestoreError, setFirestoreError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchProducts = useCallback(async (isRefresh = false) => {
        if (!isRefresh) {
            setLoading(true);
        }
        setFirestoreError(null);
        let firestoreProductList: Product[] = [];
        try {
            const productsCol = collection(db, 'products');
            const productSnapshot = await getDocs(productsCol);
            firestoreProductList = productSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Product[];
            console.log(`[ProductListScreen] ${firestoreProductList.length} produtos carregados do Firestore.`);

            setAllProducts(firestoreProductList);

        } catch (error: any) {
            console.error("[ProductListScreen] Erro ao buscar produtos do Firestore:", error);
            setFirestoreError(t('errorLoadingProducts', "Não foi possível carregar produtos do banco de dados."));
            setAllProducts([]);
        } finally {
            if (!isRefresh) {
                setLoading(false);
            }
            setRefreshing(false);
        }
    }, [t]);

    useFocusEffect(
        useCallback(() => {
            fetchProducts();
        }, [fetchProducts])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchProducts(true);
    }, [fetchProducts]);

    const handleSearchChange = (text: string) => {
        setSearchTerm(text);
    };

    const filteredProducts = useMemo(() => {
        if (!searchTerm) {
            return allProducts;
        }
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        return allProducts.filter(product =>
            product.name.toLowerCase().includes(lowerCaseSearchTerm) ||
            product.category?.toLowerCase().includes(lowerCaseSearchTerm) ||
            product.brand?.toLowerCase().includes(lowerCaseSearchTerm)
        );
    }, [allProducts, searchTerm]);

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
        contentContainer: {
            flex: 1,
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
            fontWeight: 'bold',
        },
        errorContainer: {
            padding: 10,
            backgroundColor: colors.notification,
            margin: itemMargin,
            borderRadius: 5,
            borderWidth: 1,
            borderColor: colors.border,
        },
        errorText: {
            color: colors.card,
            textAlign: 'center',
            fontWeight: 'bold',
        },
        emptySearchText: {
            fontSize: 16,
            color: colors.textSecondary,
            textAlign: 'center',
            marginTop: 50,
        },
        listContainer: {
            paddingHorizontal: itemMargin / 2,
            paddingBottom: itemMargin,
            paddingTop: itemMargin,
        },
        refreshButtonText: {
            color: colors.primary,
            marginTop: 15,
        }
    });

    const renderMainContent = () => {
        if (loading && allProducts.length === 0 && !refreshing) {
            return (
                <View style={styles.centerContent}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>{t('loading', 'Carregando...')}</Text>
                </View>
            );
        }

        if (firestoreError && !refreshing) {
            return (
                <View style={styles.centerContent}>
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{firestoreError}</Text>
                    </View>
                    <TouchableOpacity onPress={onRefresh}>
                        <Text style={styles.refreshButtonText}>{t('tryRefresh', 'Tentar recarregar')}</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        if (filteredProducts.length === 0 && !loading && !refreshing) {
            return (
                <View style={styles.centerContent}>
                    <Text style={styles.emptySearchText}>
                        {searchTerm
                            ? t('noSearchResults', 'Nenhum produto encontrado para "{{term}}".', { term: searchTerm })
                            : t('noProductsAvailable', 'Nenhum produto disponível no momento.')}
                    </Text>
                    <TouchableOpacity onPress={onRefresh}>
                        <Text style={styles.refreshButtonText}>{t('tryRefresh', 'Tentar recarregar')}</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <FlatList
                data={filteredProducts}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                numColumns={numColumns}
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
        );
    };

    return (
        <View style={styles.container}>
            <HomeHeader onSearchChange={handleSearchChange} />
            <View style={styles.contentContainer}>
                {renderMainContent()}
            </View>
        </View>
    );
}