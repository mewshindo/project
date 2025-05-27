import React, { useState, useEffect } from 'react';
import { MessageSquare, Star } from 'lucide-react';
import { reviewsAPI, ordersAPI } from '../../services/api';
import { Review, Order } from '../../types';
import ReviewCard from '../../components/features/ReviewCard';
import { useAuth } from '../../contexts/AuthContext';

const ReviewsPage: React.FC = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState<string | null>(null); // orderId
  const [reviewForm, setReviewForm] = useState<{ rating: number; comment: string }>({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  // Fetch reviews and user's completed orders
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [reviewsData, ordersData] = await Promise.all([
          reviewsAPI.getAll(),
          user ? ordersAPI.getUserOrders(user.id) : Promise.resolve([]),
        ]);
        setReviews(reviewsData);
        // Only completed/delivered orders 
        setOrders(
          (ordersData || []).filter((order: Order) => order.status === 'delivered')
        );
      } catch (err) {
        console.error('Failed to fetch reviews or orders:', err);
        setError('Failed to load reviews or orders. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // Calculate average rating
  const averageRating = reviews.length
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  // Count ratings for each star level
  const ratingCounts = reviews.reduce((counts, review) => {
    counts[review.rating - 1]++;
    return counts;
  }, Array(5).fill(0));

  // Calculate percentages for rating distribution
  const ratingPercentages = ratingCounts.map(count =>
    (reviews.length ? (count / reviews.length) * 100 : 0).toFixed(0) + '%'
  );

  // Helper: check if order already has a review by this user
  const hasReview = (orderId: string) =>
    reviews.some(r => r.orderId === orderId && r.userId === user?.id);

  // Handle review form submit
  const handleReviewSubmit = async (orderId: string) => {
    setSubmitting(true);
    try {
      await reviewsAPI.create({
        orderId,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        userId: '',
        userName: '',
        orderDate: ''
      });
      // Refresh reviews
      const updatedReviews = await reviewsAPI.getAll();
      setReviews(updatedReviews);
      setShowReviewForm(null);
      setReviewForm({ rating: 5, comment: '' });
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12 animate-slide-down">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Отзывы клиентов
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Посмотрите, что клиенты думают про наш магазин
        </p>
      </div>
{/* User's completed orders for review */}
{user && (
            <div className="mb-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 animate-fade-in">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Ваши завершённые заказы
              </h3>
              {orders.length === 0 ? (
                <div className="text-gray-600 dark:text-gray-400">Нет заказов.</div>
              ) : (
                <ul className="space-y-4">
                  {orders.map(order => (
                    <li key={order.id} className="border-b border-gray-200 dark:border-gray-700 pb-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            Заказ #{order.id} &mdash; {new Date(order.createdAt || order.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-gray-600 dark:text-gray-400 text-sm">
                            Общая стоимость: ₽{order.totalAmount || order.totalAmount}
                          </div>
                        </div>
                        <div className="mt-2 md:mt-0">
                          {hasReview(order.id) ? (
                            <span className="text-success-600 dark:text-success-400 font-medium">Reviewed</span>
                          ) : showReviewForm === order.id ? (
                            <form
                              className="flex flex-col md:flex-row md:items-center gap-2"
                              onSubmit={e => {
                                e.preventDefault();
                                handleReviewSubmit(order.id);
                              }}
                            >
                              <div className="flex items-center">
                                {[1, 2, 3, 4, 5].map(star => (
                                  <button
                                    key={star}
                                    type="button"
                                    className={`mx-0.5 ${reviewForm.rating >= star ? 'text-warning-500' : 'text-gray-300 dark:text-gray-600'}`}
                                    onClick={() => setReviewForm(f => ({ ...f, rating: star }))}
                                    aria-label={`Set rating to ${star}`}
                                  >
                                    <Star className="h-5 w-5 fill-current" />
                                  </button>
                                ))}
                              </div>
                              <input
                                type="text"
                                className="border rounded px-2 py-1 text-sm"
                                placeholder="Напишите отзыв..."
                                value={reviewForm.comment}
                                onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                                required
                                maxLength={300}
                              />
                              <button
                                type="submit"
                                className="bg-primary-600 text-white px-3 py-1 rounded text-sm font-medium disabled:opacity-50"
                                disabled={submitting}
                              >
                                {submitting ? 'Отправка...' : 'Submit'}
                              </button>
                              <button
                                type="button"
                                className="ml-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-sm"
                                onClick={() => setShowReviewForm(null)}
                                disabled={submitting}
                              >
                                Отменить
                              </button>
                            </form>
                          ) : (
                            <button
                              className="bg-primary-600 text-white px-3 py-1 rounded text-sm font-medium"
                              onClick={() => setShowReviewForm(order.id)}
                              disabled={hasReview(order.id)}
                            >
                              Написать отзыв
                            </button>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : error ? (
        <div className="text-center py-16 text-error-600 dark:text-error-400">{error}</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-16">
          <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Пока что отзывов нет</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Будьте первым кто оставит отзыв!
          </p>
        </div>
      ) : (
        <>
          {/* Review stats */}
          <div className="mb-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-1 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700 pb-6 md:pb-0">
                <div className="text-5xl font-bold text-gray-900 dark:text-white">{averageRating}</div>
                <div className="flex items-center mt-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.round(parseFloat(averageRating))
                          ? 'text-warning-500 fill-warning-500'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  ))}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                </div>
              </div>

              <div className="md:col-span-2">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Оценки пользователей</h3>
                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center">
                      <div className="flex items-center min-w-[60px]">
                        <span className="text-sm text-gray-700 dark:text-gray-300 mr-2">{rating}</span>
                        <Star className="h-4 w-4 text-warning-500 fill-warning-500" />
                      </div>
                      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-warning-500 rounded-full"
                          style={{ width: ratingPercentages[5 - rating] }}
                        ></div>
                      </div>
                      <div className="min-w-[40px] text-right text-sm text-gray-500 dark:text-gray-400 ml-2">
                        {ratingCounts[5 - rating]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Недавние отзывы
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((review) => (
              <div key={review.id} className="animate-fade-in">
                <ReviewCard review={review} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ReviewsPage;