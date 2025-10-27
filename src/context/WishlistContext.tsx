import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { Product } from '../types/navigation';
import { auth, db, doc, getDoc, setDoc, updateDoc, onSnapshot } from '../firebase/firebaseConfig';
import { User, onAuthStateChanged } from 'firebase/auth';
import { arrayRemove, arrayUnion } from 'firebase/firestore';

interface WishlistContextData {
    wishlistProductIds: string[];
    isInWishlist: (productId: string) => boolean;
    toggleWishlist: (product: Product) => Promise<void>;
    loadingWishlist: boolean;
}

const WishlistContext = createContext<WishlistContextData | undefined>(undefined);

interface WishlistProviderProps {
    children: ReactNode;
}

export const WishlistProvider: React.FC<WishlistProviderProps> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
    const [wishlistProductIds, setWishlistProductIds] = useState<string[]>([]);
    const [loadingWishlist, setLoadingWishlist] = useState(true);

    // Observa mudanças no estado de autenticação
    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            if (!user) {
                setWishlistProductIds([]);
                setLoadingWishlist(false);
            } else {
                setLoadingWishlist(true);
            }
        });
        return () => unsubscribeAuth();
    }, []);

    useEffect(() => {
        let unsubscribeFirestore: (() => void) | null = null;

        if (currentUser) {
            setLoadingWishlist(true); // Garante loading ao (re)conectar
            const userWishlistRef = doc(db, 'wishlists', currentUser.uid);

            unsubscribeFirestore = onSnapshot(userWishlistRef, (docSnap) => {
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setWishlistProductIds(Array.isArray(data.productIds) ? data.productIds : []);
                } else {
                    setWishlistProductIds([]);
                }
                setLoadingWishlist(false);
            }, (error) => {
                console.error("Erro ao ouvir wishlist:", error);
                setWishlistProductIds([]);
                setLoadingWishlist(false);
            });

        } else {
            if (unsubscribeFirestore) {
                unsubscribeFirestore = null;
            }
            setWishlistProductIds([]);
            setLoadingWishlist(false);
        }

        return () => {
            if (unsubscribeFirestore) {
                unsubscribeFirestore();
            }
        };
    }, [currentUser]);

    const isInWishlist = (productId: string): boolean => {
        return wishlistProductIds.includes(productId);
    };

    const toggleWishlist = useCallback(async (product: Product) => {
        if (!currentUser) {
            console.warn("Usuário não logado para modificar wishlist.");
            return;
        }

        const userWishlistRef = doc(db, 'wishlists', currentUser.uid);
        const productId = product.id;
        const currentlyInWishlist = wishlistProductIds.includes(productId);

        setWishlistProductIds(prevIds =>
            currentlyInWishlist
                ? prevIds.filter(id => id !== productId)
                : [...prevIds, productId]
        );

        try {
            if (currentlyInWishlist) {
                await updateDoc(userWishlistRef, {
                    productIds: arrayRemove(productId)
                });
                console.log(`Produto ${productId} removido da wishlist no Firestore.`);
            } else {
                await setDoc(userWishlistRef, {
                    productIds: arrayUnion(productId)
                }, { merge: true });
                console.log(`Produto ${productId} adicionado à wishlist no Firestore.`);
            }
        } catch (error) {
            console.error("Erro ao atualizar wishlist no Firestore:", error);
            setWishlistProductIds(prevIds =>
                currentlyInWishlist
                    ? [...prevIds, productId]
                    : prevIds.filter(id => id !== productId)
            );
        }

    }, [currentUser, wishlistProductIds]);

    const contextValue: WishlistContextData = {
        wishlistProductIds,
        isInWishlist,
        toggleWishlist,
        loadingWishlist,
    };

    return (
        <WishlistContext.Provider value={contextValue}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = (): WishlistContextData => {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error('useWishlist deve ser usado dentro de um WishlistProvider');
    }
    return context;
};