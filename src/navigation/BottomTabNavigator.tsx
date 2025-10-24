import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import ProductListScreen from '../screens/ProductListScreen';
import WishlistScreen from '../screens/WishlistScreen';
import TransactionScreen from '../screens/TransactionScreen';
import NotificationScreen from '../screens/NotificationScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { BottomTabParamList } from '../types/navigation';
import { useTranslation } from 'react-i18next';

const Tab = createBottomTabNavigator<BottomTabParamList>();

export default function BottomTabNavigator() {
    const { colors } = useTheme();
    const { t } = useTranslation();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: React.ComponentProps<typeof Ionicons>['name'];

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
                headerStyle: {
                    backgroundColor: colors.card,
                    shadowColor: 'transparent',
                    elevation: 0,
                },
                headerTitleStyle: {
                    color: colors.text,
                },
                headerShown: true,
                tabBarStyle: {
                    backgroundColor: colors.card,
                    borderTopColor: colors.border,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                },
            })}
        >
            <Tab.Screen name="Home" component={ProductListScreen} options={{ title: t('homeTab'), headerShown: false }} />
            <Tab.Screen name="Wishlist" component={WishlistScreen} options={{ title: t('wishlistTab') }} />
            <Tab.Screen name="Transaction" component={TransactionScreen} options={{ title: t('ordersTab') }} />
            <Tab.Screen name="Notification" component={NotificationScreen} options={{ title: t('notificationsTab') }} />
            <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: t('profileTab') }} />
        </Tab.Navigator>
    );
}