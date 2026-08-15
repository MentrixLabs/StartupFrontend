// src/pages/Landing/HomePage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui';
import LandingHeader from '@/components/landing/LandingHeader';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <LandingHeader />

      {/* ===== HERO SECTION ===== */}
      <section className="py-16 md:py-24 border-b border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400 tracking-wide uppercase">
                AI-автоматизация для маркетплейсов
              </p>
              <h1 className="max-w-xl">
                Оптимизируйте карточки товаров{' '}
                <span className="text-blue-600 dark:text-blue-400">в 2 клика</span>
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-lg leading-relaxed">
                Генерация SEO-текстов и поиск релевантной инфографики с помощью нейросетей.
                Увеличьте продажи без лишних затрат.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg">
                  <Link to="/register">
                    Зарегистрироваться <ArrowRight size={20} className="ml-2" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <a href="https://t.me/ProskladaiBot" target="_blank" rel="noopener noreferrer">
                    Попробовать бота <ArrowRight size={20} className="ml-2" />
                  </a>
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle size={16} className="text-green-600" />
                  Бесплатный пробный период
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle size={16} className="text-green-600" />
                  Без карты
                </span>
              </div>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-10 text-center">
              <div className="text-6xl mb-4" aria-hidden="true">📦</div>
              <h3 className="text-xl">Proskladai Bot</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-1">SEO + инфографика за секунды</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-16">
            <h2>Всё, что нужно для идеальной карточки товара</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              Нейросети и умные алгоритмы автоматизируют рутинные задачи, чтобы вы сосредоточились на развитии бизнеса.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-x-8 gap-y-12">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="border-t border-gray-200 dark:border-gray-700 pt-6"
              >
                <span className="text-sm font-medium text-gray-500">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="text-xl mt-2">{feature.title}</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-16 md:py-24 border-t border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-16">
            <h2>Как это работает</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Три простых шага до готовой оптимизированной карточки
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={step.title}>
                <span className="text-sm font-medium text-gray-500">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="text-xl mt-2">{step.title}</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== STATS / TRUST ===== */}
      <section className="py-16 border-t border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="text-4xl font-semibold text-gray-900 dark:text-white">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="py-16 md:py-24 border-t border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-2xl mx-auto">
            <h2>Готовы оптимизировать свои товары?</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Начните прямо сейчас – первые 3 товара бесплатно!
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button asChild size="lg">
                <Link to="/register">
                  Создать аккаунт <ArrowRight size={20} className="ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="https://t.me/@ProSklad_SmartSeller_AI_Bot" target="_blank" rel="noopener noreferrer">
                  Открыть бота
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};

// Данные для секций
const features = [
  {
    title: 'Генерация SEO-текстов',
    description:
      'Нейросеть создаёт заголовки, описания и ключевые слова, релевантные вашему товару и поисковым запросам.',
  },
  {
    title: 'Поиск инфографики',
    description:
      'Автоматический поиск релевантных изображений по артикулу или названию товара в открытых источниках.',
  },
  {
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

export default HomePage;