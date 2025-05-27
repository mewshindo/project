import React from 'react';
import { Card, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import { ShoppingCart } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { Product } from '../../types';
import { useCart } from '../../contexts/CartContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  
  const handleAddToCart = () => {
    addToCart(product, 1);
  };

  return (
    <Card className="h-full flex flex-col transition-all duration-300 hover:shadow-lg overflow-hidden group" variant="default">
      <div className="relative h-48 overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.featured && (
          <div className="absolute top-2 right-2 bg-accent-500 text-white text-xs px-2 py-1 rounded-full">
            Избранное
          </div>
        )}
      </div>
      <CardContent className="flex-grow flex flex-col py-4">
        <h3 className="font-medium text-gray-900 dark:text-white mb-1">{product.name}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 flex-grow">
          {product.description.length > 80
            ? `${product.description.substring(0, 80)}...`
            : product.description}
        </p>
        <div className="flex justify-between items-center mt-2">
          <span className="font-semibold text-gray-900 dark:text-white">
            {formatCurrency(product.price)}
          </span>
          <Button 
            size="sm" 
            rightIcon={<ShoppingCart className="h-4 w-4" />}
            onClick={handleAddToCart}
          >
            Добавить
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;