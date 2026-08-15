// src/pages/Dashboard/SettingsPage.tsx
import React, { useState, useEffect } from 'react';
import {
  Moon,
  Sun,
  Monitor,
  Globe,
  Bell,
  Mail,
  Sparkles,
  Save,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { Alert, Button, Card, CardContent, FormField, Input, Switch } from '@/components/ui';
import { getErrorMessage } from '@/utils/getErrorMessage';

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

// Отдельный ключ только для темы: его читает src/main.tsx на старте приложения,
// до первого рендера React, чтобы не было вспышки светлой темы у тёмного пользователя.
const THEME_KEY = 'theme';

// Реальное применение темы: tailwind.config.js использует darkMode: 'class',
// поэтому достаточно переключить класс `dark` на <html>.
const applyTheme = (theme: 'light' | 'dark' | 'system') => {
  const isDark =
    theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', isDark);
};

// Варианты выбора вынесены из JSX, чтобы типы значений выводились из UserSettings,
// а не расширялись до string.
const themeOptions: { value: UserSettings['theme']; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Светлая', icon: Sun },
  { value: 'dark', label: 'Тёмная', icon: Moon },
  { value: 'system', label: 'Системная', icon: Monitor },
];

const languageOptions: { value: UserSettings['language']; label: string; icon: typeof Globe }[] = [
  { value: 'ru', label: 'Русский', icon: Globe },
  { value: 'en', label: 'English', icon: Globe },
];

const seoModelOptions: { value: UserSettings['seoModel']; label: string; icon: typeof Sparkles }[] = [
  { value: 'deepseek', label: 'DeepSeek', icon: Sparkles },
  { value: 'chatgpt', label: 'ChatGPT', icon: Zap },
];

// Тема — единственное поле, которое читается НЕ из SETTINGS_KEY: THEME_KEY пишется
// сразу при выборе темы, а SETTINGS_KEY обновляется только по кнопке «Сохранить».
// Если бы тему брали из SETTINGS_KEY, то после перезагрузки без явного сохранения
// эффект синхронизации на монтировании откатил бы уже применённый main.tsx выбор
// и вдобавок перезаписал бы THEME_KEY старым значением. THEME_KEY авторитетен для
// того, что реально применено; SETTINGS_KEY хранит копию темы для полноты объекта.
const loadTheme = (): UserSettings['theme'] => {
  const saved = localStorage.getItem(THEME_KEY);
  return saved === 'light' || saved === 'dark' || saved === 'system' ? saved : 'system';
};

// Загрузка настроек из localStorage. Читаем синхронно при инициализации состояния,
// а не в useEffect: иначе первый прогон эффекта темы успевал применить дефолтную
// тему поверх той, что уже выставил main.tsx, и при заходе на страницу мигала
// светлая тема. Логика чтения остальных полей та же, что была раньше.
const loadSettings = (): UserSettings => {
  const theme = loadTheme();
  const saved = localStorage.getItem(SETTINGS_KEY);
  if (!saved) return { ...defaultSettings, theme };
  try {
    const parsed = JSON.parse(saved);
    // Объединяем с дефолтными, чтобы новые поля появились.
    // theme идёт последним — он должен перебить значение из SETTINGS_KEY.
    return { ...defaultSettings, ...parsed, theme };
  } catch (e) {
    console.error('Ошибка загрузки настроек:', e);
    return { ...defaultSettings, theme };
  }
};

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings>(loadSettings);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
    } catch (err) {
      setError(getErrorMessage(err, 'Ошибка сохранения настроек'));
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

  // При изменении темы сразу применяем её ко всему приложению и запоминаем выбор.
  // Единая точка: срабатывает и при выборе в UI, и при сбросе настроек, и после
  // загрузки сохранённых настроек — так THEME_KEY не разъезжается с settings.theme.
  useEffect(() => {
    applyTheme(settings.theme);
    localStorage.setItem(THEME_KEY, settings.theme);
  }, [settings.theme]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Настройки</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Управляйте параметрами приложения и пользовательскими предпочтениями
        </p>
      </div>

      {/* Уведомления */}
      {error && <Alert variant="error">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {/* Общие настройки */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Общие настройки</h2>
        </div>
        <CardContent className="space-y-6">
          {/* Тема */}
          <div>
            <p id="theme-group-label" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Тема оформления
            </p>
            <div role="group" aria-labelledby="theme-group-label" className="flex flex-wrap gap-3">
              {themeOptions.map((option) => {
                const Icon = option.icon;
                const isActive = settings.theme === option.value;
                return (
                  <Button
                    key={option.value}
                    type="button"
                    variant={isActive ? 'default' : 'outline'}
                    aria-pressed={isActive}
                    onClick={() => updateSetting('theme', option.value)}
                  >
                    <Icon size={18} className="mr-2" aria-hidden="true" />
                    {option.label}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Язык */}
          <div>
            <p id="language-group-label" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Язык интерфейса
            </p>
            <div role="group" aria-labelledby="language-group-label" className="flex flex-wrap gap-3">
              {languageOptions.map((option) => {
                const Icon = option.icon;
                const isActive = settings.language === option.value;
                return (
                  <Button
                    key={option.value}
                    type="button"
                    variant={isActive ? 'default' : 'outline'}
                    aria-pressed={isActive}
                    onClick={() => updateSetting('language', option.value)}
                  >
                    <Icon size={18} className="mr-2" aria-hidden="true" />
                    {option.label}
                  </Button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Настройки генерации */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Настройки генерации</h2>
        </div>
        <CardContent className="space-y-6">
          {/* Модель SEO */}
          <div>
            <p id="seo-model-group-label" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Модель для SEO-генерации
            </p>
            <div role="group" aria-labelledby="seo-model-group-label" className="flex flex-wrap gap-3">
              {seoModelOptions.map((option) => {
                const Icon = option.icon;
                const isActive = settings.seoModel === option.value;
                return (
                  <Button
                    key={option.value}
                    type="button"
                    variant={isActive ? 'default' : 'outline'}
                    aria-pressed={isActive}
                    onClick={() => updateSetting('seoModel', option.value)}
                  >
                    <Icon size={18} className="mr-2" aria-hidden="true" />
                    {option.label}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Количество вариантов SEO */}
          <div className="max-w-xs">
            <FormField id="seoVariants" label="Количество вариантов SEO-текстов" hint="От 1 до 5 вариантов">
              {(fieldProps) => (
                <Input
                  {...fieldProps}
                  type="number"
                  min={1}
                  max={5}
                  value={settings.seoVariants}
                  onChange={(e) => updateSetting('seoVariants', Number(e.target.value))}
                  className="w-32"
                />
              )}
            </FormField>
          </div>

          {/* Количество изображений для инфографики */}
          <div className="max-w-xs">
            <FormField
              id="infographicsCount"
              label="Количество изображений для инфографики (по умолчанию)"
              hint="От 1 до 20 изображений"
            >
              {(fieldProps) => (
                <Input
                  {...fieldProps}
                  type="number"
                  min={1}
                  max={20}
                  value={settings.infographicsCount}
                  onChange={(e) => updateSetting('infographicsCount', Number(e.target.value))}
                  className="w-32"
                />
              )}
            </FormField>
          </div>
        </CardContent>
      </Card>

      {/* Уведомления */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Уведомления</h2>
        </div>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <Mail size={20} className="mt-0.5 shrink-0 text-gray-500 dark:text-gray-400" aria-hidden="true" />
            <div className="flex-1">
              <Switch
                id="emailNotifications"
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                label="Email-уведомления"
                description="Получать уведомления о завершении генераций на почту"
              />
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Bell size={20} className="mt-0.5 shrink-0 text-gray-500 dark:text-gray-400" aria-hidden="true" />
            <div className="flex-1">
              <Switch
                id="autoSave"
                checked={settings.autoSave}
                onCheckedChange={(checked) => updateSetting('autoSave', checked)}
                label="Автосохранение результатов"
                description="Автоматически сохранять сгенерированный SEO и инфографику в карточку"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Кнопки действий */}
      <div className="flex flex-wrap gap-4">
        <Button onClick={() => void handleSave()} isLoading={saving}>
          {!saving && <Save size={18} className="mr-2" aria-hidden="true" />}
          {saving ? 'Сохранение...' : 'Сохранить настройки'}
        </Button>
        <Button variant="secondary" onClick={handleReset}>
          <RotateCcw size={18} className="mr-2" aria-hidden="true" />
          Сбросить настройки
        </Button>
      </div>
    </div>
  );
};

export default SettingsPage;