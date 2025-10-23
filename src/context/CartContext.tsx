import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Product } from '../types/navigation';
import { useTranslation } from 'react-i18next'; // Para logs traduzidos (opcional)

export interface CartItem extends Product {
    quantity: number;
}

interface CartContextData {
    items: CartItem[];
    addToCart: (product: Product, quantity?: number) => void;
    removeFromCart: (productId: string) => void;
    increaseQuantity: (productId: string) => void;
    decreaseQuantity: (productId: string) => void;
    getTotalItems: () => number;
    getTotalPrice: () => number;
    clearCart: () => void;
}

const CartContext = createContext<CartContextData | undefined>(undefined);

interface CartProviderProps {
    children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
    const [items, setItems] = useState<CartItem[]>([]);
    const { t } = useTranslation();

    const addToCart = (product: Product, quantity: number = 1) => {
        if (quantity <= 0 || !Number.isInteger(quantity)) {
            console.warn("Attempted to add invalid quantity:", quantity);
            return;
        }
        if (!product || !product.id || !product.price) {
            console.error("Attempted to add invalid product:", product);
            return;
        }


        setItems(prevItems => {
            const existingItem = prevItems.find(item => item.id === product.id);
            if (existingItem) {
                console.log(`Atualizando quantidade para ${product.name}: ${existingItem.quantity} + ${quantity}`);
                return prevItems.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            } else {
                console.log(`Adicionando novo item ${product.name} com quantidade ${quantity}`);
                return [...prevItems, { ...product, quantity: quantity }];
            }
        });
        console.log(`Adicionado ${quantity} de ${product.name}. Total no carrinho:`, getTotalItems());
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
            const updatedItems = prevItems.map(item => {
                if (item.id === productId) {
                    return { ...item, quantity: Math.max(1, item.quantity - 1) };
                }
                return item;
            });
            // Opcional: Remover se a quantidade chegar a 0 (embora a lógica acima previna isso)
            // return updatedItems.filter(item => item.quantity > 0);
            return updatedItems;

            // Lógica anterior que removia o item se a quantidade fosse 1:
            // const existingItem = prevItems.find(item => item.id === productId);
            // if (existingItem && existingItem.quantity === 1) {
            //     return prevItems.filter(item => item.id !== productId);
            // } else {
            //     return prevItems.map(item =>
            //         item.id === productId
            //             ? { ...item, quantity: item.quantity - 1 }
            //             : item
            //     );
            // }
        });
    };

    const getTotalItems = (): number => {
        return items.reduce((total, item) => total + item.quantity, 0);
    };

    const getTotalPrice = (): number => {
        return items.reduce((total, item) => {
            const price = Number(item.price) || 0;
            const quantity = Number(item.quantity) || 0;
            return total + price * quantity;
        }, 0);
    };

    const clearCart = () => {
        setItems([]);
        console.log("Carrinho limpo.");
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
        throw new Error('useCart deve ser usado dentro de um CartProvider');
    }
    return context;
};