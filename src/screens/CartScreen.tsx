// src/screens/CartScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useCart, CartItem } from '../context/CartContext'; // Importar o hook e o tipo

export default function CartScreen() {
    // Acessar o estado e as funções do carrinho através do hook useCart
    const { items, removeFromCart, increaseQuantity, decreaseQuantity, getTotalItems, getTotalPrice } = useCart();

    const renderItem = ({ item }: { item: CartItem }) => (
        <View style={styles.cartItem}>
            <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
            <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>R$ {item.price.toFixed(2)}</Text>
                <View style={styles.quantityContainer}>
                    <TouchableOpacity onPress={() => decreaseQuantity(item.id)} style={styles.quantityButton}>
                        <Text style={styles.quantityButtonText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.itemQuantity}>{item.quantity}</Text>
                    <TouchableOpacity onPress={() => increaseQuantity(item.id)} style={styles.quantityButton}>
                        <Text style={styles.quantityButtonText}>+</Text>
                    </TouchableOpacity>
                </View>
                <Text style={styles.itemSubtotal}>Subtotal: R$ {(item.price * item.quantity).toFixed(2)}</Text>
            </View>
            <TouchableOpacity onPress={() => removeFromCart(item.id)} style={styles.removeButton}>
                <Text style={styles.removeButtonText}>✕</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Meu Carrinho</Text>
            {items.length === 0 ? (
                <Text style={styles.emptyText}>Seu carrinho está vazio.</Text>
            ) : (
                <>
                    <FlatList
                        data={items}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.listContainer}
                    />
                    <View style={styles.summaryContainer}>
                        <Text style={styles.summaryText}>Total de Itens: {getTotalItems()}</Text>
                        <Text style={styles.summaryTotal}>Total: R$ {getTotalPrice().toFixed(2)}</Text>
                    </View>
                    <TouchableOpacity style={styles.checkoutButton}>
                        <Text style={styles.checkoutButtonText}>Finalizar Compra</Text>
                    </TouchableOpacity>
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#f8f8f8',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#333',
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginTop: 50,
    },
    listContainer: {
        paddingBottom: 10,
    },
    cartItem: {
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
    itemImage: {
        width: 60,
        height: 60,
        borderRadius: 5,
        marginRight: 15,
    },
    itemDetails: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    itemPrice: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    quantityButton: {
        backgroundColor: '#eee',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 4,
        marginHorizontal: 8,
    },
    quantityButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    itemQuantity: {
        fontSize: 16,
        fontWeight: 'bold',
        minWidth: 20,
        textAlign: 'center',
    },
    itemSubtotal: {
        fontSize: 14,
        color: '#444',
        fontWeight: '500',
    },
    removeButton: {
        marginLeft: 10,
        padding: 5,
    },
    removeButtonText: {
        fontSize: 20,
        color: '#dc3545',
        fontWeight: 'bold',
    },
    summaryContainer: {
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 15,
        marginTop: 10,
        paddingHorizontal: 5, // Pequeno padding horizontal para alinhar melhor
    },
    summaryText: {
        fontSize: 16,
        color: '#555',
        marginBottom: 5,
    },
    summaryTotal: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    checkoutButton: {
        backgroundColor: '#007bff',
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 5, // Pequeno padding horizontal para alinhar melhor
        marginBottom: 10,
    },
    checkoutButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});