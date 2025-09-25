import React from 'react';
import { type Restaurant, type MenuItem } from '../types';
import MenuItemCard from './MenuItemCard';
import Spinner from './Spinner';

interface MenuViewProps {
    restaurant: Restaurant;
    menuItems: MenuItem[];
    onAddToCart: (item: MenuItem) => void;
    onBack: () => void;
    isLoading: boolean;
}

const MenuView: React.FC<MenuViewProps> = ({ restaurant, menuItems, onAddToCart, onBack, isLoading }) => {
    return (
        <div className="bg-white rounded-lg p-6 shadow-lg my-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b pb-4">
                <div className="mb-4 md:mb-0">
                    <button onClick={onBack} className="text-gray-600 hover:text-red-500 mb-2 flex items-center">
                        <i className="fas fa-arrow-left mr-2"></i>返回餐廳列表
                    </button>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800">{restaurant.name} 菜單</h2>
                    <p className="text-gray-500 mt-1">{restaurant.category}</p>
                </div>
                <img src={restaurant.image} alt={restaurant.name} className="w-24 h-24 object-cover rounded-lg shadow-md" />
            </div>
            {isLoading ? (
                <Spinner message="正在載入菜單..." />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {menuItems.map(item => (
                        <MenuItemCard key={item.id} item={item} onAddToCart={onAddToCart} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default MenuView;