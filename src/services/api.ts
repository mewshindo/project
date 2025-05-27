import axios from 'axios';
import Cookies from 'js-cookie';
import { 
  AuthResponse, 
  LoginCredentials, 
  RegisterCredentials, 
  Product, 
  ProductCreateInput,
  Review,
  Order,
  Customer,
  Role,
  Permission,
  RoleCreateInput,
  RoleUpdateInput
} from '../types';

// Create axios instance with base config
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = Cookies.get('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },
  
  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', credentials);
    return response.data;
  },
  
  logout: async (): Promise<void> => {
    Cookies.remove('auth_token');
  },
  
  getCurrentUser: async (): Promise<AuthResponse['user']> => {
    const response = await api.get<AuthResponse['user']>('/auth/me');
    return response.data;
  },
};

// Products API
export const productsAPI = {
  getAll: async (): Promise<Product[]> => {
    const response = await api.get<Product[]>('/products');
    return response.data;
  },
  
  getById: async (id: string): Promise<Product> => {
    const response = await api.get<Product>(`/products/${id}`);
    return response.data;
  },
  
  create: async (product: ProductCreateInput): Promise<Product> => {
    const response = await api.post<Product>('/products', product);
    return response.data;
  },
  
  update: async (id: string, product: Partial<ProductCreateInput>): Promise<Product> => {
    const response = await api.put<Product>(`/products/${id}`, product);
    return response.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`);
  },
  
  getByCategory: async (category: string): Promise<Product[]> => {
    const response = await api.get<Product[]>(`/products/category/${category}`);
    return response.data;
  },
};

// Reviews API
export const reviewsAPI = {
  getAll: async (): Promise<Review[]> => {
    const response = await api.get<Review[]>('/reviews');
    return response.data;
  },
  
  create: async (review: Omit<Review, 'id' | 'createdAt'>): Promise<Review> => {
    const response = await api.post<Review>('/reviews', review);
    return response.data;
  },
};

// Orders API
export const ordersAPI = {
  getAll: async (): Promise<Order[]> => {
    const response = await api.get<Order[]>('/orders');
    return response.data;
  },
  
  create: async (items: { productId: string; quantity: number }[]): Promise<Order> => {
    const response = await api.post<Order>('/orders', { items });
    return response.data;
  },
  
  updateStatus: async (id: string, status: Order['status']): Promise<Order> => {
    const response = await api.patch<Order>(`/orders/${id}/status`, { status });
    return response.data;
  },
  
  getUserOrders: async (userId: string): Promise<Order[]> => {
    const response = await api.get<Order[]>(`/orders/user/${userId}`);
    return response.data;
  },
};

// Customers API
export const customersAPI = {
  getAll: async (): Promise<Customer[]> => {
    const response = await api.get<Customer[]>('/customers');
    return response.data;
  },
  
  search: async (query: string): Promise<Customer[]> => {
    const response = await api.get<Customer[]>(`/customers/search?q=${query}`);
    return response.data;
  },
};

// Roles API
export const rolesAPI = {
  getAll: async (): Promise<Role[]> => {
    const response = await api.get<Role[]>('/roles');
    return response.data;
  },

  getById: async (id: string): Promise<Role> => {
    const response = await api.get<Role>(`/roles/${id}`);
    return response.data;
  },

  create: async (role: RoleCreateInput): Promise<Role> => {
    const response = await api.post<Role>('/roles', role);
    return response.data;
  },

  update: async (role: RoleUpdateInput): Promise<Role> => {
    const response = await api.put<Role>(`/roles/${role.id}`, role);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/roles/${id}`);
  },
};

// Permissions API
export const permissionsAPI = {
  getAll: async (): Promise<Permission[]> => {
    const response = await api.get<Permission[]>('/permissions');
    return response.data;
  },
};

export default api;