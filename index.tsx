import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// 如果您使用 Vite，還需要引入一個 CSS 檔案來載入 Tailwind CSS
// import './index.css'; 

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);