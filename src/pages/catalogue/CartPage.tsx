import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Trash2, Plus, Minus, ArrowLeft } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { formatCurrency } from '../../lib/utils';
import Button from '../../components/ui/Button';
import { ordersAPI } from '../../services/api';

const CartPage: React.FC = () => {
  const { items, removeFromCart, updateQuantity, clearCart, totalPrice } = useCart();

  const handleCheckout = async () => {
    try {
      // Prepare items for API (productId and quantity)
      const orderItems = items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
      }));
  
      await ordersAPI.create(orderItems);
      clearCart();
      alert('Order placed successfully!');
      // Optionally, redirect to orders page:
      // navigate('/orders');
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Failed to place order.');
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Your cart is empty</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Looks like you haven't added any products to your cart yet.
          </p>
          <Link to="/catalogue">
            <Button leftIcon={<ArrowLeft className="h-4 w-4" />}>
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {items.map((item) => (
                <li key={item.productId} className="p-4 sm:p-6 animate-fade-in">
                  <div className="flex flex-col sm:flex-row">
                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>

                    <div className="sm:ml-6 flex-1 flex flex-col">
                      <div className="flex justify-between">
                        <h3 className="text-base font-medium text-gray-900 dark:text-white">
                          {item.product.name}
                        </h3>
                        <p className="ml-4 text-base font-medium text-gray-900 dark:text-white">
                          {formatCurrency(item.product.price * item.quantity)}
                        </p>
                      </div>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {item.product.category}
                      </p>
                      
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded">
                          <button
                            type="button"
                            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="px-4 py-2 text-gray-900 dark:text-white">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        <button
                          type="button"
                          className="text-error-600 dark:text-error-400 hover:text-error-800 dark:hover:text-error-300 flex items-center"
                          onClick={() => removeFromCart(item.productId)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          <span className="text-sm">Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between">
                <Link to="/catalogue">
                  <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />} size="sm">
                    Continue Shopping
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={clearCart}>
                  Clear Cart
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sticky top-20">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Order Summary</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                <span className="text-gray-900 dark:text-white">{formatCurrency(totalPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                <span className="text-gray-900 dark:text-white">Calculated at checkout</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Tax</span>
                <span className="text-gray-900 dark:text-white">Calculated at checkout</span>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 my-4 pt-4">
                <div className="flex justify-between text-base font-medium">
                  <span className="text-gray-900 dark:text-white">Total</span>
                  <span className="text-primary-600 dark:text-primary-400">{formatCurrency(totalPrice)}</span>
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Taxes and shipping calculated at checkout
                </p>
              </div>

              <Button 
                onClick={handleCheckout} 
                fullWidth
                size="lg"
              >
                Proceed to Checkout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;