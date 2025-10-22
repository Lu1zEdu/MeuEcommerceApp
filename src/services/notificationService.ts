import * as Notifications from 'expo-notifications';
import { Platform, Alert } from 'react-native';
import i18n from './i18n';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowInForeground: true,
        shouldShowList: true,
    }),
});

export async function registerForPushNotificationsAsync(): Promise<string | undefined> {
    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
        console.log("Canal de notificação Android 'default' configurado.");
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        console.log("Permissões de notificação não concedidas, solicitando...");
        const { status } = await Notifications.requestPermissionsAsync({
            ios: {
                allowAlert: true,
                allowBadge: true,
                allowSound: true,
            },
        });
        finalStatus = status;
        console.log("Status da permissão após solicitar:", finalStatus);
    }

    if (finalStatus !== 'granted') {
        Alert.alert('Falha ao obter permissão', 'Permissão de notificações não concedida. Algumas funcionalidades podem não estar disponíveis.');
        console.warn("Permissão de notificações não concedida!");
        return;
    }

    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log("Expo Push Token:", token);
    console.log("Permissão de notificações concedida.");
    return 'granted';
}

export async function scheduleLocalNotification(title: string, body: string, data?: Record<string, any>) {
    console.log(`Agendando notificação local: ${title} - ${body}`);
    await Notifications.scheduleNotificationAsync({
        content: {
            title: title,
            body: body,
            data: data,
            sound: 'default',
        },
        trigger: { seconds: 5 },
    });
    console.log("Notificação local agendada.");
}

export async function scheduleDailyNotification(title: string, body: string, hour: number, minute: number, data?: Record<string, any>) {
    console.log(`Agendando notificação diária para ${hour}:${minute}`);
    await Notifications.scheduleNotificationAsync({
        content: {
            title: title,
            body: body,
            data: data,
            sound: 'default',
        },
        trigger: {
            hour: hour,
            minute: minute,
            repeats: true,
        },
    });
    console.log("Notificação diária agendada.");
}

export async function cancelAllScheduledNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log("Todas as notificações agendadas foram canceladas.");
}