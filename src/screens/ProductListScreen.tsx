import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Product, RootStackParamList } from '../types/navigation';
import { auth, db, collection, getDocs } from '../firebase/firebaseConfig';
import { signOut } from 'firebase/auth';
import ProductCard from '../components/ProductCard';
import { PRODUCTS as LOCAL_PRODUCTS } from '../data/products';
import HomeHeader from '../components/HomeHeader';
import { useTheme } from '../context/ThemeContext';

type ProductListNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ProductList'>;

const numColumns = 2;
const itemMargin = 8;

export default function ProductListScreen() {
    const navigation = useNavigation<ProductListNavigationProp>();
    const { colors } = useTheme();
    const [products, setProducts] = useState<Product[]>(LOCAL_PRODUCTS);
    const [loading, setLoading] = useState(false);
    const [firestoreError, setFirestoreError] = useState<string | null>(null);

    useFocusEffect(
        useCallback(() => {
            let isMounted = true;
            const fetchFirestoreProducts = async () => {
                setLoading(true);
                setFirestoreError(null);
                try {
                    const productsCol = collection(db, 'products');
                    const productSnapshot = await getDocs(productsCol);
                    const firestoreProductList = productSnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    })) as Product[];

                    if (isMounted) {
                        if (firestoreProductList.length > 0) {
                            const combined = [...firestoreProductList, ...LOCAL_PRODUCTS];
                            const uniqueProducts = Array.from(new Map(combined.map(p => [p.id, p])).values());
                            setProducts(uniqueProducts);
                        } else {
                            setProducts(LOCAL_PRODUCTS);
                        }
                    }
                } catch (error: any) {
                    console.error("Erro ao buscar produtos do Firestore:", error);
                    if (isMounted) {
                        setProducts(LOCAL_PRODUCTS);
                        setFirestoreError("Não foi possível carregar produtos do banco de dados.");
                        Alert.alert("Erro Firestore", "Não foi possível carregar produtos do banco de dados.");
                    }
                } finally {
                    if (isMounted) {
                        setLoading(false);
                    }
                }
            };
            fetchFirestoreProducts();
            return () => { isMounted = false; };
        }, [])
    );

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
            backgroundColor: colors.background,
        },
        loadingOverlay: {
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10,
        },
        loadingText: {
            marginTop: 20,
            fontSize: 16,
            color: '#FFFFFF',
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
        emptyText: {
            fontSize: 16,
            color: colors.textSecondary,
            textAlign: 'center',
        },
        listContainer: {
            paddingHorizontal: itemMargin / 2,
            paddingBottom: itemMargin,
        },
    });


    return (
        <View style={styles.container}>
            <HomeHeader />

            {loading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#FFFFFF" />
                    <Text style={styles.loadingText}>Atualizando produtos...</Text>
                </View>
            )}

            {firestoreError && !loading && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{firestoreError}</Text>
                </View>
            )}

            {products.length === 0 && !loading ? (
                <View style={styles.centerContent}>
                    <Text style={styles.emptyText}>Nenhum produto para exibir.</Text>
                </View>
            ) : (
                <FlatList
                    data={products}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    numColumns={numColumns}
                    contentContainerStyle={styles.listContainer}
                />
            )}
        </View>
    );
}