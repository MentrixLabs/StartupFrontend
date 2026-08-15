import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Loader2 } from 'lucide-react';
import { Alert, Button, FormField, Input } from '@/components/ui';

const RegisterPage: React.FC = () => {

  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);
    

    if (password !== confirmPassword) {
      alert('Пароли не совпадают');
      return;
    }

    try {
      // Важно: порядок аргументов соответствует useAuthStore.register
      await register(username, email, password);
      navigate('/dashboard');
    } catch (err) {
      // ошибка уже в сторе
    }
  };

  const displayError = localError ?? error;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Регистрация</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField id="fullName" label="Имя">
          {(field) => (
            <Input
              {...field}
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              placeholder="Введите имя пользователя"
              required
            />
          )}
        </FormField>
        <FormField id="email" label="Email">
          {(field) => (
            <Input
              {...field}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          )}
        </FormField>
        <FormField id="password" label="Пароль">
          {(field) => (
            <Input
              {...field}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
              minLength={6}
            />
          )}
        </FormField>
        <FormField id="confirmPassword" label="Подтверждение пароля" error={localError}>
          {(field) => (
            <Input
              {...field}
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          )}
        </FormField>
        {displayError && <Alert variant="error">{displayError}</Alert>}
        <Button type="submit" isLoading={isLoading} className="w-full">
          Зарегистрироваться
        </Button>
      </form>
      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        Уже есть аккаунт? <Link to="/login" className="text-blue-600 hover:underline">Войти</Link>
      </p>
    </div>
  );
};

export default RegisterPage;