import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useCart, CartItem } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext'; // 1. Importar

export default function CartScreen() {
    const { items, removeFromCart, increaseQuantity, decreaseQuantity, getTotalItems, getTotalPrice } = useCart();
    const { colors } = useTheme(); // 2. Obter cores

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            padding: 10,
            backgroundColor: colors.background, // Cor do tema
        },
        title: {
            fontSize: 24,
            fontWeight: 'bold',
            marginBottom: 20,
            textAlign: 'center',
            color: colors.text, // Cor do tema
        },
        emptyText: {
            fontSize: 16,
            color: colors.textSecondary, // Cor do tema
            textAlign: 'center',
            marginTop: 50,
        },
        listContainer: {
            paddingBottom: 10,
        },
        cartItem: {
            backgroundColor: colors.card, // Cor do tema
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
            backgroundColor: colors.border, // Placeholder
        },
        itemDetails: {
            flex: 1,
        },
        itemName: {
            fontSize: 16,
            fontWeight: 'bold',
            color: colors.text, // Cor do tema
            marginBottom: 4,
        },
        itemPrice: {
            fontSize: 14,
            color: colors.textSecondary, // Cor do tema
            marginBottom: 8,
        },
        quantityContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 8,
        },
        quantityButton: {
            backgroundColor: colors.background, // Fundo sutil
            paddingHorizontal: 12,
            paddingVertical: 5,
            borderRadius: 4,
            marginHorizontal: 8,
            borderWidth: 1, // Borda leve
            borderColor: colors.border,
        },
        quantityButtonText: {
            fontSize: 18,
            fontWeight: 'bold',
            color: colors.text, // Cor do tema
        },
        itemQuantity: {
            fontSize: 16,
            fontWeight: 'bold',
            minWidth: 20,
            textAlign: 'center',
            color: colors.text, // Cor do tema
        },
        itemSubtotal: {
            fontSize: 14,
            color: colors.text, // Cor do tema
            fontWeight: '500',
        },
        removeButton: {
            marginLeft: 10,
            padding: 5,
        },
        removeButtonText: {
            fontSize: 20,
            color: colors.notification, // Cor do tema (vermelho)
            fontWeight: 'bold',
        },
        summaryContainer: {
            borderTopWidth: 1,
            borderTopColor: colors.border, // Cor do tema
            paddingTop: 15,
            marginTop: 10,
            paddingHorizontal: 5,
            backgroundColor: colors.card, // Fundo do sumário
            padding: 15, // Padding interno
            borderRadius: 8,
            marginBottom: 10,
        },
        summaryText: {
            fontSize: 16,
            color: colors.textSecondary, // Cor do tema
            marginBottom: 5,
        },
        summaryTotal: {
            fontSize: 18,
            fontWeight: 'bold',
            color: colors.text, // Cor do tema
            marginBottom: 15,
        },
        checkoutButton: {
            backgroundColor: colors.primary, // Cor do tema
            paddingVertical: 15,
            borderRadius: 8,
            alignItems: 'center',
            marginBottom: 10, // Margem no final
        },
        checkoutButtonText: {
            color: colors.card, // Texto contrastante (branco)
            fontSize: 16,
            fontWeight: 'bold',
        },
    });


    const renderItem = ({ item }: { item: CartItem }) => (
        // JSX do item do carrinho (não precisa mudar, só os estilos aplicados)
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
            {/* O Título já será colorido pelo header do AppNavigator */}
            {/* <Text style={styles.title}>Meu Carrinho</Text> */}
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