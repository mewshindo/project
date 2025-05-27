import React from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Key, Flower } from 'lucide-react';
import { LoginCredentials } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const LoginPage: React.FC = () => {
  const { login, isLoading, error } = useAuth();
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginCredentials>();
  
  const onSubmit = async (data: LoginCredentials) => {
    await login(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-auth-pattern bg-cover bg-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md p-8 rounded-lg shadow-xl animate-fade-in">
          <div className="flex flex-col items-center justify-center mb-8">
            <Flower className="h-12 w-12 text-primary-500" />
            <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
              Добро пожаловать в Plant<span className="text-secondary-500">CRM</span>
            </h1>
            <p className="mt-1 text-center text-gray-600 dark:text-gray-400">
              Войдите в свой аккаунт
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-error-100 dark:bg-error-900/40 text-error-800 dark:text-error-300 text-sm rounded-lg">
              {error === 'Invalid email or password. Please try again.' 
                ? 'Неверный email или пароль. Пожалуйста, попробуйте снова.'
                : error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Email / Телефон"
              type="text"
              icon={<Mail className="h-5 w-5 text-gray-400" />}
              placeholder="ваш@email.com"
              {...register('email', {
                required: 'Email или телефон обязателен',
              })}
              error={errors.email?.message}
              fullWidth
            />

            <div className="space-y-2">
              <Input
                label="Пароль"
                type="password"
                icon={<Key className="h-5 w-5 text-gray-400" />}
                placeholder="••••••••"
                {...register('password', {
                  required: 'Пароль обязателен',
                  minLength: {
                    value: 6,
                    message: 'Пароль должен содержать минимум 6 символов',
                  },
                })}
                error={errors.password?.message}
                fullWidth
              />
              <div className="text-right">
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                >
                  Забыли пароль?
                </Link>
              </div>
            </div>

            <Button type="submit" isLoading={isLoading} fullWidth>
              Войти
            </Button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-gray-600 dark:text-gray-400 text-sm">
              Нет аккаунта?{' '}
              <Link
                to="/register"
                className="text-primary-600 dark:text-primary-400 font-medium hover:underline"
              >
                Зарегистрироваться
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;