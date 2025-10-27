import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import i18n from './i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationData } from '../types/navigation';
import { t } from 'i18next';

const NOTIFICATIONS_STORAGE_KEY = '@MyApp:Notifications_v2';
const MAX_STORED_NOTIFICATIONS = 50;

Notifications.setNotificationHandler({
    handleNotification: async (notification) => {
        await addReceivedNotification(notification);
        return {
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
            shouldShowBanner: true,
            shouldShowList: true,
        };
    },
});

async function addReceivedNotification(notification: Notifications.Notification) {
    const receivedDate = notification.date ? new Date(notification.date * 1000) : new Date();

    const baseNotification: Omit<NotificationData, 'date'> & { date: string } = {
        id: notification.request.identifier,
        title: notification.request.content.title || t('noTitle', 'Sem Título'),
        body: notification.request.content.body || t('noBody', 'Sem Conteúdo'),
        data: notification.request.content.data,
        read: false,
        date: receivedDate.toISOString(),
    };


    try {
        const existingNotificationsJson = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
        let notifications: (Omit<NotificationData, 'date'> & { date: string })[] = [];
        if (existingNotificationsJson) {
            try {
                notifications = JSON.parse(existingNotificationsJson);
                if (!Array.isArray(notifications)) {
                    notifications = [];
                }
            } catch (parseError) {
                console.error("Erro ao parsear notificações existentes:", parseError);
                notifications = [];
            }
        }


        notifications.unshift(baseNotification);

        if (notifications.length > MAX_STORED_NOTIFICATIONS) {
            notifications = notifications.slice(0, MAX_STORED_NOTIFICATIONS);
        }

        await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
        console.log('Notificação armazenada:', baseNotification.id);
    } catch (error) {
        console.error("Erro ao armazenar notificação:", error);
    }
}

export async function getStoredNotifications(): Promise<NotificationData[]> {
    try {
        const notificationsJson = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
        if (!notificationsJson) return [];

        let storedItems: any[] = [];
        try {
            storedItems = JSON.parse(notificationsJson);
            if (!Array.isArray(storedItems)) {
                console.error("Dados de notificação armazenados não são um array.");
                return [];
            }
        } catch (parseError) {
            console.error("Erro ao parsear notificações armazenadas:", parseError);
            return [];
        }


        const notificationsWithDateObjects = storedItems
            .map(item => {
                if (item && typeof item.date === 'string') {
                    const dateObj = new Date(item.date);
                    if (!isNaN(dateObj.getTime())) {
                        return {
                            ...item,
                            date: dateObj,
                        };
                    }
                }
                console.warn("Item de notificação inválido ou data ausente/inválida:", item);
                return null;
            })
            .filter((item): item is NotificationData => item !== null);

        return notificationsWithDateObjects;

    } catch (error) {
        console.error("Erro ao buscar notificações armazenadas:", error);
        return [];
    }
}

export async function markNotificationAsRead(notificationId: string) {
    try {
        const notifications = await getStoredNotifications();
        const updatedNotificationsWithStringDate = notifications.map(n => {
            const newItem = n.id === notificationId ? { ...n, read: true } : n;
            const dateString = (newItem.date instanceof Date && !isNaN(newItem.date.getTime()))
                ? newItem.date.toISOString()
                : new Date().toISOString(); 
            return { ...newItem, date: dateString };
        });

        await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updatedNotificationsWithStringDate));
    } catch (error) {
        console.error("Erro ao marcar notificação como lida:", error);
    }
}

export async function clearStoredNotifications() {
    try {
        await AsyncStorage.removeItem(NOTIFICATIONS_STORAGE_KEY);
        console.log('Notificações armazenadas foram limpas.');
    } catch (error) {
        console.error("Erro ao limpar notificações armazenadas:", error);
    }
}


export async function registerForPushNotificationsAsync(): Promise<string | undefined> {
    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync({
            ios: {
                allowAlert: true,
                allowBadge: true,
                allowSound: true,
            },
        });
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        alert(i18n.t('notificationPermissionDenied', 'Permissão de notificações negada!'));
        return;
    }

    try {
        token = (await Notifications.getExpoPushTokenAsync()).data;
        console.log("Expo Push Token:", token);
    } catch (e) {
        console.warn("Aviso ao obter Expo Push Token (pode ser esperado no Expo Go):", e);
    }

    return token;
}

export async function scheduleLocalNotification(title: string, body: string, data?: Record<string, any>, seconds: number = 1) {
    try {
        const identifier = await Notifications.scheduleNotificationAsync({
            content: {
                title: title,
                body: body,
                data: data,
                sound: 'default',
            },
            trigger: { seconds: Math.max(1, seconds) },
        });
        console.log(`Notificação local agendada com ID: ${identifier}`);
        return identifier;
    } catch (error) {
        console.error("Erro ao agendar notificação local:", error);
        alert(t('errorScheduleNotification', 'Não foi possível agendar a notificação.'));
    }
}


export async function cancelAllScheduledNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log("Todas as notificações agendadas foram canceladas.");
}

Notifications.addNotificationReceivedListener(notification => {
    console.log('Notificação recebida em foreground:', notification.request.identifier);
});

Notifications.addNotificationResponseReceivedListener(response => {
    console.log('Notificação respondida:', response.notification.request.identifier);
    const data = response.notification.request.content.data;
    console.log('Dados da notificação:', data);
    markNotificationAsRead(response.notification.request.identifier);
    if (data && data.navigateTo === 'Transaction') {
        console.log('Navegar para a tela de Pedidos (implementação necessária)');
    }
});