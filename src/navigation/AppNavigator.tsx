import React, { useState, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import { RootStackParamList, BottomTabParamList } from '../types/navigation';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import CartScreen from '../screens/CartScreen';
import BottomTabNavigator from './BottomTabNavigator';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { NavigatorScreenParams } from '@react-navigation/native';


const Stack = createNativeStackNavigator<RootStackParamList & { MainApp: NavigatorScreenParams<BottomTabParamList> }>();


export default function AppNavigator() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const { colors } = useTheme();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const styles = StyleSheet.create({
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: colors.background,
        }
    });

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    const headerStyleOptions = {
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.primary,
        headerTitleStyle: { color: colors.text },
        headerBackTitleVisible: false,
    };

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {user ? (
                <>
                    <Stack.Screen name="MainApp" component={BottomTabNavigator} />
                    <Stack.Screen
                        name="ProductDetail"
                        component={ProductDetailScreen}
                        options={{
                            headerShown: true,
                            title: 'Detalhes do Produto',
                            ...headerStyleOptions
                        }}
                    />
                    <Stack.Screen
                        name="Cart"
                        component={CartScreen}
                        options={{
                            headerShown: true,
                            title: 'Carrinho',
                            presentation: 'modal',
                            ...headerStyleOptions
                        }}
                    />
                </>
            ) : (
                <>
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen
                        name="Signup"
                        component={SignupScreen}
                        options={{
                            headerShown: true,
                            title: 'Criar Conta',
                            ...headerStyleOptions
                        }}
                    />
                </>
            )}
        </Stack.Navigator>
    );
}