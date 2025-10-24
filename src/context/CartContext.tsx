import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Product, SelectedVariationsType } from '../types/navigation';
import { useTranslation } from 'react-i18next';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

export interface CartItem extends Omit<Product, 'id' | 'variations' | 'stock' | 'imageUrls'> {
    cartItemId: string;
    productId: string;
    quantity: number;
    selectedVariations?: SelectedVariationsType;
    finalPrice: number;
    imageUrl?: string;
}


interface CartContextData {
    items: CartItem[];
    addToCart: (product: Product, quantity: number, selectedVariations: SelectedVariationsType, finalPrice: number) => void;
    removeFromCart: (cartItemId: string) => void;
    increaseQuantity: (cartItemId: string) => void;
    decreaseQuantity: (cartItemId: string) => void;
    getTotalItems: () => number;
    getTotalPrice: () => number;
    clearCart: () => void;
}

const CartContext = createContext<CartContextData | undefined>(undefined);

interface CartProviderProps {
    children: ReactNode;
}

const generateCartItemId = (productId: string, variations?: SelectedVariationsType): string => {
    if (!variations || Object.keys(variations).length === 0) {
        return productId;
    }
    const sortedKeys = Object.keys(variations).sort();
    const variationString = sortedKeys.map(key => `${key}:${variations[key]}`).join('|');
    return `${productId}-${variationString}`;
};


export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
    const [items, setItems] = useState<CartItem[]>([]);
    const { t } = useTranslation();

    const addToCart = (product: Product, quantity: number = 1, selectedVariations: SelectedVariationsType = {}, finalPrice: number) => {
        if (quantity <= 0 || !Number.isInteger(quantity)) {
            return;
        }
        if (!product || !product.id || typeof finalPrice !== 'number') {
            return;
        }

        const cartItemId = generateCartItemId(product.id, selectedVariations);
        const imageUrl = product.imageUrls?.[0] || product.imageUrl;
        setItems(prevItems => {
            const existingItemIndex = prevItems.findIndex(item => item.cartItemId === cartItemId);

            if (existingItemIndex > -1) {
                const updatedItems = [...prevItems];
                updatedItems[existingItemIndex] = {
                    ...updatedItems[existingItemIndex],
                    quantity: updatedItems[existingItemIndex].quantity + quantity,
                };
                return updatedItems;
            } else {
                const { id, variations, stock, imageUrls, ...productData } = product;
                const newItem: CartItem = {
                    ...productData,
                    cartItemId: cartItemId,
                    productId: product.id,
                    quantity: quantity,
                    selectedVariations: selectedVariations,
                    finalPrice: finalPrice,
                    imageUrl: imageUrl,
                };
                return [...prevItems, newItem];
            }
        });
    };


    const removeFromCart = (cartItemId: string) => {
        setItems(prevItems => prevItems.filter(item => item.cartItemId !== cartItemId));
    };

    const increaseQuantity = (cartItemId: string) => {
        setItems(prevItems =>
            prevItems.map(item =>
                item.cartItemId === cartItemId
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            )
        );
    };

    const decreaseQuantity = (cartItemId: string) => {
        setItems(prevItems => {
            const existingItem = prevItems.find(item => item.cartItemId === cartItemId);
            if (existingItem && existingItem.quantity === 1) {
                return prevItems.filter(item => item.cartItemId !== cartItemId);
            } else {
                return prevItems.map(item =>
                    item.cartItemId === cartItemId
                        ? { ...item, quantity: Math.max(0, item.quantity - 1) }
                        : item
                );
            }
        });
    };


    const getTotalItems = (): number => {
        return items.reduce((total, item) => total + item.quantity, 0);
    };

    const getTotalPrice = (): number => {
        return items.reduce((total, item) => {
            const price = Number(item.finalPrice) || 0;
            const quantity = Number(item.quantity) || 0;
            return total + price * quantity;
        }, 0);
    };

    const clearCart = () => {
        setItems([]);
    };

    const contextValue: CartContextData = {
        items,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        getTotalItems,
        getTotalPrice,
        clearCart,
    };

    return (
        <CartContext.Provider value={contextValue}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = (): CartContextData => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};