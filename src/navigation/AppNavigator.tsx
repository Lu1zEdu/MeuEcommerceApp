import React, { useState, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import { RootStackParamList } from '../types/navigation';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import CartScreen from '../screens/CartScreen';
import BottomTabNavigator from './BottomTabNavigator';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const Stack = createNativeStackNavigator<RootStackParamList & { MainApp: undefined }>();

export default function AppNavigator() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const { colors } = useTheme(); // 2. Obter cores

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // 3. Mover StyleSheet para dentro (apenas o loadingContainer)
    const styles = StyleSheet.create({
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: colors.background, // Usar cor do tema
        }
    });

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} /> {/* Usar cor do tema */}
            </View>
        );
    }

    // Estilos comuns para os Headers
    const headerStyleOptions = {
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.primary, // Cor do botão voltar e título padrão
        headerTitleStyle: { color: colors.text }, // Cor específica do título
        headerBackTitleVisible: false,
    };

    return (
        // 4. Aplicar cores nos headers onde headerShown: true
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
                            ...headerStyleOptions // Aplicar estilos comuns
                        }}
                    />
                    <Stack.Screen
                        name="Cart"
                        component={CartScreen}
                        options={{
                            headerShown: true,
                            title: 'Carrinho',
                            presentation: 'modal',
                            ...headerStyleOptions // Aplicar estilos comuns
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
                            ...headerStyleOptions // Aplicar estilos comuns
                        }}
                    />
                </>
            )}
        </Stack.Navigator>
    );
}