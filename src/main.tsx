// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Находим корневой элемент в DOM
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found. Check your index.html file.');
}

// Применяем сохранённую тему до первого рендера, чтобы не было вспышки светлой
// темы. Ключ 'theme' пишет src/pages/Dashboard/SettingsPage.tsx;
// tailwind.config.js использует darkMode: 'class', поэтому достаточно класса на <html>.
const savedTheme = (localStorage.getItem('theme') as 'light' | 'dark' | 'system') || 'system';
const isDark =
  savedTheme === 'dark' ||
  (savedTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
document.documentElement.classList.toggle('dark', isDark);

// Создаём корень React и рендерим приложение
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);