// src/pages/Dashboard/SettingsPage.tsx
import React, { useState, useEffect } from 'react';
import {
  Settings,
  Moon,
  Sun,
  Monitor,
  Globe,
  Bell,
  Mail,
  Sparkles,
  Save,
  RotateCcw,
  Loader2,
  CheckCircle,
  AlertCircle,
  Shield,
  Zap,
} from 'lucide-react';

// Типы для настроек
interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'ru' | 'en';
  emailNotifications: boolean;
  seoModel: 'deepseek' | 'chatgpt';
  seoVariants: number; // количество вариантов генерации
  infographicsCount: number; // количество изображений по умолчанию
  autoSave: boolean;
}

// Значения по умолчанию
const defaultSettings: UserSettings = {
  theme: 'system',
  language: 'ru',
  emailNotifications: true,
  seoModel: 'deepseek',
  seoVariants: 3,
  infographicsCount: 10,
  autoSave: true,
};

// Ключ для localStorage
const SETTINGS_KEY = 'proskladai_settings';

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Загрузка настроек из localStorage при монтировании
  useEffect(() => {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Объединяем с дефолтными, чтобы новые поля появились
        setSettings({ ...defaultSettings, ...parsed });
      } catch (e) {
        console.error('Ошибка загрузки настроек:', e);
        setSettings(defaultSettings);
      }
    } else {
      setSettings(defaultSettings);
    }
  }, []);

  // Сохранение настроек (локально + заглушка API)
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      // Сохраняем в localStorage
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));

      // Здесь должен быть реальный запрос к API для сохранения на сервере
      // await saveUserSettings(settings);
      // Имитация задержки
      await new Promise((resolve) => setTimeout(resolve, 800));

      setSuccess('Настройки успешно сохранены');
    } catch (err: any) {
      setError(err.message || 'Ошибка сохранения настроек');
    } finally {
      setSaving(false);
    }
  };

  // Сброс настроек к дефолтным
  const handleReset = () => {
    if (window.confirm('Сбросить все настройки к значениям по умолчанию?')) {
      setSettings(defaultSettings);
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
      setSuccess('Настройки сброшены до значений по умолчанию');
    }
  };

  // Обновление поля
  const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  // Применение темы (для демонстрации — в реальности надо менять класс на html)
  const applyTheme = (theme: UserSettings['theme']) => {
    // Это заглушка, реальное применение темы должно быть в App или через контекст
    console.log('Применение темы:', theme);
    // Можно добавить логику переключения класса dark на html
  };

  // При изменении темы сразу применяем (для демонстрации)
  useEffect(() => {
    applyTheme(settings.theme);
  }, [settings.theme]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 size={32} className="animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Настройки</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Управляйте параметрами приложения и пользовательскими предпочтениями
        </p>
      </div>

      {/* Уведомления */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 flex items-start gap-3">
          <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400 flex items-start gap-3">
          <CheckCircle size={20} className="flex-shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Общие настройки</h2>
        </div>
        <div className="px-6 py-4 space-y-6">
          {/* Тема */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Тема оформления</label>
            <div className="flex gap-3">
              {[
                { value: 'light', label: 'Светлая', icon: Sun },
                { value: 'dark', label: 'Тёмная', icon: Moon },
                { value: 'system', label: 'Системная', icon: Monitor },
              ].map((option) => {
                const Icon = option.icon;
                const isActive = settings.theme === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => updateSetting('theme', option.value as UserSettings['theme'])}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                      isActive
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="text-sm font-medium">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Язык */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Язык интерфейса</label>
            <div className="flex gap-3">
              {[
                { value: 'ru', label: 'Русский', icon: Globe },
                { value: 'en', label: 'English', icon: Globe },
              ].map((option) => {
                const isActive = settings.language === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => updateSetting('language', option.value as UserSettings['language'])}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                      isActive
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                  >
                    <Globe size={18} />
                    <span className="text-sm font-medium">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Настройки генерации */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Настройки генерации</h2>
        </div>
        <div className="px-6 py-4 space-y-6">
          {/* Модель SEO */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Модель для SEO-генерации</label>
            <div className="flex gap-3">
              {[
                { value: 'deepseek', label: 'DeepSeek', icon: Sparkles },
                { value: 'chatgpt', label: 'ChatGPT', icon: Zap },
              ].map((option) => {
                const isActive = settings.seoModel === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => updateSetting('seoModel', option.value as UserSettings['seoModel'])}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                      isActive
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                  >
                    <option.icon size={18} />
                    <span className="text-sm font-medium">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Количество вариантов SEO */}
          <div>
            <label htmlFor="seoVariants" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Количество вариантов SEO-текстов
            </label>
            <input
              id="seoVariants"
              type="number"
              min={1}
              max={5}
              value={settings.seoVariants}
              onChange={(e) => updateSetting('seoVariants', Number(e.target.value))}
              className="mt-1 w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">От 1 до 5 вариантов</p>
          </div>

          {/* Количество изображений для инфографики */}
          <div>
            <label htmlFor="infographicsCount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Количество изображений для инфографики (по умолчанию)
            </label>
            <input
              id="infographicsCount"
              type="number"
              min={1}
              max={20}
              value={settings.infographicsCount}
              onChange={(e) => updateSetting('infographicsCount', Number(e.target.value))}
              className="mt-1 w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">От 1 до 20 изображений</p>
          </div>
        </div>
      </div>

      {/* Уведомления */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Уведомления</h2>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail size={20} className="text-gray-500 dark:text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Email-уведомления</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Получать уведомления о завершении генераций на почту</p>
              </div>
            </div>
            <button
              onClick={() => updateSetting('emailNotifications', !settings.emailNotifications)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                settings.emailNotifications ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  settings.emailNotifications ? 'translate-x-6' : ''
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell size={20} className="text-gray-500 dark:text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Автосохранение результатов</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Автоматически сохранять сгенерированный SEO и инфографику в карточку</p>
              </div>
            </div>
            <button
              onClick={() => updateSetting('autoSave', !settings.autoSave)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                settings.autoSave ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  settings.autoSave ? 'translate-x-6' : ''
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Кнопки действий */}
      <div className="flex flex-wrap gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Сохранение...
            </>
          ) : (
            <>
              <Save size={18} />
              Сохранить настройки
            </>
          )}
        </button>
        <button
          onClick={handleReset}
          className="inline-flex items-center gap-2 px-6 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium rounded-lg transition-colors"
        >
          <RotateCcw size={18} />
          Сбросить настройки
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;