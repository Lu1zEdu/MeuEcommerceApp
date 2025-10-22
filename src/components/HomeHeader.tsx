// src/components/HomeHeader.tsx
import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { lightColors } from '../theme/colors'; // <--- ADICIONE ESTA IMPORTAÇÃO

type HomeHeaderNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HomeHeader: React.FC = () => {
    const navigation = useNavigation<HomeHeaderNavigationProp>();
    const { getTotalItems } = useCart();
    const { colors } = useTheme(); // Obter cores do tema
    const [cartItemCount, setCartItemCount] = useState(0);

    useEffect(() => {
        setCartItemCount(getTotalItems());
    }, [getTotalItems]);

    const goToCart = () => {
        navigation.navigate('Cart');
    };

    const handleSearch = (text: string) => {
        console.log('Pesquisando por:', text);
    };

    // Mover StyleSheet para dentro para acessar 'colors'
    const styles = StyleSheet.create({
        container: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.card,
            paddingHorizontal: 15,
            paddingVertical: 10,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        searchContainer: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.background,
            borderRadius: 20,
            paddingHorizontal: 12,
            height: 40,
            marginRight: 15,
        },
        searchIcon: {
            marginRight: 8,
        },
        searchInput: {
            flex: 1,
            fontSize: 15,
            color: colors.text,
            height: '100%',
        },
        cartButton: {
            padding: 5,
            position: 'relative',
        },
        cartBadge: {
            position: 'absolute',
            right: -6,
            top: -4,
            backgroundColor: colors.notification,
            borderRadius: 10,
            width: 20,
            height: 20,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: colors.card,
        },
        cartBadgeText: {
            color: colors.card, // Assumindo que a cor do card contrasta bem com a notificação
            fontSize: 11,
            fontWeight: 'bold',
        },
    });

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
                <TextInput
                    placeholder="O que você está procurando?"
                    placeholderTextColor={colors.placeholder}
                    style={styles.searchInput}
                    onChangeText={handleSearch}
                    keyboardAppearance={colors.text === lightColors.text ? 'light' : 'dark'}
                />
            </View>

            <TouchableOpacity onPress={goToCart} style={styles.cartButton}>
                <Ionicons name="cart-outline" size={28} color={colors.text} />
                {cartItemCount > 0 && (
                    <View style={styles.cartBadge}>
                        <Text style={styles.cartBadgeText}>{cartItemCount}</Text>
                    </View>
                )}
            </TouchableOpacity>
        </View>
    );
};

export default HomeHeader;