import React, { useState, useEffect } from 'react';
import { customersAPI, ordersAPI } from '../../services/api';
import { Customer, Order } from '../../types';
import { formatCurrency, formatDate } from '../../lib/utils';
import Input from '../../components/ui/Input';
import { Search, User } from 'lucide-react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

const AdminCustomers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Fetch customers
  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoading(true);
      try {
        const data = await customersAPI.getAll();
        // Map backend fields to frontend expectations
        const mapped = data.map((customer: any) => ({
          ...customer,
          createdAt: customer.created_at,
          totalSpent: customer.total_spent,
          // If you use orders, you may want to map those too
          orders: (customer.orders || []).map((order: any) => ({
            ...order,
            createdAt: order.created_at,
            totalAmount: order.total_amount,
          })),
        }));
        setCustomers(mapped);
        setFilteredCustomers(mapped);
      } catch (err) {
        console.error('Failed to fetch customers:', err);
        setError('Не удалось получить клиентов. Пожалуйста повторите позже');
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchCustomers();
  }, []);

  // Filter customers by search term
  useEffect(() => {
    if (searchTerm === '') {
      setFilteredCustomers(customers);
    } else {
      const filtered = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (customer.phone && customer.phone.includes(searchTerm))
      );
      setFilteredCustomers(filtered);
    }
  }, [searchTerm, customers]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCustomerSelect = async (customer: Customer) => {
    setSelectedCustomer(customer);
    
    // Fetch customer orders
    setIsLoadingOrders(true);
    try {
      const orders = await ordersAPI.getUserOrders(customer.id);
      setCustomerOrders(orders);
    } catch (err) {
      console.error('Failed to fetch customer orders:', err);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const getStatusBadgeVariant = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'processing': return 'primary';
      case 'shipped': return 'secondary';
      case 'delivered': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Список клиентов
          </h2>
          
          <Input
            placeholder="Найти клиентов..."
            value={searchTerm}
            onChange={handleSearchChange}
            icon={<Search className="h-5 w-5 text-gray-400" />}
          />
        </div>

        {error && (
          <div className="mb-6 p-3 bg-error-100 dark:bg-error-900/40 text-error-800 dark:text-error-300 text-sm rounded-lg">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="text-center py-16 text-gray-600 dark:text-gray-400">
              Клиенты не найдены. {searchTerm ? 'Попробуйте изменить поле поиска.' : 'Клиенты появятся когда появятся.'}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Клиент
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Дата регистрации
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Потрачено денег
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                  {filteredCustomers.map((customer) => (
                    <tr 
                      key={customer.id} 
                      className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                        selectedCustomer?.id === customer.id 
                          ? 'bg-primary-50 dark:bg-primary-900/20' 
                          : ''
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-800 dark:text-primary-200">
                            {customer.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {customer.name}
                            </div>
                            {customer.phone && (
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {customer.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{customer.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{formatDate(customer.createdAt)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{formatCurrency(customer.totalSpent)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCustomerSelect(customer)}
                        >
                          Посмотреть заказы
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div className="md:col-span-1">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sticky top-20">
          {selectedCustomer ? (
            <div className="animate-fade-in">
              <div className="flex items-center mb-6">
                <div className="flex-shrink-0 h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-800 dark:text-primary-200 text-lg font-semibold">
                  {selectedCustomer.name.charAt(0).toUpperCase()}
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {selectedCustomer.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedCustomer.email}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Дата регистрации</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatDate(selectedCustomer.createdAt)}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Потрачено денег</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatCurrency(selectedCustomer.totalSpent)}
                  </p>
                </div>
              </div>

              <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                История заказов
              </h4>

              {isLoadingOrders ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
                </div>
              ) : customerOrders.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <User className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Ещё нет заказов
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {customerOrders.map((order) => (
                    <div 
                      key={order.id} 
                      className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            Заказ #{order.id}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <Badge variant={getStatusBadgeVariant(order.status)}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                        {formatCurrency(order.totalAmount)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                Данные клиента
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Выберите клиента чтобы посмотреть их данные и историю заказов
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCustomers;