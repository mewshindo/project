import React, { useState } from 'react';
import AdminProducts from './AdminProducts';
import AdminOrders from './AdminOrders';
import AdminCustomers from './AdminCustomers';
import AdminRoles from './AdminRoles';

type TabType = 'orders' | 'customers' | 'products' | 'roles';

const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('orders');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Панель управления
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            className={`flex-1 py-4 px-6 text-center text-sm font-medium border-b-2 ${
              activeTab === 'orders'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('orders')}
          >
            Текущие заказы
          </button>
          <button
            className={`flex-1 py-4 px-6 text-center text-sm font-medium border-b-2 ${
              activeTab === 'customers'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('customers')}
          >
            Клиенты
          </button>
          <button
            className={`flex-1 py-4 px-6 text-center text-sm font-medium border-b-2 ${
              activeTab === 'products'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('products')}
          >
            Товары
          </button>
          <button
            className={`flex-1 py-4 px-6 text-center text-sm font-medium border-b-2 ${
              activeTab === 'roles'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('roles')}
          >
            Роли
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'orders' && <AdminOrders />}
          {activeTab === 'customers' && <AdminCustomers />}
          {activeTab === 'products' && <AdminProducts />}
          {activeTab === 'roles' && <AdminRoles />}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;