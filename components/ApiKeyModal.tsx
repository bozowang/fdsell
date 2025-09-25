import React, { useState } from 'react';

interface ApiKeyModalProps {
    onKeySubmit: (apiKey: string) => void;
}

export const ApiKeyModal = ({ onKeySubmit }: ApiKeyModalProps) => {
    const [apiKey, setApiKey] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (apiKey.trim()) {
            onKeySubmit(apiKey.trim());
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <div className="p-8 bg-white rounded-lg shadow-xl max-w-md w-full text-center">
                <div className="text-3xl mb-4">
                    <i className="fas fa-key text-yellow-500"></i>
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">請輸入您的 Gemini API 金鑰</h1>
                <p className="text-gray-600 mb-6">
                    您的金鑰將會安全地儲存在您的瀏覽器中，且不會被上傳到任何地方。
                </p>
                <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
                    <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        placeholder="在此貼上您的 API 金鑰"
                        required
                    />
                    <button
                        type="submit"
                        className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
                    >
                        儲存並開始使用
                    </button>
                </form>
                 <p className="text-xs text-gray-400 mt-4">
                    您可以從 Google AI Studio 取得您的 API 金鑰。
                </p>
            </div>
        </div>
    );
};
