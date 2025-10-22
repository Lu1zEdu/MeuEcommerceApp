// src/data/products.ts
import { Product } from '../types/navigation';

export const PRODUCTS: Product[] = [
    {
        id: '1',
        name: 'Camiseta Básica',
        price: 49.90,
        description: 'Camiseta de algodão confortável para o dia a dia.',
        imageUrl: 'https://via.placeholder.com/150/FF0000/FFFFFF?text=Camiseta', // Placeholder
        category: 'Roupas', // Adicionado
    },
    {
        id: '2',
        name: 'Calça Jeans',
        price: 119.90,
        description: 'Calça jeans de corte moderno.',
        imageUrl: 'https://via.placeholder.com/150/0000FF/FFFFFF?text=Calça', // Placeholder
        category: 'Roupas', // Adicionado
    },
    {
        id: '3',
        name: 'Tênis Esportivo',
        price: 199.90,
        description: 'Tênis leve e ideal para corridas.',
        imageUrl: 'https://via.placeholder.com/150/00FF00/FFFFFF?text=Tênis', // Placeholder
        category: 'Calçados', // Adicionado
    },
    // Adicione mais produtos com categorias se desejar
];