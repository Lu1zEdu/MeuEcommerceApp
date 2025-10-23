import { Timestamp } from '../firebase/firebaseConfig';

export type RootStackParamList = {
    Login: undefined;
    Signup: undefined;
    ProductList: undefined;
    ProductDetail: { productId: string };
    Cart: undefined;
    MainApp: undefined;
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