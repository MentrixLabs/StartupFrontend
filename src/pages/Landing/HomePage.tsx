// src/pages/Landing/HomePage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Zap,
  Search,
  BarChart3,
  Image as ImageIcon,
  CheckCircle,
  Users,
  Clock,
  Shield,
} from 'lucide-react';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              P
            </div>
            <span className="text-xl font-semibold text-gray-800 dark:text-white">
              Proskladai
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Войти
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              Начать бесплатно
            </Link>
          </div>
        </div>
      </header>

      {/* ===== HERO SECTION ===== */}
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-medium">
                <Zap size={16} />
                <span>AI-автоматизация для маркетплейсов</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight">
                Оптимизируйте карточки товаров{' '}
                <span className="text-blue-600 dark:text-blue-400">в 2 клика</span>
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-lg">
                Генерация SEO-текстов и поиск релевантной инфографики с помощью нейросетей.
                Увеличьте продажи без лишних затрат.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-lg shadow-blue-200 dark:shadow-blue-900/30 transition-all hover:scale-105"
                >
                  Зарегистрироваться
                  <ArrowRight size={20} />
                </Link>
                <a
                  href="https://t.me/ProskladaiBot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
                >
                  Попробовать бота
                  <ArrowRight size={20} />
                </a>
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <CheckCircle size={16} className="text-green-500" />
                  Бесплатный пробный период
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle size={16} className="text-green-500" />
                  Без карты
                </span>
              </div>
            </div>
            <div className="flex justify-center lg:justify-end">
              <div className="relative w-full max-w-md aspect-square rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 shadow-2xl flex items-center justify-center p-8">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAzMHYySDI0di0yaDEyek0zNiAyNnYySDI0di0yaDEyek0zNiAyMnYySDI0di0yaDEyek0zNiAxOHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
                <div className="relative z-10 text-white text-center">
                  <div className="text-7xl font-bold mb-2">📦</div>
                  <h3 className="text-2xl font-semibold">Proskladai Bot</h3>
                  <p className="text-blue-100">SEO + инфографика за секунды</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Декоративный элемент */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-blue-200/30 dark:bg-blue-500/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-indigo-200/30 dark:bg-indigo-500/10 rounded-full blur-3xl -z-10" />
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
              Всё, что нужно для идеальной карточки товара
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Нейросети и умные алгоритмы автоматизируют рутинные задачи, чтобы вы сосредоточились на развитии бизнеса.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-700"
              >
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
              Как это работает
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Три простых шага до готовой оптимизированной карточки
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            {steps.map((step, index) => (
              <div key={index} className="relative flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-lg">
                  {index + 1}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {step.title}
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">{step.description}</p>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-2/3 w-1/3 h-0.5 bg-gray-300 dark:bg-gray-600" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== STATS / TRUST ===== */}
      <section className="py-16 bg-blue-600 dark:bg-blue-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            {stats.map((stat, index) => (
              <div key={index}>
                <div className="text-4xl font-extrabold">{stat.value}</div>
                <div className="text-sm text-blue-100 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 p-8 rounded-3xl shadow-xl">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Готовы оптимизировать свои товары?
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Начните прямо сейчас – первые 3 товара бесплатно!
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-lg shadow-blue-200 dark:shadow-blue-900/30 transition-all hover:scale-105"
              >
                Создать аккаунт
                <ArrowRight size={20} />
              </Link>
              <a
                href="https://t.me/ProskladaiBot"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
              >
                Открыть бота
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                  P
                </div>
                <span className="text-white text-lg font-semibold">Proskladai</span>
              </div>
              <p className="text-sm">
                Автоматизация SEO и инфографики для маркетплейсов.
              </p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Продукт</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="#" className="hover:text-white transition-colors">Возможности</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Цены</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Блог</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Поддержка</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="#" className="hover:text-white transition-colors">FAQ</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Контакты</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Помощь</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Юридическое</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="#" className="hover:text-white transition-colors">Политика конфиденциальности</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Условия использования</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
            &copy; {new Date().getFullYear()} Proskladai. Все права защищены.
          </div>
        </div>
      </footer>
    </div>
  );
};

// Данные для секций
const features = [
  {
    icon: <FileText size={24} />,
    title: 'Генерация SEO-текстов',
    description:
      'Нейросеть создаёт заголовки, описания и ключевые слова, релевантные вашему товару и поисковым запросам.',
  },
  {
    icon: <ImageIcon size={24} />,
    title: 'Поиск инфографики',
    description:
      'Автоматический поиск релевантных изображений по артикулу или названию товара в открытых источниках.',
  },
  {
    icon: <BarChart3 size={24} />,
    title: 'Комплексные отчёты',
    description:
      'Собирайте всю информацию по оптимизации в одном отчёте и отслеживайте эффективность ваших карточек.',
  },
];

const steps = [
  {
    title: 'Загрузите карточку',
    description: 'Добавьте товар по артикулу или вручную – бот автоматически подтянет данные.',
  },
  {
    title: 'Сгенерируйте контент',
    description: 'Запустите генерацию SEO-текстов и поиск инфографики одним кликом.',
  },
  {
    title: 'Примените и продавайте',
    description: 'Используйте готовый контент для улучшения карточки и повышения конверсии.',
  },
];

const stats = [
  { value: '10K+', label: 'Товаров оптимизировано' },
  { value: '95%', label: 'Точность рекомендаций' },
  { value: '24/7', label: 'Доступность' },
  { value: '4.9★', label: 'Средняя оценка' },
];

// Дополнительный импорт для иконки
import { FileText } from 'lucide-react';

export default HomePage;