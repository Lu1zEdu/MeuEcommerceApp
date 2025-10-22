import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import ProductListScreen from '../screens/ProductListScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import CartScreen from '../screens/CartScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
    return (
        <Stack.Navigator initialRouteName="ProductList">
            <Stack.Screen
                name="ProductList"
                component={ProductListScreen}
                options={{ title: 'Produtos' }}
            />
            <Stack.Screen
                name="ProductDetail"
                component={ProductDetailScreen}
                options={{ title: 'Detalhes do Produto' }}
            />
            <Stack.Screen
                name="Cart"
                component={CartScreen}
                options={{ title: 'Carrinho' }}
            />
        </Stack.Navigator>
    );
}