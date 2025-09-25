import React, { useState, useEffect, useCallback } from 'react';
import { View, type Restaurant, type MenuItem, type CartItem, type OrderDetails, type ConfirmedOrder, type AlertInfo } from './types';
import { generateRestaurantData, generateMenuForRestaurant, processOrder } from './services/geminiService';
import { saveOrder } from './services/sheetService';
import { SHIPPING_FEE } from './constants';

import Header from './components/Header';
import Spinner from './components/Spinner';
import Alert from './components/Alert';
import RestaurantList from './components/RestaurantList';
import MenuView from './components/MenuView';
import CartView from './components/CartView';
import CheckoutView from './components/CheckoutView';
import ConfirmationView from './components/ConfirmationView';

const App: React.FC = () => {
    const [view, setView] = useState<View>(View.RESTAURANTS);
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [cart, setCart] = useState<CartItem[]>(() => {
        try {
            const savedCart = localStorage.getItem('foodDeliveryCart');
            return savedCart ? JSON.parse(savedCart) : [];
        } catch (error) {
            console.error("Failed to parse cart from localStorage", error);
            return [];
        }
    });
    const [confirmedOrder, setConfirmedOrder] = useState<ConfirmedOrder | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isMenuLoading, setIsMenuLoading] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [alert, setAlert] = useState<AlertInfo | null>(null);

    useEffect(() => {
        const fetchRestaurants = async () => {
            setIsLoading(true);
            const data = await generateRestaurantData();
            setRestaurants(data);
            setIsLoading(false);
        };
        fetchRestaurants();
    }, []);

    useEffect(() => {
        localStorage.setItem('foodDeliveryCart', JSON.stringify(cart));
    }, [cart]);

    const showAlert = (message: string, type: 'success' | 'error' = 'success') => {
        setAlert({ message, type });
    };

    const handleSelectRestaurant = useCallback(async (restaurant: Restaurant) => {
        setSelectedRestaurant(restaurant);
        setView(View.MENU);
        setIsMenuLoading(true);
        setMenuItems([]); // Clear previous menu
        const menuData = await generateMenuForRestaurant(restaurant.name, restaurant.category);
        setMenuItems(menuData);
        setIsMenuLoading(false);
    }, []);

    const handleAddToCart = (item: MenuItem) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
            if (existingItem) {
                return prevCart.map(cartItem =>
                    cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
                );
            }
            return [...prevCart, { ...item, quantity: 1 }];
        });
        showAlert(`${item.name} 已加入購物車！`);
    };

    const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
        if (newQuantity <= 0) {
            handleRemoveFromCart(itemId);
        } else {
            setCart(prevCart =>
                prevCart.map(item => (item.id === itemId ? { ...item, quantity: newQuantity } : item))
            );
        }
    };

    const handleRemoveFromCart = (itemId: string) => {
        const itemToRemove = cart.find(item => item.id === itemId);
        setCart(prevCart => prevCart.filter(item => item.id !== itemId));
        if (itemToRemove) {
            showAlert(`${itemToRemove.name} 已從購物車移除。`, 'error');
        }
    };

    const handleSubmitOrder = async (details: OrderDetails) => {
        setIsSubmitting(true);
        try {
            const { orderNumber, estimatedDeliveryTime } = await processOrder(details, cart);

            const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
            const total = subtotal + SHIPPING_FEE;

            const newConfirmedOrder: ConfirmedOrder = {
                ...details,
                orderNumber,
                estimatedDeliveryTime,
                items: cart,
                subtotal,
                shippingFee: SHIPPING_FEE,
                total,
            };
            
            const saveResult = await saveOrder(newConfirmedOrder);

            if (!saveResult.success) {
                throw new Error(saveResult.message || '無法將訂單儲存至後端系統。');
            }

            setConfirmedOrder(newConfirmedOrder);
            setCart([]);
            setView(View.CONFIRMATION);

        } catch (error) {
            console.error("提交訂單失敗:", error);
            const errorMessage = error instanceof Error ? error.message : '提交訂單時發生未知錯誤。';
            showAlert(errorMessage, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleNewOrder = () => {
        setConfirmedOrder(null);
        setSelectedRestaurant(null);
        setMenuItems([]);
        setView(View.RESTAURANTS);
    };

    const renderContent = () => {
        if (isLoading && view === View.RESTAURANTS) return <Spinner message="正在載入餐廳..." />;

        switch (view) {
            case View.MENU:
                return selectedRestaurant && <MenuView 
                    restaurant={selectedRestaurant} 
                    menuItems={menuItems} 
                    onAddToCart={handleAddToCart}
                    onBack={() => setView(View.RESTAURANTS)}
                    isLoading={isMenuLoading}
                />;
            case View.CART:
                return <CartView 
                    cart={cart}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemoveItem={handleRemoveFromCart}
                    onCheckout={() => setView(View.CHECKOUT)}
                    onBack={() => selectedRestaurant ? setView(View.MENU) : setView(View.RESTAURANTS)}
                />;
            case View.CHECKOUT:
                return <CheckoutView onSubmit={handleSubmitOrder} onBack={() => setView(View.CART)} isLoading={isSubmitting} />;
            case View.CONFIRMATION:
                return confirmedOrder && <ConfirmationView order={confirmedOrder} onNewOrder={handleNewOrder} />;
            case View.RESTAURANTS:
            default:
                return <RestaurantList restaurants={restaurants} onSelectRestaurant={handleSelectRestaurant} />;
        }
    };

    const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
            {alert && <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
            <Header cartItemCount={cartItemCount} onCartClick={() => setView(View.CART)} onLogoClick={() => setView(View.RESTAURANTS)} />
            <main className="container mx-auto px-4">
                {renderContent()}
            </main>
            <footer className="bg-gray-800 text-white text-center p-6 mt-12">
                <p>© {new Date().getFullYear()} Gemini 美食外送. 版權所有.</p>
            </footer>
        </div>
    );
};

export default App;