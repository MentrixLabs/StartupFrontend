// src/pages/Dashboard/ProfilePage.tsx
import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { User } from '@/api/types';
import {
  User as UserIcon,
  Mail,
  Lock,
  Save,
  Loader2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Alert, Button, Card, CardContent, FormField, Input } from '@/components/ui';
import { getErrorMessage } from '@/utils/getErrorMessage';

// Заглушки для API (в реальном проекте их нужно заменить на реальные вызовы)
const updateProfile = async (data: Partial<User>): Promise<User> => {
  console.log('updateProfile', data);
  return data as User;
};

const changePassword = async (oldPassword: string, newPassword: string): Promise<void> => {
  console.log('changePassword', oldPassword, newPassword);
};

const ProfilePage: React.FC = () => {
  const { user, isLoading: authLoading } = useAuthStore();

  // Состояния для формы профиля
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Состояния для смены пароля
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showCurrentPassword, setShowCurrentPassword] = useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [isChangingPassword, setIsChangingPassword] = useState<boolean>(false);

  // Состояния загрузки и уведомлений
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // При загрузке пользователя заполняем поля
  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  // Обработчик сохранения профиля
  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await updateProfile({
        full_name: fullName,
        email: email,
      });
      setSuccess('Профиль успешно обновлён');
      setIsEditing(false);
    } catch (err) {
      setError(getErrorMessage(err, 'Ошибка обновления профиля'));
    } finally {
      setSaving(false);
    }
  };

  // Обработчик смены пароля
  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }
    if (newPassword.length < 6) {
      setError('Новый пароль должен содержать минимум 6 символов');
      return;
    }
    setIsChangingPassword(true);
    setError(null);
    setSuccess(null);
    try {
      await changePassword(currentPassword, newPassword);
      setSuccess('Пароль успешно изменён');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(getErrorMessage(err, 'Ошибка смены пароля'));
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64" role="status">
        <Loader2 size={32} className="animate-spin text-blue-600" aria-hidden="true" />
        <span className="sr-only">Загрузка профиля...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 dark:text-gray-400">Пользователь не авторизован</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Профиль</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Управление личными данными и настройками аккаунта
        </p>
      </div>

      {/* Уведомления */}
      {error && <Alert variant="error">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {/* Карточка профиля */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Личная информация</h2>
            {!isEditing ? (
              <Button variant="link" size="sm" onClick={() => setIsEditing(true)}>
                Редактировать
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsEditing(false);
                    if (user) {
                      setFullName(user.full_name || '');
                      setEmail(user.email || '');
                    }
                  }}
                >
                  Отмена
                </Button>
                <Button size="sm" isLoading={saving} onClick={() => void handleSaveProfile()}>
                  {!saving && <Save size={16} className="mr-2" aria-hidden="true" />}
                  {saving ? 'Сохранение...' : 'Сохранить'}
                </Button>
              </div>
            )}
          </div>
        </div>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 shrink-0 bg-blue-100 dark:bg-blue-900/30 rounded flex items-center justify-center text-blue-600 dark:text-blue-400">
              <UserIcon size={20} aria-hidden="true" />
            </div>
            {isEditing ? (
              <div className="flex-1 max-w-md">
                <FormField id="profileFullName" label="Полное имя">
                  {(fieldProps) => (
                    <Input
                      {...fieldProps}
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Введите имя"
                    />
                  )}
                </FormField>
              </div>
            ) : (
              <dl className="flex-1">
                <dt className="block text-sm font-medium text-gray-700 dark:text-gray-300">Полное имя</dt>
                <dd className="mt-1 text-gray-900 dark:text-white">{fullName || 'Не указано'}</dd>
              </dl>
            )}
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 shrink-0 bg-purple-100 dark:bg-purple-900/30 rounded flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Mail size={20} aria-hidden="true" />
            </div>
            {isEditing ? (
              <div className="flex-1 max-w-md">
                <FormField id="profileEmail" label="Email">
                  {(fieldProps) => (
                    <Input
                      {...fieldProps}
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Введите email"
                    />
                  )}
                </FormField>
              </div>
            ) : (
              <dl className="flex-1">
                <dt className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</dt>
                <dd className="mt-1 text-gray-900 dark:text-white">{email}</dd>
              </dl>
            )}
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 shrink-0 bg-green-100 dark:bg-green-900/30 rounded flex items-center justify-center text-green-600 dark:text-green-400">
              <Lock size={20} aria-hidden="true" />
            </div>
            <div className="flex-1">
              <dl>
                <dt className="block text-sm font-medium text-gray-700 dark:text-gray-300">Пароль</dt>
                <dd className="mt-1 text-gray-500 dark:text-gray-400">••••••••</dd>
              </dl>
              <Button
                variant="link"
                size="sm"
                className="px-0"
                onClick={() => {
                  document.getElementById('password-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Сменить пароль
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Смена пароля */}
      <Card id="password-section">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Смена пароля</h2>
        </div>
        <CardContent className="space-y-4">
          <div className="max-w-md">
            <FormField id="currentPassword" label="Текущий пароль">
              {(fieldProps) => (
                <div className="relative">
                  <Input
                    {...fieldProps}
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="pr-10"
                    placeholder="Введите текущий пароль"
                  />
                  <button
                    type="button"
                    aria-label={showCurrentPassword ? 'Скрыть текущий пароль' : 'Показать текущий пароль'}
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    {showCurrentPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                  </button>
                </div>
              )}
            </FormField>
          </div>

          <div className="max-w-md">
            <FormField id="newPassword" label="Новый пароль">
              {(fieldProps) => (
                <div className="relative">
                  <Input
                    {...fieldProps}
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pr-10"
                    placeholder="Введите новый пароль (мин. 6 символов)"
                  />
                  <button
                    type="button"
                    aria-label={showNewPassword ? 'Скрыть новый пароль' : 'Показать новый пароль'}
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    {showNewPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                  </button>
                </div>
              )}
            </FormField>
          </div>

          <div className="max-w-md">
            <FormField id="confirmPassword" label="Подтверждение пароля">
              {(fieldProps) => (
                <div className="relative">
                  <Input
                    {...fieldProps}
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pr-10"
                    placeholder="Повторите новый пароль"
                  />
                  <button
                    type="button"
                    aria-label={showConfirmPassword ? 'Скрыть подтверждение пароля' : 'Показать подтверждение пароля'}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    {showConfirmPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                  </button>
                </div>
              )}
            </FormField>
          </div>

          <Button
            onClick={() => void handleChangePassword()}
            disabled={!currentPassword || !newPassword || !confirmPassword}
            isLoading={isChangingPassword}
          >
            {!isChangingPassword && <Lock size={18} className="mr-2" aria-hidden="true" />}
            {isChangingPassword ? 'Смена...' : 'Сменить пароль'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;