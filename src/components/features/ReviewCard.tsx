import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { Star } from 'lucide-react';
import { formatDate, getInitials } from '../../lib/utils';
import { Review } from '../../types';

interface ReviewCardProps {
  review: Review;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  // Generate star rating
  const stars = Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      className={`h-4 w-4 ${
        i < review.rating
          ? 'text-warning-500 fill-warning-500'
          : 'text-gray-300 dark:text-gray-600'
      }`}
    />
  ));

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-5">
        <div className="flex items-start">
          <div className="flex-shrink-0 mr-4">
            <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-800 dark:text-primary-200 font-medium">
              {getInitials(review.userName)}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {review.userName}
              </h4>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatDate(review.orderDate)}
              </span>
            </div>
            <div className="flex mb-2">{stars}</div>
            <p className="text-sm text-gray-600 dark:text-gray-300">{review.comment}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReviewCard;