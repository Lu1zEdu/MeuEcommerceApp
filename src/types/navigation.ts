export type RootStackParamList = {
    Login: undefined;
    Signup: undefined;
    ProductList: undefined;
    ProductDetail: { productId: string };
    Cart: undefined;
};

export type Product = {
    id: string;
    name: string;
    price: number;
    description: string;
    imageUrl: string; // Adicionaremos imagens depois
};