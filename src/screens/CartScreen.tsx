import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useCart, CartItem } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Order, OrderItem, OrderStatus } from '../types/navigation';
import { useTranslation } from 'react-i18next';
import { db, collection, addDoc, serverTimestamp, Timestamp, auth } from '../firebase/firebaseConfig';
import { scheduleLocalNotification } from '../services/notificationService';

type CartScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Cart'>;

export default function CartScreen() {
    const { items, removeFromCart, increaseQuantity, decreaseQuantity, getTotalItems, getTotalPrice, clearCart } = useCart();
    const { colors } = useTheme();
    const navigation = useNavigation<CartScreenNavigationProp>();
    const { t } = useTranslation();
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);

    const handleCheckout = async () => {
        const user = auth.currentUser;
        if (!user) {
            console.error("Usuário não autenticado para finalizar pedido.");
            return;
        }
        if (items.length === 0) {
            return;
        }

        setIsPlacingOrder(true);

        const orderItems: OrderItem[] = items.map(({ cartItemId, ...item }) => item);
        const newOrder: Omit<Order, 'id'> = {
            userId: user.uid,
            items: orderItems,
            totalPrice: getTotalPrice(),
            status: 'pending' as OrderStatus,
            createdAt: serverTimestamp() as Timestamp,
        };
        await addDoc(collection(db, "orders"), newOrder);

        try {
            const docRef = await addDoc(collection(db, "orders"), newOrder);

            await scheduleLocalNotification(
                t('orderPlacedTitle', "Pedido Recebido!"),
                t('orderPlacedBody', `Seu pedido #${docRef.id.substring(0, 6)}... foi recebido e está pendente.`),
                { orderId: docRef.id, navigateTo: 'Transaction' }
            );

            clearCart();
            navigation.navigate('MainApp', { screen: 'Transaction' });

        } catch (error) {
            console.error("Erro ao salvar pedido no Firestore:", error);
            alert(t('orderError', 'Erro ao processar seu pedido. Tente novamente.'));
        } finally {
            setIsPlacingOrder(false);
        }
    };


    const styles = StyleSheet.create({
        container: {
            flex: 1,
            padding: 10,
            backgroundColor: colors.background,
        },
        title: {
            fontSize: 24,
            fontWeight: 'bold',
            marginBottom: 20,
            textAlign: 'center',
            color: colors.text,
        },
        emptyText: {
            fontSize: 16,
            color: colors.textSecondary,
            textAlign: 'center',
            marginTop: 50,
        },
        listContainer: {
            paddingBottom: 10,
        },
        cartItem: {
            backgroundColor: colors.card,
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
            backgroundColor: colors.border,
        },
        itemDetails: {
            flex: 1,
        },
        itemName: {
            fontSize: 16,
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: 4,
        },
        itemVariations: {
            fontSize: 13,
            color: colors.textSecondary,
            marginBottom: 4,
        },
        itemPrice: {
            fontSize: 14,
            color: colors.textSecondary,
            marginBottom: 8,
        },
        quantityContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 8,
        },
        quantityButton: {
            backgroundColor: colors.background,
            paddingHorizontal: 12,
            paddingVertical: 5,
            borderRadius: 4,
            marginHorizontal: 8,
            borderWidth: 1,
            borderColor: colors.border,
        },
        quantityButtonText: {
            fontSize: 18,
            fontWeight: 'bold',
            color: colors.text,
        },
        itemQuantity: {
            fontSize: 16,
            fontWeight: 'bold',
            minWidth: 20,
            textAlign: 'center',
            color: colors.text,
        },
        itemSubtotal: {
            fontSize: 14,
            color: colors.text,
            fontWeight: '500',
        },
        removeButton: {
            marginLeft: 10,
            padding: 5,
        },
        removeButtonText: {
            fontSize: 20,
            color: colors.notification,
            fontWeight: 'bold',
        },
        summaryContainer: {
            borderTopWidth: 1,
            borderTopColor: colors.border,
            paddingTop: 15,
            marginTop: 10,
            paddingHorizontal: 5,
            backgroundColor: colors.card,
            padding: 15,
            borderRadius: 8,
            marginBottom: 10,
        },
        summaryText: {
            fontSize: 16,
            color: colors.textSecondary,
            marginBottom: 5,
        },
        summaryTotal: {
            fontSize: 18,
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: 15,
        },
        checkoutButton: {
            backgroundColor: colors.primary,
            paddingVertical: 15,
            borderRadius: 8,
            alignItems: 'center',
            marginBottom: 10,
            flexDirection: 'row',
            justifyContent: 'center',
        },
        checkoutButtonDisabled: {
            backgroundColor: colors.textSecondary,
        },
        checkoutButtonText: {
            color: colors.card,
            fontSize: 16,
            fontWeight: 'bold',
            marginRight: 10,
        },
    });


    const formatVariations = (variations?: { [key: string]: string }): string => {
        if (!variations || Object.keys(variations).length === 0) {
            return '';
        }
        return Object.entries(variations)
            .map(([key, value]) => `${value}`)
            .join(' / ');
    };

    const renderItem = ({ item }: { item: CartItem }) => (
        <View style={styles.cartItem}>
            <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
            <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.name}</Text>
                {item.selectedVariations && Object.keys(item.selectedVariations).length > 0 && (
                    <Text style={styles.itemVariations}>
                        {formatVariations(item.selectedVariations)}
                    </Text>
                )}
                <Text style={styles.itemPrice}>{t('currencySymbol', 'R$')} {item.finalPrice.toFixed(2)}</Text>
                <View style={styles.quantityContainer}>
                    <TouchableOpacity onPress={() => decreaseQuantity(item.cartItemId)} style={styles.quantityButton}>
                        <Text style={styles.quantityButtonText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.itemQuantity}>{item.quantity}</Text>
                    <TouchableOpacity onPress={() => increaseQuantity(item.cartItemId)} style={styles.quantityButton}>
                        <Text style={styles.quantityButtonText}>+</Text>
                    </TouchableOpacity>
                </View>
                <Text style={styles.itemSubtotal}>{t('cartSubtotal', 'Subtotal:')} {t('currencySymbol', 'R$')} {(item.finalPrice * item.quantity).toFixed(2)}</Text>
            </View>
            <TouchableOpacity onPress={() => removeFromCart(item.cartItemId)} style={styles.removeButton}>
                <Text style={styles.removeButtonText}>✕</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            {items.length === 0 ? (
                <Text style={styles.emptyText}>{t('cartEmpty')}</Text>
            ) : (
                <>
                    <FlatList
                        data={items}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.cartItemId}
                        contentContainerStyle={styles.listContainer}
                    />
                    <View style={styles.summaryContainer}>
                        <Text style={styles.summaryText}>{t('cartTotalItems')} {getTotalItems()}</Text>
                        <Text style={styles.summaryTotal}>{t('cartTotal')} {t('currencySymbol', 'R$')} {getTotalPrice().toFixed(2)}</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.checkoutButton, isPlacingOrder && styles.checkoutButtonDisabled]}
                        onPress={handleCheckout}
                        disabled={isPlacingOrder}
                    >
                        <Text style={styles.checkoutButtonText}>
                            {isPlacingOrder ? t('placingOrder', 'Enviando...') : t('cartCheckoutButton')}
                        </Text>
                        {isPlacingOrder && <ActivityIndicator size="small" color={colors.card} />}
                    </TouchableOpacity>
                </>
            )}
        </View>
    );
}