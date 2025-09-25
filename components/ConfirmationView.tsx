import React from 'react';
import { ConfirmedOrder } from '../types';

interface ConfirmationViewProps {
    order: ConfirmedOrder;
    onNewOrder: () => void;
}

export const ConfirmationView = ({ order, onNewOrder }: ConfirmationViewProps) => {
  return (
    <div className="bg-white rounded-lg p-8 shadow-lg my-8 text-center">
      <div className="text-6xl text-green-500 mb-4">
        <i className="fas fa-check-circle"></i>
      </div>
      <h2 className="text-3xl font-bold text-gray-800 mb-2">訂單提交成功！</h2>
      <p className="text-gray-600 mb-6">感謝您的訂購，美食正在路上！</p>
      
      <div className="text-left bg-gray-50 p-6 rounded-lg border w-full max-w-md mx-auto space-y-3">
        <p><strong>訂單編號：</strong> <span className="font-mono text-red-500">{order.orderNumber}</span></p>
        <p><strong>預計送達時間：</strong> <span className="font-semibold">{order.estimatedDeliveryTime}</span></p>
        <p><strong>顧客姓名：</strong> {order.customerName}</p>
        <p><strong>外送至：</strong> {order.deliveryAddress}</p>
        <p><strong>總金額：</strong> <span className="font-bold">NT$ {order.total}</span></p>
      </div>

      <button
        onClick={onNewOrder}
        className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg mt-8 transition-colors duration-300"
      >
        建立新訂單
      </button>
    </div>
  );
};
