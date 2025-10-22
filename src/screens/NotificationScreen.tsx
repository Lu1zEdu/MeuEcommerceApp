import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native'; // 1. Importar Button
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { cancelAllScheduledNotifications, scheduleLocalNotification } from '../services/notificationService';

export default function NotificationScreen() {
    const { colors } = useTheme();
    const { t } = useTranslation();

    const handleSendNotification = () => {
        scheduleLocalNotification(
            "Olá! 👋",
            "Esta é uma notificação local de teste do MeuEcommerceApp!",
            { customData: 'algum dado útil' } // Dados opcionais
        );
    };

    const handleCancelNotifications = () => {
        cancelAllScheduledNotifications();
        alert("Notificações agendadas canceladas!"); // Feedback simples
    };
    const styles = StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: colors.background, // Cor do tema
            padding: 20,
        },
        title: {
            fontSize: 24,
            fontWeight: 'bold',
            color: colors.text, // Cor do tema
            marginBottom: 10,
        },
        placeholder: {
            fontSize: 16,
            color: colors.textSecondary,
        }, buttonContainer: {
            width: '80%',
            marginTop: 20,
            marginBottom: 10,
        },
    });

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{t('notificationsTab')}</Text>
            <Text style={styles.placeholder}>Sua caixa de entrada está vazia.</Text>
            <View style={styles.buttonContainer}>
                <Button
                    title="Enviar Notificação de Teste Agora"
                    onPress={handleSendNotification}
                    color={colors.primary}
                />
            </View>
            <View style={styles.buttonContainer}>
                <Button
                    title="Cancelar Notificações Agendadas"
                    onPress={handleCancelNotifications}
                    color={colors.notification}
                />
            </View>
        </View>
    );
}