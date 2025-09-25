import { ConfirmedOrder } from '../types';
import { SCRIPT_URL } from '../constants';

export const saveOrder = async (orderData: ConfirmedOrder): Promise<{ success: boolean, message: string }> => {
    try {
        const sheetData = {
            orderNumber: orderData.orderNumber,
            customerName: orderData.customerName,
            customerPhone: orderData.customerPhone,
            deliveryAddress: orderData.deliveryAddress,
            paymentMethod: orderData.paymentMethod,
            orderNotes: orderData.orderNotes,
            items: orderData.items.map(item => `${item.name} x${item.quantity}`).join(', '),
            subtotal: orderData.subtotal,
            shippingFee: orderData.shippingFee,
            total: orderData.total,
            orderTime: new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })
        };
        
        const response = await fetch(`${SCRIPT_URL}?action=saveOrder`, {
            method: 'POST',
            redirect: 'follow',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify({ orderData: sheetData }),
        });

        if (!response.ok) {
          throw new Error(`Google Sheets API 回應錯誤，狀態碼: ${response.status}`);
        }

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || '無法將訂單儲存至 Google Sheets');
        }

        return { success: true, message: result.message };

    } catch (error) {
        console.error('儲存訂單至 Google Sheet 時發生錯誤:', error);
        if (error instanceof Error) {
            return { success: false, message: error.message };
        }
        return { success: false, message: '儲存訂單時發生未知錯誤' };
    }
};