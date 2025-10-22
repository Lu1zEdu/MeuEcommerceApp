import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PRODUCTS } from '../data/products';
import { Product, RootStackParamList } from '../types/navigation';

type ProductListNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ProductList'>;

export default function ProductListScreen() {
    const navigation = useNavigation<ProductListNavigationProp>();

    const renderItem = ({ item }: { item: Product }) => (
        <TouchableOpacity
            style={styles.productItem}
            onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
        >
            <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
            <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productPrice}>R$ {item.price.toFixed(2)}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.cartButton}
                onPress={() => navigation.navigate('Cart')}
            >
                <Text style={styles.cartButtonText}>🛒 Ver Carrinho</Text>
            </TouchableOpacity>

            <FlatList
                data={PRODUCTS}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    listContainer: {
        padding: 10,
    },
    productItem: {
        backgroundColor: '#fff',
        padding: 15,
        marginBottom: 10,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 3,
    },
    productImage: {
        width: 60,
        height: 60,
        borderRadius: 5,
        marginRight: 15,
    },
    productInfo: {
        flex: 1,
    },
    productName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    productPrice: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    cartButton: {
        backgroundColor: '#007bff',
        padding: 10,
        margin: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    cartButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    }
});