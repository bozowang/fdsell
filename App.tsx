import React, { useState, useEffect, useMemo } from 'react';
import { View, Restaurant, MenuItem, CartItem, OrderDetails, ConfirmedOrder } from './types.ts';
import { fetchRestaurants, fetchMenu, generateOrderConfirmation } from './services/geminiService.ts';
import { saveOrder } from './services/orderService.ts';
import { SHIPPING_FEE } from './constants.ts';
import { Header } from './components/Header.tsx';
import { RestaurantList } from './components/RestaurantList.tsx';
import { MenuView } from './components/MenuView.tsx';
import { CartView } from './components/CartView.tsx';
import { CheckoutView } from './components/CheckoutView.tsx';
import { ConfirmationView } from './components/ConfirmationView.tsx';
import { Spinner } from './components/Spinner.tsx';
import { Alert } from './components/Alert.tsx';

// FIX: Implement the main application component, orchestrating state and views.
// This resolves the "not a module" error in index.tsx by providing an exported App component.
export const App = () => {
    const [view, setView] = useState<View>(View.RESTAURANTS);
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [confirmedOrder, setConfirmedOrder] = useState<ConfirmedOrder | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // Fetch initial list of restaurants on component mount.
    useEffect(() => {
        const loadRestaurants = async () => {
            // Per guidelines, API key presence should be assumed from environment.
            // A check here is for developer convenience during development.
            if (!process.env.API_KEY) {
                console.error("API_KEY environment variable not set. Application will not function correctly.");
                setAlert({ message: 'API 金鑰未設定，應用程式無法運作。', type: 'error' });
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            const fetchedRestaurants = await fetchRestaurants();
            if (fetchedRestaurants.length > 0) {
                setRestaurants(fetchedRestaurants);
            } else {
                setAlert({ message: '無法載入餐廳列表，請稍後再試。', type: 'error' });
            }
            setIsLoading(false);
        };
        loadRestaurants();
    }, []);

    const handleSelectRestaurant = async (restaurant: Restaurant) => {
        setSelectedRestaurant(restaurant);
        setView(View.MENU);
        setIsLoading(true);
        setMenuItems([]); // Clear previous menu
        const fetchedMenu = await fetchMenu(restaurant.name);
        if (fetchedMenu.length > 0) {
            setMenuItems(fetchedMenu);
        } else {
             setAlert({ message: `無法載入 ${restaurant.name} 的菜單。`, type: 'error' });
             // Stay on menu view but show it's empty, or navigate back.
             // Let's let the user decide, so we stay.
        }
        setIsLoading(false);
    };
    
    const navigateToRestaurants = () => {
        setView(View.RESTAURANTS);
        setSelectedRestaurant(null);
    };

    const navigateToCart = () => setView(View.CART);
    const navigateToCheckout = () => setView(View.CHECKOUT);

    const navigateBackToMenu = () => {
        if (selectedRestaurant) {
            setView(View.MENU);
        } else {
            navigateToRestaurants();
        }
    };
    
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
        setAlert({ message: `已將「${item.name}」加入購物車！`, type: 'success' });
    };

    const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
        if (newQuantity <= 0) {
            handleRemoveItem(itemId);
        } else {
            setCart(cart => cart.map(item => item.id === itemId ? { ...item, quantity: newQuantity } : item));
        }
    };

    const handleRemoveItem = (itemId: string) => {
        const item = cart.find(i => i.id === itemId);
        setCart(cart => cart.filter(i => i.id !== itemId));
        if (item) {
            setAlert({ message: `已從購物車移除「${item.name}」。`, type: 'success' });
        }
    };

    const cartItemCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
    
    const handleCheckout = async (orderDetails: OrderDetails) => {
        setIsLoading(true);
        try {
            const { orderNumber, estimatedDeliveryTime } = await generateOrderConfirmation(orderDetails, cart);
            
            const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
            const total = subtotal + SHIPPING_FEE;

            const finalOrder: ConfirmedOrder = {
                ...orderDetails,
                orderNumber,
                estimatedDeliveryTime,
                items: cart.map(({ name, quantity }) => ({ name, quantity })),
                subtotal,
                shippingFee: SHIPPING_FEE,
                total,
            };
            
            const saveResult = await saveOrder(finalOrder);
            if (!saveResult.success) {
                throw new Error(saveResult.message || '儲存訂單至 Google Sheets 失敗');
            }

            setConfirmedOrder(finalOrder);
            setView(View.CONFIRMATION);
            setCart([]);
            setAlert({ message: '訂單成功送出！', type: 'success' });

        } catch (error) {
            console.error("Checkout failed:", error);
            const errorMessage = error instanceof Error ? error.message : '發生未知錯誤，無法提交訂單。';
            setAlert({ message: `訂單提交失敗：${errorMessage}`, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleNewOrder = () => {
        setConfirmedOrder(null);
        setSelectedRestaurant(null);
        setMenuItems([]);
        setView(View.RESTAURANTS);
    };

    const renderContent = () => {
        if (isLoading && view === View.RESTAURANTS) {
            return <Spinner message="正在為您尋找美味餐廳..." />;
        }

        switch (view) {
            case View.RESTAURANTS:
                return <RestaurantList restaurants={restaurants} onSelectRestaurant={handleSelectRestaurant} />;
            case View.MENU:
                if (!selectedRestaurant) return <Spinner message="請先選擇一間餐廳" />;
                return <MenuView 
                    restaurant={selectedRestaurant} 
                    menuItems={menuItems} 
                    onAddToCart={handleAddToCart} 
                    onBack={navigateToRestaurants}
                    isLoading={isLoading} 
                />;
            case View.CART:
                return <CartView 
                    cart={cart} 
                    onUpdateQuantity={handleUpdateQuantity} 
                    onRemoveItem={handleRemoveItem} 
                    onCheckout={navigateToCheckout} 
                    onBack={selectedRestaurant ? navigateBackToMenu : navigateToRestaurants}
                />;
            case View.CHECKOUT:
                return <CheckoutView 
                    onSubmit={handleCheckout} 
                    onBack={navigateToCart} 
                    isLoading={isLoading}
                />;
            case View.CONFIRMATION:
                if (!confirmedOrder) return <Spinner message="正在載入訂單確認..." />;
                return <ConfirmationView order={confirmedOrder} onNewOrder={handleNewOrder} />;
            default:
                return <RestaurantList restaurants={restaurants} onSelectRestaurant={handleSelectRestaurant} />;
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            <Header cartItemCount={cartItemCount} onCartClick={navigateToCart} onLogoClick={navigateToRestaurants} />
            <main className="container mx-auto p-4">
                {alert && <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
                {renderContent()}
            </main>
        </div>
    );
};
