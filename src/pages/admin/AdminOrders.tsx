import React, { useState, useEffect } from 'react';
import { ordersAPI } from '../../services/api';
import { Order } from '../../types';
import { formatCurrency, formatDate } from '../../lib/utils';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { Search, ChevronDown } from 'lucide-react';
import Input from '../../components/ui/Input';

type OrderStatus = Order['status'];

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const data = await ordersAPI.getAll();
        // Map backend fields to frontend expectations
        const mapped = data.map((order: any) => ({
          ...order,
          userName: order.user_name,
          createdAt: order.created_at,
          totalAmount: order.total_amount,
          items: (order.items || []).map((item: any) => ({
            ...item,
            productName: item.product_name,
            productId: item.product_id,
          })),
        }));
        setOrders(mapped);
        setFilteredOrders(mapped);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        setError('Не удалось загрузить заказы. Пожалуйста, попробуйте позже');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Filter orders
  useEffect(() => {
    let filtered = orders;
    
    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.userName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredOrders(filtered);
  }, [orders, statusFilter, searchTerm]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusChange = (status: OrderStatus | 'all') => {
    setStatusFilter(status);
  };

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await ordersAPI.updateStatus(orderId, status);
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status } : order
      ));
    } catch (err) {
      console.error('Failed to update order status:', err);
      setError('Не удалось обновить статус. Пожалуйста попробуйте позже');
    }
  };

  const getStatusBadgeVariant = (status: OrderStatus) => {
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
    <div>
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Текущие заказы
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Найти заказы..."
            value={searchTerm}
            onChange={handleSearchChange}
            icon={<Search className="h-5 w-5 text-gray-400" />}
          />
          
          <div className="flex flex-wrap gap-2">
            {(['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const).map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? 'primary' : 'outline'}
                size="sm"
                onClick={() => handleStatusChange(status)}
              >
                {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </div>
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
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-16 text-gray-600 dark:text-gray-400">
          Заказы не найдены. {searchTerm || statusFilter !== 'all' ? 'Попробуйте изменить поле поиска.' : 'Заказы появятся когда клиенты что-то закажут.'}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  ID заказа
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Клиент
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Дата
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Общая сумма
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Статус
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              {filteredOrders.map((order) => (
                <React.Fragment key={order.id}>
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{order.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{order.userName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{formatDate(order.createdAt)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{formatCurrency(order.totalAmount)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getStatusBadgeVariant(order.status)}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="ghost"
                        size="sm"
                        rightIcon={<ChevronDown className={`h-4 w-4 transition-transform ${expandedOrderId === order.id ? 'rotate-180' : ''}`} />}
                        onClick={() => toggleOrderDetails(order.id)}
                      >
                        Детали
                      </Button>
                    </td>
                  </tr>
                  
                  {/* Expanded order details */}
                  {expandedOrderId === order.id && (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50">
                        <div className="animate-fade-in">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Order Items</h4>
                          <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden mb-4">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                              <thead className="bg-gray-100 dark:bg-gray-800">
                                <tr>
                                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                                    Товар
                                  </th>
                                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                                    Цена
                                  </th>
                                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                                    Количество
                                  </th>
                                  <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">
                                    Стоимость
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                {order.items.map((item) => (
                                  <tr key={item.productId}>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                      {item.productName}
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                      {formatCurrency(item.price)}
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                      {item.quantity}
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right">
                                      {formatCurrency(item.price * item.quantity)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Обновить статус</h4>
                            <div className="flex gap-2">
                              {(['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const).map((status) => (
                                <Button
                                  key={status}
                                  variant={order.status === status ? 'primary' : 'outline'}
                                  size="sm"
                                  onClick={() => updateOrderStatus(order.id, status)}
                                >
                                  {status.charAt(0).toUpperCase() + status.slice(1)}
                                </Button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;