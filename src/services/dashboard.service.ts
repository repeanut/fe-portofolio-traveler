import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:55435';

export interface DashboardStats {
  totalIncome: number;
  totalOrders: number;
  totalUsers: number;
  avgIncome: number;
  growthRate: number;
  todayOrders: number;
  monthlyGrowth: number;
  userGrowth: number;
}

export interface Transaction {
  id: string;
  transactionId: string;
  type: string;
  serviceName: string;
  description: string;
  amount: number;
  currency: string;
  finalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  buyerEmail: string;
  buyerName: string;
}

export interface CalendarOrder {
  id: string;
  customer: string;
  date: string;
  total: number;
  status: 'paid' | 'pending' | 'failed';
}

export interface MonthlyIncome {
  categories: string[];
  barValues: number[];
  avgValues: number[];
  amounts: number[];
  maxAmount: number;
  bestAmount: number;
  bestLabel: string;
}

class DashboardService {
  private getAuthHeaders() {
    const token = localStorage.getItem('adminToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  // Get dashboard statistics
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      // For now, combine data from multiple endpoints
      const [userStatsResponse, transactionsResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/admin/users/stats`, {
          headers: this.getAuthHeaders()
        }),
        axios.get(`${API_BASE_URL}/api/admin/transactions`, {
          headers: this.getAuthHeaders()
        })
      ]);

      const userStats = userStatsResponse.data.data;
      const transactionsData = transactionsResponse.data.data;

      // Calculate total income from paid transactions
      const paidTransactions = transactionsData.transactions.filter(
        (t: Transaction) => t.paymentStatus === 'paid' || t.status === 'completed'
      );
      const totalIncome = paidTransactions.reduce((sum: number, t: Transaction) => sum + t.finalAmount, 0);

      // Get recent transactions (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentTransactions = transactionsData.transactions.filter(
        (t: Transaction) => new Date(t.createdAt) >= sevenDaysAgo
      );

      // Calculate today's orders
      const today = new Date().toDateString();
      const todayOrders = transactionsData.transactions.filter(
        (t: Transaction) => new Date(t.createdAt).toDateString() === today
      ).length;

      return {
        totalIncome,
        totalOrders: transactionsData.stats?.totalTransactions || transactionsData.transactions.length,
        totalUsers: userStats.totalUsers,
        avgIncome: totalIncome / Math.max(1, recentTransactions.length),
        growthRate: 12.5, // Mock growth rate - calculate from historical data
        todayOrders,
        monthlyGrowth: 8, // Mock monthly growth
        userGrowth: userStats.recentUsers?.length || 0
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Return mock data on error
      return {
        totalIncome: 12500000,
        totalOrders: 128,
        totalUsers: 342,
        avgIncome: 350000,
        growthRate: 12.5,
        todayOrders: 8,
        monthlyGrowth: 8,
        userGrowth: 24
      };
    }
  }

  // Get transactions for calendar and recent orders
  async getTransactions(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<{
    transactions: Transaction[];
    pagination: any;
    stats: any;
  }> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/transactions`, {
        headers: this.getAuthHeaders(),
        params
      });

      return response.data.data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      // Return mock data on error
      return {
        transactions: this.getMockTransactions(),
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalTransactions: 4,
          limit: 10
        },
        stats: {
          totalTransactions: 4,
          totalRevenue: 1560000,
          paidTransactions: 2,
          pendingTransactions: 1,
          completedTransactions: 2,
          cancelledTransactions: 1
        }
      };
    }
  }

  // Convert transactions to calendar format
  getCalendarOrders(transactions: Transaction[]): CalendarOrder[] {
    return transactions.map(t => ({
      id: t.transactionId,
      customer: t.buyerName || 'Unknown Customer',
      date: new Date(t.createdAt).toISOString().split('T')[0],
      total: t.finalAmount,
      status: this.mapPaymentStatus(t.paymentStatus, t.status)
    }));
  }

  // Get recent orders for dashboard
  getRecentOrders(transactions: Transaction[], limit: number = 10): CalendarOrder[] {
    return transactions
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)
      .map(t => ({
        id: t.transactionId,
        customer: t.buyerName || 'Unknown Customer',
        date: new Date(t.createdAt).toISOString().split('T')[0],
        total: t.finalAmount,
        status: this.mapPaymentStatus(t.paymentStatus, t.status)
      }));
  }

  // Calculate monthly income data for charts
  calculateMonthlyIncome(transactions: Transaction[]): MonthlyIncome {
    const now = new Date();
    const months: string[] = [];
    const amounts: number[] = [];

    // Generate last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = date.toLocaleDateString('en-US', { month: 'short' });
      months.push(monthLabel);

      // Calculate income for this month
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const monthIncome = transactions
        .filter(t => {
          const transactionDate = new Date(t.createdAt);
          return transactionDate >= monthStart && transactionDate <= monthEnd &&
                 (t.paymentStatus === 'paid' || t.status === 'completed');
        })
        .reduce((sum, t) => sum + t.finalAmount, 0);

      amounts.push(monthIncome);
    }

    const maxAmount = Math.max(...amounts, 1);
    const barValues = amounts.map(amount => Math.round((amount / maxAmount) * 70));
    const avgAmount = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
    const avgValues = amounts.map(() => Math.round((avgAmount / maxAmount) * 70));

    const bestAmount = Math.max(...amounts);
    const bestIndex = amounts.indexOf(bestAmount);
    const bestLabel = months[bestIndex];

    return {
      categories: months,
      barValues,
      avgValues,
      amounts,
      maxAmount,
      bestAmount,
      bestLabel
    };
  }

  private mapPaymentStatus(paymentStatus: string, status: string): 'paid' | 'pending' | 'failed' {
    if (paymentStatus === 'paid' || status === 'completed') return 'paid';
    if (paymentStatus === 'pending' || status === 'pending') return 'pending';
    if (paymentStatus === 'failed' || status === 'cancelled') return 'failed';
    return 'pending';
  }

  private getMockTransactions(): Transaction[] {
    return [
      {
        id: '1',
        transactionId: 'TRX-1024',
        type: 'service',
        serviceName: 'Travel Package',
        description: 'Bali Tour Package',
        amount: 350000,
        currency: 'IDR',
        finalAmount: 350000,
        paymentMethod: 'transfer',
        paymentStatus: 'paid',
        status: 'completed',
        createdAt: '2026-03-10T10:00:00Z',
        updatedAt: '2026-03-10T10:00:00Z',
        buyerEmail: 'ayu@example.com',
        buyerName: 'Ayu Lestari'
      },
      {
        id: '2',
        transactionId: 'TRX-1025',
        type: 'service',
        serviceName: 'Travel Package',
        description: 'Jakarta City Tour',
        amount: 120000,
        currency: 'IDR',
        finalAmount: 120000,
        paymentMethod: 'ewallet',
        paymentStatus: 'pending',
        status: 'pending',
        createdAt: '2026-03-10T14:30:00Z',
        updatedAt: '2026-03-10T14:30:00Z',
        buyerEmail: 'rama@example.com',
        buyerName: 'Rama Putra'
      },
      {
        id: '3',
        transactionId: 'TRX-1026',
        type: 'service',
        serviceName: 'Travel Package',
        description: 'Yogyakarta Heritage Tour',
        amount: 890000,
        currency: 'IDR',
        finalAmount: 890000,
        paymentMethod: 'credit_card',
        paymentStatus: 'paid',
        status: 'completed',
        createdAt: '2026-03-09T09:15:00Z',
        updatedAt: '2026-03-09T09:15:00Z',
        buyerEmail: 'sarah@example.com',
        buyerName: 'Sarah N.'
      },
      {
        id: '4',
        transactionId: 'TRX-1027',
        type: 'service',
        serviceName: 'Travel Package',
        description: 'Bandung Culinary Tour',
        amount: 200000,
        currency: 'IDR',
        finalAmount: 200000,
        paymentMethod: 'transfer',
        paymentStatus: 'failed',
        status: 'cancelled',
        createdAt: '2026-03-08T16:45:00Z',
        updatedAt: '2026-03-08T16:45:00Z',
        buyerEmail: 'dimas@example.com',
        buyerName: 'Dimas B.'
      }
    ];
  }
}

export const dashboardService = new DashboardService();
