import { Product, ProductReview } from '../types/navigation';

const exampleReviewsProduct1: ProductReview[] = [
    { id: 'rev1', userId: 'user123', userName: 'Maria S.', rating: 5, comment: 'Adorei a camiseta, tecido muito bom!', createdAt: new Date(2025, 9, 20) },
    { id: 'rev2', userId: 'user456', userName: 'João P.', rating: 4, comment: 'Gostei, mas achei a cor um pouco diferente da foto.', createdAt: new Date(2025, 9, 15) },
];

const exampleReviewsProduct3: ProductReview[] = [
    { id: 'rev3', userId: 'user789', userName: 'Ana B.', rating: 5, comment: 'Tênis super leve e confortável para correr!', createdAt: new Date(2025, 9, 18) },
];

export const PRODUCTS: Product[] = [
    {
        id: 'local-001',
        sku: 'SKU-CAM-BAS-VM', // SKU base, pode variar com a variação
        name: 'Camiseta Básica', // Nome base
        brand: 'Marca Exemplo',
        description: 'Camiseta de algodão 100% penteado...',
        category: 'Roupas',
        tags: ['camiseta', 'básica', 'algodão'], // Tags mais genéricas
        price: 39.90,
        originalPrice: 49.90,
        currency: 'BRL',
        imageUrls: [
            'https://via.placeholder.com/300/FF0000/FFFFFF?text=Camiseta+Vermelha', // Imagem pode depender da cor selecionada
            'https://via.placeholder.com/300/0000FF/FFFFFF?text=Camiseta+Azul',   // Exemplo outra cor
            'https://via.placeholder.com/300/000000/FFFFFF?text=Camiseta+Preta',  // Exemplo outra cor
        ],
        stock: 50, // Estoque total (ou -1 se gerenciado por variação)

        // --- VARIAÇÕES ADICIONADAS ---
        variations: [
            {
                id: 'cor',
                name: 'Cor',
                options: [
                    { value: 'Vermelho' },
                    { value: 'Azul' },
                    { value: 'Preto' },
                    // Poderia ter: { value: 'Estampada', priceModifier: 5 }
                ],
            },
            {
                id: 'tamanho',
                name: 'Tamanho',
                options: [
                    { value: 'P' },
                    { value: 'M' },
                    { value: 'G' },
                    { value: 'GG', priceModifier: 2.00 }, // Exemplo: GG é R$2 mais caro
                ],
            }
        ],
        // --- FIM VARIAÇÕES ---

        averageRating: 4.5,
        reviewCount: exampleReviewsProduct1.length,
        isFeatured: true,
        isActive: true,
    },
    {
        id: 'local-002',
        sku: 'SKU-TEN-ESP',
        name: 'Tênis Esportivo Performance',
        brand: 'Marca Esportiva',
        description: 'Tênis leve e respirável...',
        category: 'Calçados',
        tags: ['tênis', 'esportivo', 'corrida', 'performance'],
        price: 249.90,
        originalPrice: 299.90,
        currency: 'BRL',
        imageUrls: [
            'https://via.placeholder.com/300/00FF00/FFFFFF?text=Tênis+Verde', // Exemplo Cor 1
            'https://via.placeholder.com/300/FFA500/FFFFFF?text=Tênis+Laranja', // Exemplo Cor 2
            'https://via.placeholder.com/300/00FF00/DDDDDD?text=Tênis+Sola',
        ],
        stock: 40, // Estoque total

        // --- VARIAÇÕES ADICIONADAS ---
        variations: [
            {
                id: 'cor-tenis',
                name: 'Cor',
                options: [
                    { value: 'Verde/Branco' },
                    { value: 'Laranja/Preto' },
                ],
            },
            {
                id: 'tamanho-br',
                name: 'Tamanho (BR)',
                options: [
                    { value: '39' },
                    { value: '40' },
                    { value: '41' },
                    { value: '42' },
                    { value: '43' },
                ],
            }
        ],
        // --- FIM VARIAÇÕES ---

        averageRating: 5.0,
        reviewCount: exampleReviewsProduct3.length,
        isFeatured: true,
        isActive: true,
    },
];

export const EXAMPLE_REVIEWS = {
    'local-001': exampleReviewsProduct1,
    'local-003': exampleReviewsProduct3,
};