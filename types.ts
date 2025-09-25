export enum View {
  RESTAURANTS = 'restaurants',
  MENU = 'menu',
  CART = 'cart',
  CHECKOUT = 'checkout',
  CONFIRMATION = 'confirmation',
}

export interface Restaurant {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviews: number;
  deliveryTime: string;
  minOrder: number;
  image: string;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  restaurantName: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface OrderDetails {
    customerName: string;
    customerPhone: string;
    deliveryAddress: string;
    paymentMethod: string;
    orderNotes?: string;
}

export interface ConfirmedOrder extends OrderDetails {
    orderNumber: string;
    estimatedDeliveryTime: string;
    items: { name: string; quantity: number }[];
    subtotal: number;
    shippingFee: number;
    total: number;
}
