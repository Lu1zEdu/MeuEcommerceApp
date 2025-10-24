import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useFocusEffect } from '@react-navigation/native';
import { Order, OrderItem, OrderStatus } from '../types/navigation';
import { db, collection, query, where, getDocs, Timestamp, orderBy, auth } from '../firebase/firebaseConfig';
import { useTranslation } from 'react-i18next';

export default function TransactionScreen() {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const user = auth.currentUser;

    const fetchOrders = useCallback(async () => {
        if (!user) {
            setOrders([]);
            setLoading(false);
            setRefreshing(false);
            return;
        }

        if (!refreshing) {
            setLoading(true);
        }

        try {
            const ordersRef = collection(db, 'orders');
            const q = query(ordersRef, where("userId", "==", user.uid), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            const fetchedOrders = querySnapshot.docs.map(doc => {
                const data = doc.data();
                const createdAtDate = data.createdAt instanceof Timestamp
                    ? data.createdAt.toDate()
                    : (data.createdAt || new Date());
                return {
                    id: doc.id,
                    ...data,
                    createdAt: createdAtDate,
                } as Order;
            });
            setOrders(fetchedOrders);
        } catch (error) {
            console.error("Erro ao buscar pedidos:", error);
            alert(t('errorLoadingOrders', 'Erro ao carregar pedidos.'));
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user, refreshing, t]);

    useFocusEffect(
        useCallback(() => {
            fetchOrders();
        }, [fetchOrders])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchOrders();
    }, [fetchOrders]);


    const formatTimestamp = (date: Date | undefined): string => {
        if (!date || !(date instanceof Date)) return 'Data indisponível';
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusText = (status: OrderStatus): string => {
        switch (status) {
            case 'pending': return t('statusPending', 'Pendente');
            case 'processing': return t('statusProcessing', 'Processando');
            case 'shipped': return t('statusShipped', 'Enviado');
            case 'delivered': return t('statusDelivered', 'Entregue');
            case 'cancelled': return t('statusCancelled', 'Cancelado');
            default: return status;
        }
    };

    const renderOrderItem = ({ item }: { item: OrderItem }) => (
        <Text style={styles.orderItemText}>
            - {item.quantity}x {item.name} {item.selectedVariations && Object.keys(item.selectedVariations).length > 0 ? `(${formatVariations(item.selectedVariations)})` : ''} - {t('currencySymbol', 'R$')}{item.finalPrice.toFixed(2)}
        </Text>
    );

    const formatVariations = (variations?: { [key: string]: string }): string => {
        if (!variations || Object.keys(variations).length === 0) {
            return '';
        }
        return Object.entries(variations)
            .map(([key, value]) => value)
            .join(', ');
    };

    const renderOrder = ({ item }: { item: Order }) => (
        <View style={styles.orderCard}>
            <View style={styles.orderHeader}>
                <Text style={styles.orderId}>{t('orderIdLabel', 'Pedido:')} #{item.id?.substring(0, 6)}...</Text>
                <Text style={[styles.orderStatus, { color: getStatusColor(item.status) }]}>{getStatusText(item.status)}</Text>
            </View>
            <Text style={styles.orderDate}>{formatTimestamp(item.createdAt as Date)}</Text>
            {item.items && item.items.length > 0 ? (
                <FlatList
                    data={item.items}
                    renderItem={renderOrderItem}
                    keyExtractor={(orderItem, index) => `${orderItem.productId}-${index}-${JSON.stringify(orderItem.selectedVariations || {})}`}
                    style={styles.itemList}
                />
            ) : (
                <Text style={styles.orderItemText}>{t('noItemsInOrder', 'Nenhum item neste pedido.')}</Text>
            )}

            <Text style={styles.orderTotal}>{t('cartTotal', 'Total:')} {t('currencySymbol', 'R$')}{item.totalPrice.toFixed(2)}</Text>
        </View>
    );

    const getStatusColor = (status: OrderStatus) => {
        switch (status) {
            case 'pending': return colors.notification;
            case 'processing': return colors.primary;
            case 'shipped': return '#ffc107';
            case 'delivered': return '#28a745';
            case 'cancelled': return colors.textSecondary;
            default: return colors.text;
        }
    };

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
            padding: 10,
        },
        orderCard: {
            backgroundColor: colors.card,
            borderRadius: 8,
            padding: 15,
            marginBottom: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 3,
        },
        orderHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 5,
            alignItems: 'center',
        },
        orderId: {
            fontSize: 14,
            fontWeight: 'bold',
            color: colors.text,
            flexShrink: 1,
            marginRight: 8,
        },
        orderStatus: {
            fontSize: 13,
            fontWeight: 'bold',
            textAlign: 'right',
        },
        orderDate: {
            fontSize: 12,
            color: colors.textSecondary,
            marginBottom: 10,
        },
        itemList: {
            marginBottom: 10,
            marginLeft: 5,
        },
        orderItemText: {
            fontSize: 13,
            color: colors.textSecondary,
            marginBottom: 3,
        },
        orderTotal: {
            fontSize: 15,
            fontWeight: 'bold',
            color: colors.text,
            textAlign: 'right',
            marginTop: 5,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            paddingTop: 8,
        },
    });

    if (loading && !refreshing && orders.length === 0) {
        return (
            <View style={styles.centerContent}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>{t('loadingOrders', 'Carregando pedidos...')}</Text>
            </View>
        );
    }

    if (!user) {
        return (
            <View style={styles.centerContent}>
                <Text style={styles.emptyText}>{t('loginToViewOrders', 'Faça login para ver seus pedidos.')}</Text>
            </View>
        );
    }


    return (
        <View style={styles.container}>
            {orders.length === 0 && !loading ? (
                <View style={styles.centerContent}>
                    <Text style={styles.emptyText}>{t('noOrdersYet', 'Você ainda não fez nenhum pedido.')}</Text>
                    <TouchableOpacity onPress={onRefresh} style={{ marginTop: 15 }}>
                        <Text style={{ color: colors.primary }}>{t('tryRefresh', 'Tentar recarregar')}</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={orders}
                    renderItem={renderOrder}
                    keyExtractor={(item) => item.id!}
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