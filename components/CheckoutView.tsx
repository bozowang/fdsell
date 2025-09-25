import React, { useState } from 'react';
import { OrderDetails } from '../types';

interface CheckoutViewProps {
    onSubmit: (details: OrderDetails) => void;
    onBack: () => void;
    isLoading: boolean;
}

export const CheckoutView = ({ onSubmit, onBack, isLoading }: CheckoutViewProps) => {
  const [details, setDetails] = useState<OrderDetails>({
    customerName: '',
    customerPhone: '',
    deliveryAddress: '',
    paymentMethod: '',
    orderNotes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(details);
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-lg my-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b pb-4">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-0">結帳</h2>
        <button onClick={onBack} className="text-gray-600 hover:text-red-500 flex items-center">
            <i className="fas fa-arrow-left mr-2"></i>返回購物車
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
                <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">全名 *</label>
                <input type="text" id="customerName" name="customerName" value={details.customerName} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500" />
            </div>
            <div className="form-group">
                <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700">電話號碼 *</label>
                <input type="tel" id="customerPhone" name="customerPhone" value={details.customerPhone} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500" />
            </div>
        </div>
        <div className="form-group">
            <label htmlFor="deliveryAddress" className="block text-sm font-medium text-gray-700">外送地址 *</label>
            <input type="text" id="deliveryAddress" name="deliveryAddress" value={details.deliveryAddress} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
                <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">付款方式 *</label>
                <select id="paymentMethod" name="paymentMethod" value={details.paymentMethod} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500">
                    <option value="">請選擇付款方式</option>
                    <option value="貨到付款">貨到付款</option>
                    <option value="信用卡">信用卡</option>
                    <option value="LINE Pay">LINE Pay</option>
                </select>
            </div>
            <div className="form-group">
                <label htmlFor="orderNotes" className="block text-sm font-medium text-gray-700">訂單備註</label>
                <input type="text" id="orderNotes" name="orderNotes" value={details.orderNotes || ''} onChange={handleChange} placeholder="例如：不要洋蔥" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500" />
            </div>
        </div>
        
        <button 
          type="submit" 
          disabled={isLoading}
          className={`w-full ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'} text-white font-bold py-3 px-4 rounded-lg mt-6 transition-colors duration-300 flex justify-center items-center`}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
              處理中...
            </>
          ) : '提交訂單'}
        </button>
      </form>
    </div>
  );
};
