import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Alert, Button, FormField, Input } from '@/components/ui';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch {
      // ошибка уже в сторе
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Вход в аккаунт</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
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
              autoComplete="current-password"
              required
            />
          )}
        </FormField>
        {error && <Alert variant="error">{error}</Alert>}
        <Button type="submit" isLoading={isLoading} className="w-full">
          Войти
        </Button>
      </form>
      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        Нет аккаунта? <Link to="/register" className="text-blue-600 hover:underline">Зарегистрироваться</Link>
      </p>
    </div>
  );
};

export default LoginPage;
