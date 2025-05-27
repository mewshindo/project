import React from 'react';
import { useForm } from 'react-hook-form';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Product, ProductCreateInput } from '../../types';

interface AdminProductFormProps {
  product?: Product;
  onSubmit: (data: ProductCreateInput) => Promise<void>;
  isLoading: boolean;
}

const AdminProductForm: React.FC<AdminProductFormProps> = ({
  product,
  onSubmit,
  isLoading,
}) => {
  const isEditing = !!product;

  const { register, handleSubmit, formState: { errors } } = useForm<ProductCreateInput>({
    defaultValues: isEditing
      ? {
          name: product.name,
          description: product.description,
          price: product.price,
          imageUrl: product.imageUrl,
          category: product.category,
          stock: product.stock,
          featured: product.featured,
        }
      : {
          featured: false,
        },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Input
          label="Название продукта"
          {...register('name', { required: 'Название товара указать обязательно' })}
          error={errors.name?.message}
          fullWidth
        />
        
        <Input
          label="Цена"
          type="number"
          step="0.01"
          {...register('price', { 
            required: 'Цену указать обязательно',
            min: { value: 0.01, message: 'Цена должна быть больше 0' }
          })}
          error={errors.price?.message}
          fullWidth
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Input
          label="Категория"
          {...register('category', { required: 'Категорию указать обязательно' })}
          error={errors.category?.message}
          fullWidth
        />
        
        <Input
          label="В наличии"
          type="number"
          {...register('stock', { 
            required: 'Указать число в наличии обязательно',
            min: { value: 0, message: 'Их не может быть меньше 0' }
          })}
          error={errors.stock?.message}
          fullWidth
        />
      </div>

      <Input
        label="URL изображения"
        {...register('imageUrl', { required: 'Указать URL изображения обязательно' })}
        error={errors.imageUrl?.message}
        fullWidth
      />

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Описание
        </label>
        <textarea
          {...register('description', { required: 'Указать описание обязательно' })}
          rows={4}
          className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        {errors.description?.message && (
          <p className="text-sm text-error-500">{errors.description.message}</p>
        )}
      </div>

      <div className="flex items-center">
        <input
          id="featured"
          type="checkbox"
          {...register('featured')}
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        />
        <label htmlFor="featured" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
          Избранный продукт
        </label>
      </div>

      <div className="flex justify-end">
        <Button type="submit" isLoading={isLoading}>
          {isEditing ? 'Обновить' : 'Создать'}
        </Button>
      </div>
    </form>
  );
};

export default AdminProductForm;