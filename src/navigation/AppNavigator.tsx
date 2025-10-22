import React, { useState, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import { RootStackParamList } from '../types/navigation';
import ProductListScreen from '../screens/ProductListScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import CartScreen from '../screens/CartScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
            console.log("Estado Auth Alterado:", currentUser ? `Logado como ${currentUser.email}` : "Não logado");
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <Stack.Navigator>
            {user ? (
                <>
                    <Stack.Screen
                        name="ProductList"
                        component={ProductListScreen}
                        options={{ title: 'Produtos' }}
                    />
                    <Stack.Screen
                        name="ProductDetail"
                        component={ProductDetailScreen}
                        options={{ title: 'Detalhes do Produto' }}
                    />
                    <Stack.Screen
                        name="Cart"
                        component={CartScreen} // Verifique se é CartScreen aqui
                        options={{ title: 'Carrinho' }}
                    />
                </>
            ) : (
                <>
                    <Stack.Screen
                        name="Login"
                        component={LoginScreen}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="Signup"
                        component={SignupScreen}
                        options={{ title: 'Cadastro' }}
                    />
                </>
            )}
        </Stack.Navigator>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});