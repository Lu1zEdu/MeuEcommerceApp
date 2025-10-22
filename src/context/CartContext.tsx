// src/context/CartContext.tsx
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Product } from '../types/navigation';

export interface CartItem extends Product {
    quantity: number;
}

interface CartContextData {
    items: CartItem[];
    addToCart: (product: Product) => void;
    removeFromCart: (productId: string) => void;
    increaseQuantity: (productId: string) => void;
    decreaseQuantity: (productId: string) => void;
    getTotalItems: () => number;
    getTotalPrice: () => number;
}

const CartContext = createContext<CartContextData | undefined>(undefined);

interface CartProviderProps {
    children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
    const [items, setItems] = useState<CartItem[]>([]);

    const addToCart = (product: Product) => {
        setItems(prevItems => {
            const existingItem = prevItems.find(item => item.id === product.id);
            if (existingItem) {
                // Se o item já existe, incrementa a quantidade
                return prevItems.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            } else {
                // Se é um novo item, adiciona com quantidade 1
                return [...prevItems, { ...product, quantity: 1 }];
            }
        });
        console.log('Adicionado ao carrinho via Context:', product.name, 'Itens atuais:', items);
    };

    const removeFromCart = (productId: string) => {
        setItems(prevItems => prevItems.filter(item => item.id !== productId));
        console.log('Removido do carrinho via Context:', productId);
    };

    const increaseQuantity = (productId: string) => {
        setItems(prevItems =>
            prevItems.map(item =>
                item.id === productId
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            )
        );
    };

    const decreaseQuantity = (productId: string) => {
        setItems(prevItems => {
            const existingItem = prevItems.find(item => item.id === productId);
            // Se a quantidade for 1, remove o item; senão, decrementa
            if (existingItem && existingItem.quantity === 1) {
                return prevItems.filter(item => item.id !== productId);
            } else {
                return prevItems.map(item =>
                    item.id === productId
                        ? { ...item, quantity: item.quantity - 1 }
                        : item
                );
            }
        });
    };

    const getTotalItems = (): number => {
        return items.reduce((total, item) => total + item.quantity, 0);
    };

    const getTotalPrice = (): number => {
        return items.reduce((total, item) => total + item.price * item.quantity, 0);
    };

    const contextValue: CartContextData = {
        items,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        getTotalItems,
        getTotalPrice,
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
        throw new Error('useCart deve ser usado dentro de um CartProvider');
    }
    return context;
};