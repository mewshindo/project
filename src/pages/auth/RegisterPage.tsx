import React from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Key, User, Phone, Flower } from 'lucide-react';
import { RegisterCredentials } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const RegisterPage: React.FC = () => {
  const { register: registerUser, isLoading, error } = useAuth();
  
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterCredentials>();
  
  const onSubmit = async (data: RegisterCredentials) => {
    await registerUser(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-auth-pattern bg-cover bg-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md p-8 rounded-lg shadow-xl animate-fade-in">
          <div className="flex flex-col items-center justify-center mb-8">
            <Flower className="h-12 w-12 text-primary-500" />
            <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
              Создать аккаунт
            </h1>
            <p className="mt-1 text-center text-gray-600 dark:text-gray-400">
              Присоедениться к Plant<span className="text-secondary-500">CRM</span> чтобы начать покупки
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-error-100 dark:bg-error-900/40 text-error-800 dark:text-error-300 text-sm rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="ФИО"
              type="text"
              icon={<User className="h-5 w-5 text-gray-400" />}
              placeholder="Джон растение"
              {...register('name', {
                required: 'ФИО указать обязательно',
              })}
              error={errors.name?.message}
              fullWidth
            />

            <Input
              label="Email"
              type="email"
              icon={<Mail className="h-5 w-5 text-gray-400" />}
              placeholder="your@email.com"
              {...register('email', {
                required: 'Email указать обязательно',
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: 'Пожалуйста укажите действительный email',
                },
              })}
              error={errors.email?.message}
              fullWidth
            />

            <Input
              label="Номер телефона (не обязательно)"
              type="tel"
              icon={<Phone className="h-5 w-5 text-gray-400" />}
              placeholder="+7 555 123 4567"
              {...register('phone')}
              fullWidth
            />

            <Input
              label="Пароль"
              type="password"
              icon={<Key className="h-5 w-5 text-gray-400" />}
              placeholder="••••••••"
              {...register('password', {
                required: 'Пароль указать обязательно',
                minLength: {
                  value: 6,
                  message: 'Пароль должен состоять хотя бы из 6 символов',
                },
              })}
              error={errors.password?.message}
              fullWidth
            />

            <Button type="submit" isLoading={isLoading} fullWidth>
              Создать аккаунт
            </Button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-gray-600 dark:text-gray-400 text-sm">
              Уже есть аккаунт?{' '}
              <Link
                to="/login"
                className="text-primary-600 dark:text-primary-400 font-medium hover:underline"
              >
                Войти
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;