// src/pages/Landing/PricingPage.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Zap,
  Users,
  FileText,
  Image,
  BarChart3,
  MessageCircle,
  HelpCircle,
} from 'lucide-react';

const PricingPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              P
            </div>
            <span className="text-xl font-semibold text-gray-800 dark:text-white">
              Proskladai
            </span>
          </Link>
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
      <section className="py-20 bg-gradient-to-b from-blue-50 to-white dark:from-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-medium mb-4">
              <Zap size={16} />
              <span>Прозрачные тарифы</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight">
              Выберите свой <span className="text-blue-600 dark:text-blue-400">план</span>
            </h1>
            <p className="mt-6 text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Начните бесплатно, а затем масштабируйтесь по мере роста вашего бизнеса.
              Все планы включают базовый набор функций.
            </p>
          </div>
        </div>
      </section>

      {/* ===== PRICING CARDS ===== */}
      <section className="py-16 -mt-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg border ${
                  plan.popular
                    ? 'border-blue-500 dark:border-blue-400 ring-4 ring-blue-100 dark:ring-blue-900/30'
                    : 'border-gray-200 dark:border-gray-700'
                } p-6 flex flex-col transition-transform hover:scale-[1.02] duration-200`}
              >
                {plan.popular && (
                  <span className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full self-start -mt-10 mb-4">
                    Популярный
                  </span>
                )}
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">{plan.description}</p>
                </div>
                <div className="mb-6">
                  <span className="text-5xl font-extrabold text-gray-900 dark:text-white">
                    {plan.price}
                  </span>
                  {plan.price !== 'Бесплатно' && (
                    <span className="text-gray-500 dark:text-gray-400 text-lg font-medium ml-2">
                      / мес
                    </span>
                  )}
                  {plan.price === 'Бесплатно' && (
                    <span className="text-gray-500 dark:text-gray-400 text-lg font-medium ml-2">
                      навсегда
                    </span>
                  )}
                </div>
                <ul className="space-y-3 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-600 dark:text-gray-300">
                      {feature.included ? (
                        <Check size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X size={18} className="text-gray-400 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={feature.included ? '' : 'text-gray-400 dark:text-gray-500'}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <Link
                    to={plan.ctaLink}
                    className={`w-full inline-flex justify-center items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                      plan.popular
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/30'
                        : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white'
                    }`}
                  >
                    {plan.ctaText}
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES COMPARISON TABLE ===== */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
              Сравнение всех функций
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Подробная таблица для принятия решения
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                    Функция
                  </th>
                  {plans.map((plan, idx) => (
                    <th
                      key={idx}
                      className={`py-4 px-6 text-center text-sm font-semibold ${
                        plan.popular ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((row, idx) => (
                  <tr key={idx} className="border-b border-gray-100 dark:border-gray-700/50">
                    <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200 font-medium">
                      {row.feature}
                    </td>
                    {row.values.map((value, i) => (
                      <td key={i} className="py-4 px-6 text-center">
                        {typeof value === 'boolean' ? (
                          value ? (
                            <Check size={20} className="text-green-500 mx-auto" />
                          ) : (
                            <X size={20} className="text-gray-400 mx-auto" />
                          )
                        ) : (
                          <span className="text-sm text-gray-700 dark:text-gray-300">{value}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ===== FAQ SECTION ===== */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
              Часто задаваемые вопросы
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Ответы на самые популярные вопросы
            </p>
          </div>
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <button
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  onClick={() => toggleFaq(index)}
                >
                  <span className="font-medium text-gray-900 dark:text-white">{item.question}</span>
                  {openFaq === index ? (
                    <ChevronUp size={20} className="text-gray-500" />
                  ) : (
                    <ChevronDown size={20} className="text-gray-500" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4 text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-4">
                    {item.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="py-20 bg-blue-600 dark:bg-blue-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-white">
              Начните с бесплатного тарифа
            </h2>
            <p className="mt-4 text-lg text-blue-100">
              Оцените все возможности без риска – первые 3 товара бесплатно.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-100 text-blue-700 font-medium rounded-lg shadow-lg transition-all hover:scale-105"
              >
                Зарегистрироваться
                <ArrowRight size={20} />
              </Link>
              <a
                href="https://t.me/ProskladaiBot"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 border border-white/30 hover:bg-white/10 text-white font-medium rounded-lg transition-colors"
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
                <li><Link to="/features" className="hover:text-white transition-colors">Возможности</Link></li>
                <li><Link to="/pricing" className="hover:text-white transition-colors">Цены</Link></li>
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

// ===== DATA =====

const plans = [
  {
    name: 'Бесплатный',
    description: 'Для знакомства с сервисом',
    price: 'Бесплатно',
    popular: false,
    ctaText: 'Начать',
    ctaLink: '/register',
    features: [
      { text: 'До 3 товаров', included: true },
      { text: 'Генерация SEO (базовая)', included: true },
      { text: 'Поиск инфографики (до 5 изображений)', included: true },
      { text: 'Базовые отчёты', included: true },
      { text: 'Поддержка в чате', included: false },
      { text: 'API-доступ', included: false },
      { text: 'Приоритетная поддержка', included: false },
    ],
  },
  {
    name: 'Старт',
    description: 'Для небольших магазинов',
    price: '990 ₽',
    popular: true,
    ctaText: 'Выбрать',
    ctaLink: '/register',
    features: [
      { text: 'До 100 товаров', included: true },
      { text: 'Генерация SEO (расширенная)', included: true },
      { text: 'Поиск инфографики (до 20 изображений)', included: true },
      { text: 'Полные отчёты в PDF', included: true },
      { text: 'Поддержка в чате', included: true },
      { text: 'API-доступ', included: false },
      { text: 'Приоритетная поддержка', included: false },
    ],
  },
  {
    name: 'Бизнес',
    description: 'Для профессиональных продавцов',
    price: '2 990 ₽',
    popular: false,
    ctaText: 'Выбрать',
    ctaLink: '/register',
    features: [
      { text: 'Неограниченно товаров', included: true },
      { text: 'Генерация SEO (премиум)', included: true },
      { text: 'Поиск инфографики (до 50 изображений)', included: true },
      { text: 'Полные отчёты в PDF и Excel', included: true },
      { text: 'Поддержка в чате 24/7', included: true },
      { text: 'API-доступ', included: true },
      { text: 'Приоритетная поддержка', included: true },
    ],
  },
];

const comparisonFeatures = [
  { feature: 'Количество товаров', values: ['3', '100', '∞'] },
  { feature: 'SEO-генерация', values: ['Базовая', 'Расширенная', 'Премиум'] },
  { feature: 'Инфографика (изображений)', values: ['5', '20', '50'] },
  { feature: 'Отчёты', values: ['Базовые', 'PDF', 'PDF + Excel'] },
  { feature: 'Поддержка', values: ['Только FAQ', 'Чат', '24/7'] },
  { feature: 'API-доступ', values: [false, false, true] },
  { feature: 'Приоритетная поддержка', values: [false, false, true] },
];

const faqItems = [
  {
    question: 'Можно ли попробовать бесплатно?',
    answer:
      'Да, тариф "Бесплатный" включает 3 товара для полного тестирования всех функций без ограничений по времени.',
  },
  {
    question: 'Как происходит оплата?',
    answer:
      'Оплата производится ежемесячно через банковскую карту. Вы можете отменить подписку в любой момент в личном кабинете.',
  },
  {
    question: 'Есть ли скидки для крупных продавцов?',
    answer:
      'Да, при оплате за год вы получаете скидку 20%. Также предусмотрены индивидуальные условия для оптовых продавцов – свяжитесь с нами.',
  },
  {
    question: 'Можно ли перейти с бесплатного плана на платный?',
    answer:
      'Да, вы можете перейти на любой платный тариф в один клик из личного кабинета. Все ваши данные и товары сохранятся.',
  },
  {
    question: 'Что входит в поддержку?',
    answer:
      'Поддержка включает помощь по вопросам работы с сервисом, генерации контента и интеграции. На планах "Старт" и "Бизнес" – поддержка в чате.',
  },
];

export default PricingPage;