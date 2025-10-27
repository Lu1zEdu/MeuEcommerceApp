import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
    FlatList,
    Dimensions,
    Button,
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Product, RootStackParamList, ProductReview, SelectedVariationsType } from '../types/navigation';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useWishlist } from '../context/WishlistContext';
import { useTranslation } from 'react-i18next';
import { db, doc, getDoc, collection, query, where, getDocs, Timestamp, limit, documentId, orderBy } from '../firebase/firebaseConfig';
import ProductCard from '../components/ProductCard';
import StarRating from '../components/StarRating';

type ProductDetailRouteProp = RouteProp<RootStackParamList, 'ProductDetail'>;
type ProductDetailNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ProductDetail'>;

const { width: screenWidth } = Dimensions.get('window');

export default function ProductDetailScreen() {
    const route = useRoute<ProductDetailRouteProp>();
    const navigation = useNavigation<ProductDetailNavigationProp>();
    const { productId } = route.params;
    const { addToCart } = useCart();
    const { colors } = useTheme();
    const { isInWishlist, toggleWishlist, loadingWishlist } = useWishlist();
    const { t } = useTranslation();

    const [product, setProduct] = useState<Product | null>(null);
    const [loadingProduct, setLoadingProduct] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
    const [loadingSimilar, setLoadingSimilar] = useState(false);
    const [reviews, setReviews] = useState<ProductReview[]>([]);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [showAllReviews, setShowAllReviews] = useState(false);
    const [selectedVariations, setSelectedVariations] = useState<SelectedVariationsType>({});

    const fetchReviews = useCallback(async (currentProductId: string) => {
        setLoadingReviews(true);
        setReviews([]);
        try {
            const reviewsRef = collection(db, 'reviews');
            const q = query(
                reviewsRef,
                where('productId', '==', currentProductId),
                orderBy('createdAt', 'desc')
            );
            const querySnapshot = await getDocs(q);
            const fetchedReviews = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: (doc.data().createdAt as Timestamp)?.toDate() ?? new Date()
            })) as ProductReview[];
            setReviews(fetchedReviews);
        } catch (error) {
            console.error("Erro ao buscar avaliações:", error);
        } finally {
            setLoadingReviews(false);
        }
    }, []);

    const fetchSimilarProducts = useCallback(async (category: string, currentProductId: string) => {
        if (!category) return;
        setLoadingSimilar(true);
        try {
            const productsRef = collection(db, 'products');
            const q = query(
                productsRef,
                where('category', '==', category),
                where(documentId(), '!=', currentProductId),
                limit(10)
            );
            const querySnapshot = await getDocs(q);
            const similarList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
            setSimilarProducts(similarList);
        } catch (error) { console.error("Erro ao buscar produtos similares:", error); }
        finally { setLoadingSimilar(false); }
    }, []);

    useEffect(() => {
        const fetchProduct = async () => {
            setLoadingProduct(true);
            setProduct(null); setSimilarProducts([]); setQuantity(1); setReviews([]); setSelectedVariations({}); setLoadingReviews(false);
            let foundProduct: Product | null = null;
            try {
                const productRef = doc(db, 'products', productId);
                const docSnap = await getDoc(productRef);
                if (docSnap.exists()) {
                    foundProduct = { id: docSnap.id, ...docSnap.data() } as Product;
                } else {
                    console.warn(`Produto com ID ${productId} não encontrado no Firestore.`);
                    Alert.alert(t('alertErrorTitle'), "Produto não encontrado.");
                }
            } catch (error) {
                console.error("Erro ao buscar detalhes (Firestore):", error);
                Alert.alert(t('alertErrorTitle'), "Erro ao carregar detalhes do produto.");
            } finally {
                if (foundProduct) {
                    const initialVariations: SelectedVariationsType = {};
                    if (foundProduct.variations && Array.isArray(foundProduct.variations)) {
                        foundProduct.variations.forEach(variation => {
                            if (variation && variation.options && Array.isArray(variation.options) && variation.options.length > 0) {
                                initialVariations[variation.id] = variation.options[0].value;
                            }
                        });
                    }
                    setSelectedVariations(initialVariations);
                    setProduct(foundProduct);
                    fetchSimilarProducts(foundProduct.category, foundProduct.id);
                    fetchReviews(foundProduct.id);
                }
                setLoadingProduct(false);
            }
        };
        fetchProduct();
    }, [productId, t, fetchSimilarProducts, fetchReviews]);


    const isFavorite = product ? isInWishlist(product.id) : false;

    const finalPrice = useMemo(() => {
        if (!product) return 0;
        let price = product.price;
        product.variations?.forEach(variation => {
            if (variation && Array.isArray(variation.options)) {
                const selectedValue = selectedVariations[variation.id];
                const selectedOption = variation.options.find(opt => opt.value === selectedValue);
                if (selectedOption?.priceModifier) {
                    price += selectedOption.priceModifier;
                }
            }
        });
        return price;
    }, [product, selectedVariations]);

    const finalOriginalPrice = useMemo(() => {
        if (!product || !product.originalPrice) return undefined;
        let originalPrice = product.originalPrice;
        product.variations?.forEach(variation => {
            if (variation && Array.isArray(variation.options)) {
                const selectedValue = selectedVariations[variation.id];
                const selectedOption = variation.options.find(opt => opt.value === selectedValue);
                if (selectedOption?.priceModifier) {
                    originalPrice += selectedOption.priceModifier;
                }
            }
        });
        return originalPrice > finalPrice ? originalPrice : undefined;
    }, [product, selectedVariations, finalPrice]);


    const increaseQuantity = () => { setQuantity(prev => prev + 1); };
    const decreaseQuantity = () => { setQuantity(prev => Math.max(1, prev - 1)); };
    const handleAddToCart = () => {
        if (product) {
            const allVariationsSelected = product.variations?.every(v => selectedVariations[v.id] !== undefined) ?? true;
            if (!allVariationsSelected) {
                Alert.alert(t('alertErrorTitle'), 'Por favor, selecione todas as opções do produto.');
                return;
            }
            addToCart(product, quantity, selectedVariations, finalPrice);
            Alert.alert(t('alertSuccessTitle'), t('successAddedToCart', { productName: product.name }));
        }
    };
    const handleToggleWishlist = () => { if (!product || loadingWishlist) return; toggleWishlist(product); };
    const handleSelectVariation = (variationId: string, value: string) => { setSelectedVariations(prev => ({ ...prev, [variationId]: value })); };

    const renderImageItem = ({ item }: { item: string }) => (<Image source={{ uri: item }} style={styles.galleryImage} resizeMode="cover" />);
    const renderSimilarItem = ({ item }: { item: Product }) => (<View style={styles.similarItemContainer}><ProductCard product={item} onPress={() => navigation.push('ProductDetail', { productId: item.id })} /></View>);

    const formatReviewDate = (date: Date | null): string => {
        if (!date || !(date instanceof Date)) return '';
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    };

    const renderReviewItem = ({ item }: { item: ProductReview }) => (
        <View style={styles.reviewItem}>
            <View style={styles.reviewHeader}>
                <Text style={styles.reviewUserName}>{item.userName || t('anonymousUser', 'Usuário Anônimo')}</Text>
                <StarRating rating={item.rating} size={14} color="#f0ad4e" />
            </View>
            <Text style={styles.reviewComment}>{item.comment}</Text>
            {item.createdAt && <Text style={styles.reviewDate}>{formatReviewDate(item.createdAt as Date)}</Text>}
        </View>
    );

    const styles = StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
        loadingText: { marginTop: 10, fontSize: 16, color: colors.textSecondary },
        galleryContainer: { height: screenWidth * 0.9, marginBottom: 0, backgroundColor: colors.border },
        galleryImage: { width: screenWidth, height: screenWidth * 0.9, backgroundColor: colors.border },
        detailsContainer: { paddingHorizontal: 20, paddingTop: 20, backgroundColor: colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, marginTop: -20, paddingBottom: 20 },
        headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
        name: { flex: 1, fontSize: 24, fontWeight: 'bold', color: colors.text, marginRight: 10 },
        wishlistButtonDetail: { padding: 8, marginTop: 4 },
        category: { fontSize: 14, color: colors.textSecondary, marginBottom: 5 },
        brand: { fontSize: 14, color: colors.textSecondary, marginBottom: 12, fontWeight: '500' },
        ratingContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
        reviewCountText: { marginLeft: 8, fontSize: 14, color: colors.textSecondary },
        priceContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' },
        price: { fontSize: 22, color: colors.primary, fontWeight: 'bold' },
        originalPrice: { fontSize: 16, color: colors.textSecondary, textDecorationLine: 'line-through', marginLeft: 10 },
        variationsContainer: { marginBottom: 20 },
        variationGroup: { marginBottom: 15 },
        variationName: { fontSize: 16, fontWeight: 'bold', color: colors.text, marginBottom: 10 },
        optionsContainer: { flexDirection: 'row', flexWrap: 'wrap' },
        optionButton: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20, borderWidth: 1, borderColor: colors.border, marginRight: 10, marginBottom: 10, backgroundColor: colors.background },
        optionButtonSelected: { borderColor: colors.primary, backgroundColor: colors.primary },
        optionText: { fontSize: 14, color: colors.textSecondary },
        optionTextSelected: { color: colors.card, fontWeight: 'bold' },
        descriptionTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 8, marginTop: 10 },
        description: { fontSize: 15, color: colors.textSecondary, lineHeight: 22, marginBottom: 30 },
        quantitySelectorContainer: { marginBottom: 30 },
        quantitySelector: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginTop: 8 },
        quantityButton: { paddingHorizontal: 15, paddingVertical: 8, backgroundColor: colors.background, borderRadius: 6, borderWidth: 1, borderColor: colors.border },
        quantityButtonText: { fontSize: 20, fontWeight: 'bold', color: colors.text },
        quantityValue: { fontSize: 18, fontWeight: 'bold', marginHorizontal: 20, minWidth: 30, textAlign: 'center', color: colors.text },
        addButton: { backgroundColor: colors.primary, paddingVertical: 15, borderRadius: 8, alignItems: 'center', marginBottom: 30 },
        addButtonDisabled: { backgroundColor: colors.textSecondary },
        addButtonText: { color: colors.card, fontSize: 16, fontWeight: 'bold' },
        sectionTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 15, paddingHorizontal: 20, marginTop: 10 },
        reviewsSection: { paddingVertical: 20, borderTopWidth: 1, borderTopColor: colors.border, marginHorizontal: -20, paddingHorizontal: 20, minHeight: 100 },
        similarSection: { paddingTop: 20, borderTopWidth: 1, borderTopColor: colors.border, marginHorizontal: -20, paddingBottom: 20 },
        placeholderText: { fontSize: 15, color: colors.textSecondary, textAlign: 'center', marginTop: 10 },
        similarListContainer: { paddingLeft: 20, paddingRight: 10 },
        reviewItem: { backgroundColor: colors.background, padding: 15, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: colors.border },
        reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
        reviewUserName: { fontSize: 15, fontWeight: 'bold', color: colors.text },
        reviewComment: { fontSize: 14, color: colors.textSecondary, lineHeight: 20, marginBottom: 8 },
        reviewDate: { fontSize: 12, color: colors.textSecondary, textAlign: 'right' },
        readMoreButton: { marginTop: 10, alignSelf: 'center', paddingVertical: 5 },
        readMoreText: { color: colors.primary, fontWeight: 'bold' },
        similarItemContainer: { marginRight: 10, width: Dimensions.get('window').width * 0.45 },
    });

    if (loadingProduct) { return (<View style={styles.loadingContainer}><ActivityIndicator size="large" color={colors.primary} /><Text style={styles.loadingText}>Carregando detalhes...</Text></View>); }
    if (!product) { return (<View style={styles.loadingContainer}><Text style={styles.loadingText}>Produto não encontrado!</Text><Button title="Voltar" onPress={() => navigation.goBack()} color={colors.primary} /></View>); }

    const visibleReviews = showAllReviews ? reviews : reviews.slice(0, 3);
    const reviewCountDisplay = loadingReviews ? '...' : reviews.length;


    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
            {product.imageUrls && product.imageUrls.length > 0 ? (
                <FlatList data={product.imageUrls} renderItem={renderImageItem} keyExtractor={(item, index) => `${productId}-img-${index}`} horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.galleryContainer} />
            ) : (
                <View style={[styles.galleryContainer, { justifyContent: 'center', alignItems: 'center' }]}><Ionicons name="image-outline" size={80} color={colors.textSecondary} /></View>
            )}

            <View style={styles.detailsContainer}>
                <View style={styles.headerRow}>
                    <Text style={styles.name}>{product.name}</Text>
                    <TouchableOpacity style={styles.wishlistButtonDetail} onPress={handleToggleWishlist}>
                        <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={30} color={isFavorite ? colors.notification : colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                {product.brand && <Text style={styles.brand}>{product.brand}</Text>}
                <Text style={styles.category}>{t('categoryLabel')} {product.category}</Text>

                {(product.averageRating !== undefined || reviews.length > 0) && (
                    <View style={styles.ratingContainer}>
                        <StarRating rating={product.averageRating ?? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length || 0)} size={18} />
                        <Text style={styles.reviewCountText}>({reviewCountDisplay} {t(reviews.length === 1 ? 'review_one' : 'review_other', { count: reviews.length })})</Text>
                    </View>
                )}

                <View style={styles.priceContainer}>
                    <Text style={styles.price}>{(product.currency === 'BRL' ? 'R$ ' : '') + finalPrice.toFixed(2)}</Text>
                    {finalOriginalPrice && (<Text style={styles.originalPrice}>{(product.currency === 'BRL' ? 'R$ ' : '') + finalOriginalPrice.toFixed(2)}</Text>)}
                </View>

                {product.variations && product.variations.length > 0 && (
                    <View style={styles.variationsContainer}>
                        {product.variations.map((variation) => (
                            <View key={variation.id} style={styles.variationGroup}>
                                <Text style={styles.variationName}>{variation.name}: <Text style={{ fontWeight: 'normal' }}>{selectedVariations[variation.id] || 'Selecione'}</Text></Text>
                                <View style={styles.optionsContainer}>
                                    {variation.options && Array.isArray(variation.options) && variation.options.map((option) => {
                                        const isSelected = selectedVariations[variation.id] === option.value;
                                        return (
                                            <TouchableOpacity
                                                key={`${variation.id}-${option.value}`}
                                                style={[styles.optionButton, isSelected && styles.optionButtonSelected]}
                                                onPress={() => handleSelectVariation(variation.id, option.value)}
                                            >
                                                <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>{option.value}</Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                <Text style={styles.descriptionTitle}>Descrição</Text>
                <Text style={styles.description}>{product.description}</Text>

                <View style={styles.quantitySelectorContainer}>
                    <Text style={styles.descriptionTitle}>Quantidade</Text>
                    <View style={styles.quantitySelector}>
                        <TouchableOpacity style={styles.quantityButton} onPress={decreaseQuantity} disabled={quantity <= 1}><Text style={styles.quantityButtonText}>-</Text></TouchableOpacity>
                        <Text style={styles.quantityValue}>{quantity}</Text>
                        <TouchableOpacity style={styles.quantityButton} onPress={increaseQuantity}><Text style={styles.quantityButtonText}>+</Text></TouchableOpacity>
                        {product.stock === 0 && <Text style={{ marginLeft: 15, color: colors.notification, fontSize: 14 }}>Indisponível</Text>}
                        {product.stock > 0 && product.stock <= 5 && <Text style={{ marginLeft: 15, color: colors.notification, fontSize: 14 }}>Apenas {product.stock} em estoque!</Text>}
                    </View>
                </View>

                <TouchableOpacity style={[styles.addButton, product.stock === 0 && styles.addButtonDisabled]} onPress={handleAddToCart} disabled={product.stock === 0}>
                    <Text style={styles.addButtonText}>{product.stock === 0 ? "Produto Indisponível" : t('addToCartButton')}</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.reviewsSection}>
                <Text style={styles.sectionTitle}>Avaliações ({reviewCountDisplay})</Text>
                {loadingReviews ? (
                    <ActivityIndicator style={{ marginTop: 20 }} color={colors.primary} />
                ) : reviews.length > 0 ? (
                    <>
                        <FlatList
                            data={visibleReviews}
                            renderItem={renderReviewItem}
                            keyExtractor={(item) => item.id}
                            scrollEnabled={false}
                        />
                        {reviews.length > 3 && (
                            <TouchableOpacity style={styles.readMoreButton} onPress={() => setShowAllReviews(!showAllReviews)}>
                                <Text style={styles.readMoreText}>{showAllReviews ? t('showLessReviews', "Mostrar menos") : t('readAllReviews', "Ler todas as avaliações")}</Text>
                            </TouchableOpacity>
                        )}
                    </>
                ) : (
                    <Text style={styles.placeholderText}>{t('noReviewsYet', 'Nenhuma avaliação ainda.')}</Text>
                )}
            </View>

            {loadingSimilar ? (<ActivityIndicator style={{ marginVertical: 20 }} color={colors.primary} />
            ) : similarProducts.length > 0 ? (
                <View style={styles.similarSection}>
                    <Text style={styles.sectionTitle}><Text>Produtos Similares</Text></Text>
                    <FlatList data={similarProducts} renderItem={renderSimilarItem} keyExtractor={(item) => item.id} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.similarListContainer} />
                </View>
            ) : null}
        </ScrollView>
    );
}