// src/pages/Landing/FeaturesPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  FileText,
  Image as ImageIcon,
  BarChart3,
  User,
  Users,
  Database,
  Sparkles,
  Search,
  Zap,
  Shield,
  Clock,
  Bot,
  Globe,
  Layout,
  CheckCircle2,
} from 'lucide-react';
import { Badge, Button, Card, CardContent } from '@/components/ui';
import LandingHeader from '@/components/landing/LandingHeader';

const FeaturesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <LandingHeader />

      {/* ===== HERO SECTION ===== */}
      <section className="py-16 md:py-24 border-b border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-4">
              <Sparkles size={16} aria-hidden="true" />
              Все возможности Proskladai
            </Badge>
            <h1>
              Инструменты для идеальной{' '}
              <span className="text-blue-600 dark:text-blue-400">карточки товара</span>
            </h1>
            <p className="mt-6 text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Узнайте, как наш сервис помогает продавцам маркетплейсов экономить время и увеличивать продажи
              за счёт автоматизации SEO и визуального контента.
            </p>
          </div>
        </div>
      </section>

      {/* ===== MAIN FEATURES GRID ===== */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {mainFeatures.map((feature, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded flex items-center justify-center text-blue-600 dark:text-blue-400">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {feature.title}
                      </h3>
                      <p className="mt-2 text-gray-600 dark:text-gray-400 leading-relaxed">
                        {feature.description}
                      </p>
                      {feature.bullets && (
                        <ul className="mt-3 space-y-1">
                          {feature.bullets.map((bullet, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <CheckCircle2 size={16} className="text-blue-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                              <span>{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TECHNICAL CAPABILITIES ===== */}
      <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-800/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2>Технологии, стоящие за сервисом</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Мы используем современные модели машинного обучения и надёжную архитектуру, чтобы обеспечить
              точность и скорость работы.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {techFeatures.map((tech, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
                    {tech.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{tech.title}</h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{tech.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ===== BENEFITS SECTION ===== */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2>Почему выбирают Proskladai</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Преимущества, которые делают наш сервис незаменимым для продавцов.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index}>
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 mx-auto bg-green-50 dark:bg-green-900/30 rounded flex items-center justify-center text-green-600 dark:text-green-400 mb-4">
                    {benefit.icon}
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{benefit.title}</h4>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="py-16 md:py-24 border-t border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-2xl mx-auto">
            <h2>Готовы попробовать все функции?</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Зарегистрируйтесь и получите 3 товара бесплатно для полного тестирования.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button asChild size="lg">
                <Link to="/register">
                  Создать аккаунт <ArrowRight size={20} className="ml-2" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="https://t.me/ProskladaiBot" target="_blank" rel="noopener noreferrer">
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

// === DATA ===

const mainFeatures = [
  {
    icon: <FileText size={24} />,
    title: 'Генерация SEO-оптимизации',
    description:
      'Нейросеть (DeepSeek / ChatGPT) создаёт заголовки, описания, ключевые слова и LSI-фразы, максимально релевантные вашему товару и поисковым запросам.',
    bullets: [
      'Анализ семантического ядра и интента запросов',
      'Генерация до 5 вариантов текстов',
      'Автоматическая вставка в карточку товара',
    ],
  },
  {
    icon: <ImageIcon size={24} />,
    title: 'Поиск инфографики',
    description:
      'Автоматический сбор визуального контента из открытых источников по артикулу или названию товара. Возвращает от 1 до 20 изображений.',
    bullets: [
      'Поиск по товарным кодам и названиям',
      'Сравнение метаданных с характеристиками товара',
      'Поддержка публичных баз данных и каталогов',
    ],
  },
  {
    icon: <BarChart3 size={24} />,
    title: 'Формирование отчётов',
    description:
      'Комплексные отчёты по результатам оптимизации: сгенерированные SEO-тексты, найденная инфографика, рекомендации и метрики.',
    bullets: [
      'Экспорт в PDF и Excel',
      'История всех генераций',
      'Сравнительный анализ эффективности',
    ],
  },
  {
    icon: <User size={24} />,
    title: 'Управление профилем и товарами',
    description:
      'Личный кабинет для управления списком товаров, настройками, историей запросов и профилем пользователя.',
    bullets: [
      'Загрузка данных о карточках (вручную или парсинг)',
      'Категоризация и тегирование товаров',
      'Удобный поиск и фильтрация',
    ],
  },
  {
    icon: <Database size={24} />,
    title: 'Парсинг и хранение данных',
    description:
      'Автоматический сбор информации о товарах с маркетплейсов и их хранение в структурированном виде.',
    bullets: [
      'Парсинг по артикулу или ссылке',
      'Обновление данных в фоновом режиме',
      'Безопасное хранение в PostgreSQL',
    ],
  },
  {
    icon: <Search size={24} />,
    title: 'NLP-обработка текстов',
    description:
      'Классификация и кластеризация поисковых запросов, анализ семантической релевантности для повышения качества SEO.',
    bullets: [
      'Группировка ключевых слов по интенту',
      'Подбор синонимов и LSI-фраз',
      'Оптимизация текстов под поисковые системы',
    ],
  },
];

const techFeatures = [
  {
    icon: <Bot size={24} />,
    title: 'AI-модели',
    description: 'Используем DeepSeek и ChatGPT API для генерации высококачественных SEO-текстов.',
  },
  {
    icon: <Zap size={24} />,
    title: 'Асинхронная обработка',
    description: 'Все запросы обрабатываются асинхронно, обеспечивая быстрый отклик (≤500 мс).',
  },
  {
    icon: <Shield size={24} />,
    title: 'Безопасность',
    description: 'HTTPS/TLS, шифрование данных и JWT-аутентификация для защиты пользователей.',
  },
  {
    icon: <Globe size={24} />,
    title: 'Масштабируемость',
    description: 'Поддерживаем до 1000 активных пользователей одновременно.',
  },
  {
    icon: <Layout size={24} />,
    title: 'Интеграция с Telegram',
    description: 'Бот на aiogram 3.x и веб-интерфейс, разработанные для удобного взаимодействия.',
  },
  {
    icon: <Clock size={24} />,
    title: '24/7 доступность',
    description: 'Uptime системы не менее 99.5% благодаря Docker и отказоустойчивой архитектуре.',
  },
];

const benefits = [
  {
    icon: <Clock size={24} />,
    title: 'Экономия времени',
    description: 'Автоматизация рутинных задач по созданию контента для карточек.',
  },
  {
    icon: <Zap size={24} />,
    title: 'Повышение конверсии',
    description: 'Качественные SEO-тексты и инфографика увеличивают продажи.',
  },
  {
    icon: <Shield size={24} />,
    title: 'Надёжность',
    description: 'Безопасное хранение данных и стабильная работа 24/7.',
  },
  {
    icon: <Users size={24} />,
    title: 'Поддержка',
    description: 'Наша команда всегда на связи для решения любых вопросов.',
  },
];

export default FeaturesPage;