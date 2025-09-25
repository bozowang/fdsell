import React from 'react';
import { type MenuItem } from '../types';

interface MenuItemCardProps {
    item: MenuItem;
    onAddToCart: (item: MenuItem) => void;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onAddToCart }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center hover:shadow-md transition-shadow duration-200">
        <div>
            <h4 className="font-semibold text-gray-800">{item.name}</h4>
            <p className="text-red-500 font-bold">NT$ {item.price}</p>
        </div>
        <button
            onClick={() => onAddToCart(item)}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full transition-colors duration-200 text-sm flex items-center"
        >
            <i className="fas fa-plus mr-2"></i> 加入
        </button>
    </div>
);

export default MenuItemCard;