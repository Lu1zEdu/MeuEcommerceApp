import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import ProductListScreen from '../screens/ProductListScreen';
import WishlistScreen from '../screens/WishlistScreen';
import TransactionScreen from '../screens/TransactionScreen';
import NotificationScreen from '../screens/NotificationScreen';
import ProfileScreen from '../screens/ProfileScreen';

export type BottomTabParamList = {
    Home: undefined;
    Wishlist: undefined;
    Transaction: undefined;
    Notification: undefined;
    Profile: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

export default function BottomTabNavigator() {
    const { colors } = useTheme(); // 2. Obter cores

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: React.ComponentProps<typeof Ionicons>['name'];
                    // ... (lógica dos ícones inalterada) ...
                    switch (route.name) {
                        case 'Home':
                            iconName = focused ? 'home' : 'home-outline';
                            break;
                        case 'Wishlist':
                            iconName = focused ? 'heart' : 'heart-outline';
                            break;
                        case 'Transaction':
                            iconName = focused ? 'receipt' : 'receipt-outline';
                            break;
                        case 'Notification':
                            iconName = focused ? 'notifications' : 'notifications-outline';
                            break;
                        case 'Profile':
                            iconName = focused ? 'person' : 'person-outline';
                            break;
                        default:
                            iconName = 'alert-circle-outline';
                    }
                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textSecondary,
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: colors.card,
                    borderTopColor: colors.border,
                },
                tabBarLabelStyle: { // Estilo opcional para o texto da label
                    fontSize: 11,
                    color: colors.text // Geralmente herda tabBarActive/InactiveTintColor
                },
            })}
        >
            <Tab.Screen name="Home" component={ProductListScreen} options={{ title: 'Início' }} />
            <Tab.Screen name="Wishlist" component={WishlistScreen} options={{ title: 'Desejos' }} />
            <Tab.Screen name="Transaction" component={TransactionScreen} options={{ title: 'Pedidos' }} />
            <Tab.Screen name="Notification" component={NotificationScreen} options={{ title: 'Notificações' }} />
            <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Perfil' }} />
        </Tab.Navigator>
    );
}