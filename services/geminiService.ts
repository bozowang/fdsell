import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Restaurant, MenuItem, OrderDetails, CartItem } from '../types.ts';

let ai: GoogleGenAI | null = null;

/**
 * Initializes the GoogleGenAI instance with the provided API key.
 * This must be called before any other functions in this module.
 * @param apiKey The user's Google Gemini API key.
 */
export const initializeAi = (apiKey: string) => {
    if (!apiKey) {
        console.error("Initialization failed: API key is missing.");
        return;
    }
    ai = new GoogleGenAI({ apiKey });
};


// Schema for a single restaurant object.
const restaurantSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING, description: "Unique identifier for the restaurant" },
        name: { type: Type.STRING },
        category: { type: Type.STRING, description: "e.g., '日式料理', '美式速食', '健康餐盒'" },
        rating: { type: Type.NUMBER, description: "A realistic rating between 3.5 and 5.0" },
        reviews: { type: Type.INTEGER, description: "Number of reviews" },
        deliveryTime: { type: Type.STRING, description: "e.g., '20-30 分鐘'" },
        minOrder: { type: Type.INTEGER, description: "Minimum order value in TWD" },
        image: { type: Type.STRING, description: "A public URL for an image of the restaurant or its food." },
    },
    required: ["id", "name", "category", "rating", "reviews", "deliveryTime", "minOrder", "image"]
};

// Schema for a single menu item object.
const menuItemSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING, description: "Unique identifier for the menu item" },
        name: { type: Type.STRING },
        price: { type: Type.NUMBER, description: "Price in TWD" },
    },
    required: ["id", "name", "price"]
};

/**
 * Fetches a list of restaurants using the Gemini API.
 */
export const fetchRestaurants = async (): Promise<Restaurant[]> => {
    if (!ai) {
        console.error("AI service is not initialized. Please provide an API key.");
        return [];
    }
    try {
        const prompt = "List 12 popular and diverse food delivery restaurants in Taipei, Taiwan. Provide a variety of cuisine types. For each restaurant, include a unique id, name, category, a realistic rating between 3.5 and 5.0, number of reviews, estimated delivery time, minimum order value, and a relevant image URL.";

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: restaurantSchema
                }
            }
        });
        
        const jsonText = response.text.trim();
        const restaurants = JSON.parse(jsonText);
        return restaurants;
    } catch (error) {
        console.error("Error fetching restaurants from Gemini API:", error);
        return [];
    }
};

/**
 * Fetches the menu for a given restaurant using the Gemini API.
 * @param restaurantName The name of the restaurant.
 */
export const fetchMenu = async (restaurantName: string): Promise<MenuItem[]> => {
    if (!ai) {
        console.error("AI service is not initialized. Please provide an API key.");
        return [];
    }
    try {
        const prompt = `Generate a realistic menu with 8-12 items for a restaurant in Taiwan called "${restaurantName}". For each menu item, provide a unique id, its name, and price in TWD.`;
        
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: menuItemSchema
                }
            }
        });
        
        const jsonText = response.text.trim();
        // Add restaurantName to each item for context in the app.
        const menu = JSON.parse(jsonText).map((item: Omit<MenuItem, 'restaurantName'>) => ({...item, restaurantName}));
        return menu;

    } catch (error) {
        console.error(`Error fetching menu for ${restaurantName} from Gemini API:`, error);
        return [];
    }
};

/**
 * Generates order confirmation details (order number, delivery time) using the Gemini API.
 * @param orderDetails Customer and order information.
 * @param cart The items in the cart.
 */
export const generateOrderConfirmation = async (orderDetails: OrderDetails, cart: CartItem[]): Promise<{orderNumber: string, estimatedDeliveryTime: string}> => {
    if (!ai) {
        console.error("AI service is not initialized. Please provide an API key.");
        // Provide a fallback in case of API failure.
        return {
            orderNumber: `ORD-${Date.now().toString().slice(-6)}`,
            estimatedDeliveryTime: "30-45 分鐘"
        };
    }
    try {
        const itemsString = cart.map(item => `${item.name} (x${item.quantity})`).join(', ');
        const prompt = `A customer named ${orderDetails.customerName} has placed a food delivery order for these items: ${itemsString}. The delivery address is ${orderDetails.deliveryAddress}. Please generate a unique 8-character alphanumeric order number and estimate the delivery time. The current time is ${new Date().toLocaleTimeString('en-US', { hour12: false, timeZone: 'Asia/Taipei' })}. Assume delivery takes between 25 to 50 minutes. Respond in JSON.`;

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        orderNumber: { type: Type.STRING, description: "An 8-character alphanumeric order number." },
                        estimatedDeliveryTime: { type: Type.STRING, description: "The estimated time of arrival, e.g., '30-40 分鐘' or a specific time like '12:45 PM'." }
                    },
                    required: ["orderNumber", "estimatedDeliveryTime"]
                }
            }
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch(error) {
        console.error("Error generating order confirmation from Gemini API:", error);
        // Provide a fallback in case of API failure.
        return {
            orderNumber: `ORD-${Date.now().toString().slice(-6)}`,
            estimatedDeliveryTime: "30-45 分鐘"
        };
    }
};
