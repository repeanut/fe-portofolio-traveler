const API_BASE_URL = 'http://localhost:55435/api/shop';

export interface ShopItem {
  _id: string;
  title: string;
  imageSrc: string;
  price: string;
  deliveryTime?: string;
  serviceCategory: string;
  status: 'active' | 'inactive';
  details?: ProductDetail[];
  advantages?: ProductAdvantage[];
  packages?: ProductPackage[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductDetail {
  _id?: string;
  id?: string; // For backward compatibility
  fullText: string;
}

export interface ProductAdvantage {
  _id?: string;
  id?: string; // For backward compatibility
  title: string;
  subtitle: string;
}

export interface ProductPackage {
  _id?: string;
  id?: string; // For backward compatibility
  packageKey: 'basic' | 'standard' | 'premium';
  badge: string;
  description: string;
  features: string[];
  defaultWords: number;
  basePrice: number;
}

class ShopService {
  // Get all shop items
  async getShopItems(params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    status?: string;
  }): Promise<{ data: ShopItem[]; pagination: any }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.category) queryParams.append('category', params.category);
      if (params?.status) queryParams.append('status', params.status);

      console.log('Fetching shop items with params:', params);
      console.log('Query string:', queryParams.toString());

      const response = await fetch(`${API_BASE_URL}?${queryParams}`);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('API response:', result);
      
      // Ensure data is an array
      const data = Array.isArray(result.data) ? result.data : [];
      console.log('Processed data:', data);
      
      return {
        data: data,
        pagination: result.pagination || {}
      };
    } catch (error) {
      console.error('Error fetching shop items:', error);
      throw error;
    }
  }

  // Get single shop item
  async getShopItemById(id: string): Promise<ShopItem> {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching shop item:', error);
      throw error;
    }
  }

  // Create new shop item
  async createShopItem(shopItem: Partial<ShopItem>): Promise<ShopItem> {
    try {
      console.log('Creating shop item:', shopItem);
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(shopItem),
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('Create result:', result);
      return result.data;
    } catch (error) {
      console.error('Error creating shop item:', error);
      throw error;
    }
  }

  // Update shop item
  async updateShopItem(id: string, shopItem: Partial<ShopItem>): Promise<ShopItem> {
    try {
      console.log('Updating shop item:', id, shopItem);
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(shopItem),
      });
      
      console.log('Update response status:', response.status);
      console.log('Update response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Update error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('Update result:', result);
      return result.data;
    } catch (error) {
      console.error('Error updating shop item:', error);
      throw error;
    }
  }

  // Delete shop item
  async deleteShopItem(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting shop item:', error);
      throw error;
    }
  }

  // Get shop categories
  async getShopCategories(): Promise<string[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }
}

export const shopService = new ShopService();
