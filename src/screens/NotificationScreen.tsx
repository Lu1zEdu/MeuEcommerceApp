import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Button, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import { scheduleLocalNotification, getStoredNotifications, clearStoredNotifications, markNotificationAsRead } from '../services/notificationService';
import { NotificationData } from '../types/navigation';

export default function NotificationScreen() {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const [notifications, setNotifications] = useState<NotificationData[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);


    const loadNotifications = useCallback(async (isRefresh = false) => {
        if (!isRefresh) {
            setLoading(true);
        }
        try {
            const storedNotifications = await getStoredNotifications();
            storedNotifications.sort((a, b) => b.date.getTime() - a.date.getTime());
            setNotifications(storedNotifications);
        } catch (error) {
            console.error("Erro ao carregar notificações:", error);
            alert(t('errorLoadingNotifications', 'Erro ao carregar notificações.'));
        } finally {
            if (!isRefresh) {
                setLoading(false);
            }
            setRefreshing(false);
        }
    }, [t]);

    useFocusEffect(
        useCallback(() => {
            loadNotifications();
        }, [loadNotifications])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadNotifications(true);
    }, [loadNotifications]);

    const handleSendNotification = () => {
        scheduleLocalNotification(
            "Teste Rápido! 🚀",
            "Esta é uma notificação de teste disparada manualmente.",
            { testData: 'manual_trigger' },
        );
        setTimeout(() => loadNotifications(true), 4000);
    };

    const handleClearNotifications = async () => {
        await clearStoredNotifications();
        setNotifications([]);
        alert(t('notificationsCleared', 'Notificações limpas!'));
    };

    const handleNotificationPress = (item: NotificationData) => {
        if (!item.read) {
            markNotificationAsRead(item.id);
            setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, read: true } : n));
        }
        console.log("Notificação pressionada:", item.id, item.data);
        if (item.data?.navigateTo === 'Transaction') {
            alert(t('navigateToOrders', 'Navegando para Pedidos... (implementar navegação)'));
        } else if (item.data?.orderId) {
            alert(t('viewOrderDetails', 'Visualizando detalhes do pedido: ') + item.data.orderId);
        }
    };

    const renderNotificationItem = ({ item }: { item: NotificationData }) => (
        <TouchableOpacity onPress={() => handleNotificationPress(item)} activeOpacity={0.7}>
            <View style={[styles.notificationItem, !item.read && styles.notificationUnread]}>
                <View style={styles.notificationHeader}>
                    <Text style={[styles.notificationTitle, !item.read && styles.notificationTextUnread]} numberOfLines={1} ellipsizeMode='tail'>{item.title}</Text>
                    <Text style={[styles.notificationDate, !item.read && styles.notificationTextUnread]}>
                        {item.date.toLocaleDateString('pt-BR')} {item.date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>

                <Text style={[styles.notificationBody, !item.read && styles.notificationTextUnread]} numberOfLines={2} ellipsizeMode='tail'>{item.body}</Text>
            </View>
        </TouchableOpacity>
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
            padding: 10,
        },
        notificationItem: {
            backgroundColor: colors.card,
            paddingVertical: 12,
            paddingHorizontal: 15,
            marginBottom: 10,
            borderRadius: 8,
            borderLeftWidth: 4,
            borderLeftColor: colors.border,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 1,
            elevation: 1,
        },
        notificationUnread: {
            borderLeftColor: colors.primary,
            backgroundColor: colors.border
        },
        notificationHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 5,
        },
        notificationTitle: {
            fontSize: 15,
            fontWeight: 'normal',
            color: colors.textSecondary,
            flexShrink: 1,
            marginRight: 10,
        },
        notificationDate: {
            fontSize: 11,
            color: colors.textSecondary,
            flexShrink: 0,
        },
        notificationBody: {
            fontSize: 14,
            color: colors.textSecondary,
        },
        notificationTextUnread: {
            color: colors.text,
            fontWeight: '600',
        },
        buttonContainer: {
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            backgroundColor: colors.card,
            flexDirection: 'row',
            justifyContent: 'space-around',
            paddingBottom: Platform.OS === 'ios' ? 20 : 10,
        },
        buttonWrapper: {
            marginHorizontal: 5,
            flex: 1,
        }
    });

    return (
        <View style={styles.container}>
            {loading ? (
                <View style={styles.centerContent}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>{t('loadingNotifications', 'Carregando notificações...')}</Text>
                </View>
            ) : notifications.length === 0 ? (
                <View style={styles.centerContent}>
                    <Text style={styles.emptyText}>{t('noNotifications', 'Nenhuma notificação ainda.')}</Text>
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    renderItem={renderNotificationItem}
                    keyExtractor={(item) => item.id}
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

            <View style={styles.buttonContainer}>
                <View style={styles.buttonWrapper}>
                    <Button
                        title={t('sendTestNotification', "Testar Notif.")}
                        onPress={handleSendNotification}
                        color={colors.primary}
                    />
                </View>
                <View style={styles.buttonWrapper}>
                    <Button
                        title={t('clearNotifications', "Limpar Tudo")}
                        onPress={handleClearNotifications}
                        color={colors.notification}
                        disabled={notifications.length === 0}
                    />
                </View>
            </View>
        </View>
    );
}