import React from "react";
import { Link } from "react-router-dom";

const LandingFooter: React.FC = () => (
  <footer className="bg-gray-900 text-gray-400 py-12">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-semibold">P</div>
            <span className="text-white text-lg font-semibold">Proskladai</span>
          </div>
          <p className="text-sm">Автоматизация SEO и инфографики для маркетплейсов.</p>
        </div>
        <div>
          <h4 className="text-white font-medium mb-4">Продукт</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/features" className="hover:text-white transition-colors">Возможности</Link></li>
            <li><Link to="/pricing" className="hover:text-white transition-colors">Цены</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-medium mb-4">Поддержка</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="https://t.me/ProskladaiBot" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Telegram-бот</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-medium mb-4">Юридическое</h4>
          <ul className="space-y-2 text-sm text-gray-500">
            <li>Политика конфиденциальности</li>
            <li>Условия использования</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
        &copy; {new Date().getFullYear()} Proskladai. Все права защищены.
      </div>
    </div>
  </footer>
);

export default LandingFooter;