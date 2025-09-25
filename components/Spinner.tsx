import React from 'react';

interface SpinnerProps {
    message?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ message = "載入中..." }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-600">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-500 mb-4"></div>
            <p className="text-lg font-semibold">{message}</p>
        </div>
    );
};

export default Spinner;