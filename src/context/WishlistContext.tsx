import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { Product } from '../types/navigation';
import { auth, db, doc, getDoc, setDoc, updateDoc, onSnapshot } from '../firebase/firebaseConfig'; // Firestore functions
import { User, onAuthStateChanged } from 'firebase/auth';
import { arrayRemove, arrayUnion } from 'firebase/firestore';

interface WishlistContextData {
    wishlistProductIds: string[]; // Apenas os IDs dos produtos na wishlist
    isInWishlist: (productId: string) => boolean;
    toggleWishlist: (product: Product) => Promise<void>; // Adiciona ou remove
    loadingWishlist: boolean;
}

const WishlistContext = createContext<WishlistContextData | undefined>(undefined);

interface WishlistProviderProps {
    children: ReactNode;
}

export const WishlistProvider: React.FC<WishlistProviderProps> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
    const [wishlistProductIds, setWishlistProductIds] = useState<string[]>([]);
    const [loadingWishlist, setLoadingWishlist] = useState(true); // Loading inicial

    // Observa mudanças no estado de autenticação
    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            if (!user) {
                // Se deslogar, limpa a wishlist local e para de ouvir o Firestore
                setWishlistProductIds([]);
                setLoadingWishlist(false); // Para loading se estava ativo
            } else {
                setLoadingWishlist(true); // Inicia loading ao logar (antes de ouvir)
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
                    // Garante que productIds seja um array, mesmo que vazio
                    setWishlistProductIds(Array.isArray(data.productIds) ? data.productIds : []);
                } else {
                    // Se o documento não existe, a wishlist está vazia
                    setWishlistProductIds([]);
                }
                setLoadingWishlist(false); // Finaliza loading após receber dados (ou a confirmação que não existe)
            }, (error) => {
                console.error("Erro ao ouvir wishlist:", error);
                setWishlistProductIds([]); // Limpa em caso de erro
                setLoadingWishlist(false); // Finaliza loading em caso de erro
            });

        } else {
            // Se não há usuário, garante que não há listener ativo
            if (unsubscribeFirestore) {
                unsubscribeFirestore = null;
            }
            setWishlistProductIds([]); // Garante limpeza se deslogar
            setLoadingWishlist(false); // Garante que loading está falso se deslogado
        }

        // Cleanup: Cancela o listener do Firestore ao desmontar ou quando o usuário muda
        return () => {
            if (unsubscribeFirestore) {
                unsubscribeFirestore();
            }
        };
    }, [currentUser]); // Reativa o efeito quando currentUser muda

    // Verifica se um produto está na wishlist local
    const isInWishlist = (productId: string): boolean => {
        return wishlistProductIds.includes(productId);
    };

    // Adiciona ou remove um produto da wishlist (local e Firestore)
    const toggleWishlist = useCallback(async (product: Product) => {
        if (!currentUser) {
            console.warn("Usuário não logado para modificar wishlist.");
            // Poderia navegar para o login aqui
            return;
        }

        const userWishlistRef = doc(db, 'wishlists', currentUser.uid);
        const productId = product.id;
        const currentlyInWishlist = wishlistProductIds.includes(productId);

        // Otimização: Atualiza o estado local imediatamente para feedback rápido
        setWishlistProductIds(prevIds =>
            currentlyInWishlist
                ? prevIds.filter(id => id !== productId)
                : [...prevIds, productId]
        );

        try {
            // Tenta atualizar no Firestore
            if (currentlyInWishlist) {
                // Remove do array no Firestore
                await updateDoc(userWishlistRef, {
                    productIds: arrayRemove(productId)
                });
                console.log(`Produto ${productId} removido da wishlist no Firestore.`);
            } else {
                // Adiciona ao array no Firestore (cria o doc/array se não existir)
                await setDoc(userWishlistRef, {
                    productIds: arrayUnion(productId)
                }, { merge: true }); // merge: true cria o doc se não existir, ou mescla se existir
                console.log(`Produto ${productId} adicionado à wishlist no Firestore.`);
            }
        } catch (error) {
            console.error("Erro ao atualizar wishlist no Firestore:", error);
            // Reverte o estado local em caso de erro no Firestore
            setWishlistProductIds(prevIds =>
                currentlyInWishlist
                    ? [...prevIds, productId] // Adiciona de volta se a remoção falhou
                    : prevIds.filter(id => id !== productId) // Remove se a adição falhou
            );
            // Mostrar um alerta/toast para o usuário seria ideal aqui
        }

    }, [currentUser, wishlistProductIds]); // Depende do usuário e do estado atual da lista

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

// Hook customizado
export const useWishlist = (): WishlistContextData => {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error('useWishlist deve ser usado dentro de um WishlistProvider');
    }
    return context;
};