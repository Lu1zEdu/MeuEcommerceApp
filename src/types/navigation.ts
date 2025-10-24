import { Timestamp } from '../firebase/firebaseConfig';
import { CartItem } from '../context/CartContext';

export type SelectedVariationsType = { [key: string]: string };

export type RootStackParamList = {
    Login: undefined;
    Signup: undefined;
    ProductList: undefined;
    ProductDetail: { productId: string };
    Cart: undefined;
    MainApp: { screen?: keyof BottomTabParamList; params?: any };
};

export type BottomTabParamList = {
    Home: undefined;
    Wishlist: undefined;
    Transaction: undefined;
    Notification: undefined;
    Profile: undefined;
};

export interface ProductVariationOption {
    value: string;
    priceModifier?: number;
    stock?: number;
    optionId?: string;
}

export interface ProductVariation {
    id: string;
    name: string;
    options: ProductVariationOption[];
}

export interface ProductReview {
    id: string;
    userId: string;
    userName: string;
    rating: number;
    comment: string;
    createdAt: Timestamp | Date | { seconds: number; nanoseconds: number } | null;
}

export type Product = {
    id: string;
    sku?: string;
    name: string;
    brand?: string;
    description: string;
    category: string;
    tags?: string[];
    price: number;
    originalPrice?: number;
    currency: string;
    imageUrl?: string;
    imageUrls: string[];
    stock: number;
    variations?: ProductVariation[];
    averageRating?: number;
    reviewCount?: number;
    createdAt?: any;
    updatedAt?: any;
    dimensions?: { width: number; height: number; depth: number; unit: string };
    weight?: { value: number; unit: string };
    isFeatured?: boolean;
    isActive?: boolean;
};

export interface OrderItem extends Omit<CartItem, 'cartItemId'> {
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
    id?: string;
    userId: string;
    items: OrderItem[];
    totalPrice: number;
    status: OrderStatus;
    createdAt: Timestamp | Date;
}

export interface NotificationData {
    id: string;
    date: Date;
    title: string;
    body: string;
    data?: Record<string, any>;
    read: boolean;
}