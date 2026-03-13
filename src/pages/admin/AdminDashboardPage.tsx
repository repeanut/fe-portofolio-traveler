import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { ApexOptions } from "apexcharts";
import AdminSidebar from "../../components/admin/AdminSidebar";
import type { AdminSidebarItemKey } from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import DashboardSummaryCards from "../../components/admin/dashboard/DashboardSummaryCards";
import DashboardGrowthCard from "../../components/admin/dashboard/DashboardGrowthCard";
import DashboardCalendarCard from "../../components/admin/dashboard/DashboardCalendarCard";
import DashboardRecentOrdersCard from "../../components/admin/dashboard/DashboardRecentOrdersCard";
import { dashboardService } from "../../services/dashboard.service";
import type { DashboardStats, Transaction, CalendarOrder } from "../../services/dashboard.service";

type IncomeDayPoint = { date: string; unit: number; amount: number };

type StoredTransaction = {
  status?: string;
  paidStatus?: string;
  netAmount?: number;
  grossAmount?: number;
  date?: string;
};

const TRANSACTIONS_STORAGE_KEY = "admin_transactions";

type OrderStatus = "paid" | "pending" | "failed";

type IncomeBucket = {
  key: string;
  label: string;
  amount: number;
  date: Date;
};

const formatRupiah = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);

const statusStyles: Record<OrderStatus, { label: string; className: string }> = {
  paid: {
    label: "Paid",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  pending: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  failed: {
    label: "Failed",
    className: "bg-rose-50 text-rose-700 ring-rose-200",
  },
};

const formatDateDdMmYyyy = (date: Date) => {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = String(date.getFullYear());
  return `${dd}-${mm}-${yyyy}`;
};

const parseTransactionDate = (raw: string) => {
  const direct = new Date(raw);
  if (!Number.isNaN(direct.getTime())) return direct;

  const matchDdMmYyyy = raw.trim().match(/^([0-9]{1,2})[-/.]([0-9]{1,2})[-/.]([0-9]{4})$/);
  if (matchDdMmYyyy) {
    const dd = Number(matchDdMmYyyy[1]);
    const mm = Number(matchDdMmYyyy[2]);
    const yyyy = Number(matchDdMmYyyy[3]);
    const parsed = new Date(yyyy, mm - 1, dd);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  const match = raw.trim().match(/^([0-9]{1,2})\s+([A-Za-z]{3})\s+([0-9]{4})$/);
  if (!match) return null;

  const day = Number(match[1]);
  const mon = match[2].toLowerCase();
  const year = Number(match[3]);
  const months: Record<string, number> = {
    jan: 0,
    feb: 1,
    mar: 2,
    apr: 3,
    may: 4,
    jun: 5,
    jul: 6,
    aug: 7,
    sep: 8,
    oct: 9,
    nov: 10,
    dec: 11,
  };

  const monthIndex = months[mon];
  if (monthIndex == null || !Number.isFinite(day) || !Number.isFinite(year)) return null;
  const parsed = new Date(year, monthIndex, day);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
};

const AdminDashboardPage: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<AdminSidebarItemKey>("dashboard");
  const [growthPeriod, setGrowthPeriod] = useState<"month" | "year">("year");
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const monthlyIncomeData = useMemo(() => {
    let list: StoredTransaction[] = [];
    try {
      const raw = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as unknown) : null;
      if (Array.isArray(parsed)) list = parsed as StoredTransaction[];
    } catch {
      // ignore
    }

    const parsedDates = list
      .map((t) => (t.date ? parseTransactionDate(t.date) : null))
      .filter((x): x is Date => x != null);

    const reference = parsedDates.length ? new Date(Math.max(...parsedDates.map((d) => d.getTime()))) : new Date();
    reference.setHours(0, 0, 0, 0);

    const buildBuckets = () => {
      if (growthPeriod === "year") {
        const years: IncomeBucket[] = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date(reference.getFullYear() - i, 0, 1);
          const key = String(d.getFullYear());
          years.push({ key, label: key, amount: 0, date: d });
        }
        return years;
      }

      const months: IncomeBucket[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(reference.getFullYear(), reference.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        const label = new Intl.DateTimeFormat("en-US", { month: "short" }).format(d);
        months.push({ key, label, amount: 0, date: d });
      }
      return months;
    };

    const buckets = buildBuckets();

    const totals = new Map<string, number>();
    for (const t of list) {
      if (t.status !== "paid" && t.paidStatus !== "paid") continue;
      const d = t.date ? parseTransactionDate(t.date) : null;
      if (!d) continue;

      const key =
        growthPeriod === "year"
          ? String(d.getFullYear())
          : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

      const amount = typeof t.netAmount === "number" ? t.netAmount : typeof t.grossAmount === "number" ? t.grossAmount : 0;
      totals.set(key, (totals.get(key) ?? 0) + amount);
    }

    for (const b of buckets) {
      b.amount = totals.get(b.key) ?? 0;
    }

    if (buckets.every((b) => b.amount === 0)) {
      const seeded: StoredTransaction[] = buckets.map((b, idx) => {
        const base = (idx + 2) * (growthPeriod === "year" ? 2_500_000 : 180_000);
        const dt = growthPeriod === "year" ? new Date(b.date.getFullYear(), 0, 2) : new Date(b.date.getFullYear(), b.date.getMonth(), 2);
        return {
          status: "paid",
          paidStatus: "paid",
          grossAmount: base,
          netAmount: Math.round(base * 0.9),
          date: formatDateDdMmYyyy(dt),
        };
      });

      try {
        const merged = [...list, ...seeded];
        localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(merged));
        list = merged;
      } catch {
        // ignore
      }

      const totals2 = new Map<string, number>();
      for (const t of list) {
        if (t.status !== "paid" && t.paidStatus !== "paid") continue;
        const d = t.date ? parseTransactionDate(t.date) : null;
        if (!d) continue;

        const key =
          growthPeriod === "year"
            ? String(d.getFullYear())
            : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

        const amount = typeof t.netAmount === "number" ? t.netAmount : typeof t.grossAmount === "number" ? t.grossAmount : 0;
        totals2.set(key, (totals2.get(key) ?? 0) + amount);
      }

      for (const b of buckets) {
        b.amount = totals2.get(b.key) ?? b.amount;
      }
    }

    const maxAmount = Math.max(1, ...buckets.map((b) => b.amount));
    const barValues = buckets.map((b) => Math.round((b.amount / maxAmount) * 70));

    const avgAmount = buckets.reduce((acc, b) => acc + b.amount, 0) / Math.max(1, buckets.length);
    const avgValue = Math.round((avgAmount / maxAmount) * 70);
    const avgValues = buckets.map(() => avgValue);

    const best = buckets.reduce((acc, b) => (b.amount > acc.amount ? b : acc), buckets[0]);
    const bestLabel = new Intl.DateTimeFormat("en-US", {
      month: growthPeriod === "year" ? undefined : "short",
      year: "numeric",
    }).format(best.date);

    return {
      categories: buckets.map((b) => b.label),
      barValues,
      avgValues,
      amounts: buckets.map((b) => b.amount),
      maxAmount,
      bestAmount: best.amount,
      bestLabel,
    };
  }, [growthPeriod]);

  const income30DaysData = useMemo(() => {
    let list: StoredTransaction[] = [];
    try {
      const raw = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as unknown) : null;
      if (Array.isArray(parsed)) list = parsed as StoredTransaction[];
    } catch {
      // ignore
    }

    if (list.length === 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const mk = (daysAgo: number, amount: number): StoredTransaction => {
        const d = new Date(today);
        d.setDate(today.getDate() - daysAgo);
        return {
          status: "paid",
          paidStatus: "paid",
          netAmount: amount,
          grossAmount: amount,
          date: formatDateDdMmYyyy(d),
        };
      };

      list = [
        mk(28, 350_000),
        mk(25, 1_250_000),
        mk(21, 650_000),
        mk(17, 1_900_000),
        mk(13, 900_000),
        mk(9, 2_350_000),
        mk(5, 1_450_000),
        mk(2, 2_950_000),
      ];

      try {
        localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(list));
      } catch {
        // ignore
      }
    }

    const parsedDates = list
      .map((t) => (t.date ? parseTransactionDate(t.date) : null))
      .filter((x): x is Date => x != null);

    const reference = parsedDates.length ? new Date(Math.max(...parsedDates.map((d) => d.getTime()))) : new Date();
    reference.setHours(0, 0, 0, 0);

    const start = new Date(reference);
    start.setDate(reference.getDate() - 29);

    const totalsByDay = new Map<string, number>();
    for (const t of list) {
      if (t.status !== "paid") continue;
      const d = t.date ? parseTransactionDate(t.date) : null;
      if (!d) continue;
      d.setHours(0, 0, 0, 0);
      if (d < start || d > reference) continue;
      const key = d.toISOString().slice(0, 10);
      const amount = typeof t.netAmount === "number" ? t.netAmount : typeof t.grossAmount === "number" ? t.grossAmount : 0;
      totalsByDay.set(key, (totalsByDay.get(key) ?? 0) + amount);
    }

    const days: IncomeDayPoint[] = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      const amount = totalsByDay.get(key) ?? 0;

      const unit = Math.round(Math.min(30, Math.max(0, amount / 100000)));
      days.push({ date: formatDateDdMmYyyy(d), unit, amount });
    }

    return days;
  }, []);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [stats, transactionsData] = await Promise.all([
          dashboardService.getDashboardStats(),
          dashboardService.getTransactions({ limit: 100 })
        ]);
        
        setDashboardStats(stats);
        setTransactions(transactionsData.transactions);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const recentOrders: CalendarOrder[] = useMemo(
    () => transactions ? dashboardService.getRecentOrders(transactions, 10) : [],
    [transactions]
  );

  const calendarOrders = useMemo(
    () => transactions ? dashboardService.getCalendarOrders(transactions) : [],
    [transactions]
  );

  const monthlyIncome = useMemo(
    () => transactions ? dashboardService.calculateMonthlyIncome(transactions) : monthlyIncomeData,
    [transactions, monthlyIncomeData]
  );

  const income30Days = useMemo(() => {
    if (!transactions.length) return income30DaysData;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const dailyIncome = new Map<string, number>();
    
    transactions
      .filter(t => {
        const transactionDate = new Date(t.createdAt);
        return transactionDate >= thirtyDaysAgo && 
               transactionDate <= today &&
               (t.paymentStatus === 'paid' || t.status === 'completed');
      })
      .forEach(t => {
        const dateKey = t.createdAt.split('T')[0];
        dailyIncome.set(dateKey, (dailyIncome.get(dateKey) || 0) + t.finalAmount);
      });

    const days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      const amount = dailyIncome.get(dateKey) || 0;
      
      days.push({
        date: date.toLocaleDateString('en-GB').replace(/\//g, '-'),
        unit: Math.round(Math.min(30, Math.max(0, amount / 100000))),
        amount
      });
    }

    return days;
  }, [transactions, income30DaysData]);
  const MULTIPLIER = 100_000;
  const totalIncome = dashboardStats?.totalIncome || income30Days.reduce((acc, p) => acc + p.amount, 0);
  const totalOrders = dashboardStats?.totalOrders || 128;
  const totalUsers = dashboardStats?.totalUsers || 342;
  const avgIncome = Math.round(totalIncome / Math.max(1, income30Days.length));
  const avgIncomeUnit = Math.round(Math.min(30, Math.max(0, avgIncome / MULTIPLIER)));

  const chartSeries = useMemo(
    () => [
      {
        name: "Recovery",
        type: "column" as const,
        data: monthlyIncome.barValues,
      },
      {
        name: "Average",
        type: "line" as const,
        data: monthlyIncome.avgValues,
      },
    ],
    [monthlyIncome]
  );

  const chartOptions: ApexOptions = useMemo(
    () => ({
      chart: {
        type: "line",
        stacked: false,
        toolbar: { show: false },
        zoom: { enabled: false },
        fontFamily: "inherit",
      },
      plotOptions: {
        bar: {
          columnWidth: "52%",
          borderRadius: 18,
          borderRadiusApplication: "end",
          endingShape: "rounded",
          colors: {
            backgroundBarColors: ["#eaf2ff"],
            backgroundBarOpacity: 1,
            backgroundBarRadius: 18,
          },
        },
      },
      dataLabels: { enabled: false },
      colors: ["#2563eb", "#3b82f6"],
      fill: {
        type: ["gradient", "solid"],
        gradient: {
          type: "vertical",
          shadeIntensity: 0,
          inverseColors: false,
          opacityFrom: 1,
          opacityTo: 0.15,
          stops: [0, 70, 100],
          colorStops: [
            [
              { offset: 0, color: "#2563eb", opacity: 1 },
              { offset: 55, color: "#60a5fa", opacity: 0.55 },
              { offset: 100, color: "#93c5fd", opacity: 0.15 },
            ],
          ],
        },
      },
      stroke: {
        width: [0, 2.5],
        curve: "smooth",
        dashArray: [0, 6],
      },
      states: {
        hover: {
          filter: {
            type: "none",
          },
        },
        active: {
          filter: {
            type: "none",
          },
        },
      },
      grid: {
        borderColor: "#e2e8f0",
        strokeDashArray: 0,
        padding: { left: 8, right: 8, top: 8, bottom: 0 },
      },
      xaxis: {
        categories: monthlyIncome.categories,
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: { style: { colors: "#94a3b8", fontSize: "11px" } },
      },
      yaxis: {
        min: 0,
        max: 70,
        tickAmount: 3,
        labels: {
          style: { colors: "#94a3b8", fontSize: "10px" },
          formatter: (val: number) => String(Math.round(val)),
        },
      },
      markers: {
        size: 0,
        hover: { size: 4 },
      },
      legend: {
        show: true,
        position: "top",
        horizontalAlign: "right",
        fontSize: "11px",
        labels: { colors: "#64748b" },
      },
      tooltip: {
        shared: true,
        intersect: false,
        custom: ({ dataPointIndex }) => {
          const label = monthlyIncome.categories[dataPointIndex] ?? "";
          const amount = monthlyIncome.amounts[dataPointIndex] ?? 0;
          const rupiah = formatRupiah(amount);
          return `
            <div style="background:#0f172a;color:#fff;padding:10px 12px;border-radius:12px;box-shadow:0 10px 30px rgba(2,6,23,.25)">
              <div style="font-size:11px;font-weight:700">${label}</div>
              <div style="font-size:10px;opacity:.85;margin-top:2px">Income: ${rupiah}</div>
            </div>
          `;
        },
      },
    }),
    [monthlyIncome]
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden overflow-x-hidden">
      <AdminSidebar
        active={activeMenu}
        onNavigate={(key) => {
          setActiveMenu(key);
          if (key === "dashboard") {
            navigate("/admin/dashboard");
          } else if (key === "chat") {
            navigate("/admin/chat");
          } else if (key === "landing") {
            navigate("/admin/landing/hero");
          } else if (key === "users") {
            navigate("/admin/users");
          } else if (key === "shop") {
            navigate("/admin/shop");
          } else if (key === "transactions") {
            navigate("/admin/transactions");
          } else if (key === "blog") {
            navigate("/admin/blog");
          }
        }}
        onNavigateLandingSub={(subKey) => {
          setActiveMenu("landing");
          if (subKey === "hero") {
            navigate("/admin/landing/hero");
          } else if (subKey === "travel") {
            navigate("/admin/landing/travel-journal");
          } else if (subKey === "about") {
            navigate("/admin/landing/about");
          } else if (subKey === "portfolio") {
            navigate("/admin/landing/portfolio");
          } else if (subKey === "certServices") {
            navigate("/admin/landing/cert-services");
          } else if (subKey === "experience") {
            navigate("/admin/landing/experience");
          } else if (subKey === "faq") {
            navigate("/admin/landing/faq");
          }
        }}
      />

      <div className="flex min-w-0 flex-1 flex-col px-4 py-4 md:px-8 md:py-6 overflow-hidden">
        <AdminHeader title="Dashboard" />

        <div className="flex-1 overflow-y-auto space-y-6 pr-1 pb-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <DashboardSummaryCards
                totalIncome={totalIncome}
                totalOrders={totalOrders}
                totalUsers={totalUsers}
                avgIncomeUnit={avgIncomeUnit}
                formatRupiah={formatRupiah}
              />

              <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr] items-stretch">
                <DashboardGrowthCard
                  growthPeriod={growthPeriod}
                  onChangeGrowthPeriod={setGrowthPeriod}
                  chartOptions={chartOptions}
                  chartSeries={chartSeries}
                  monthlyIncome={monthlyIncome}
                  avgIncome={avgIncome}
                  formatRupiah={formatRupiah}
                />

                <DashboardCalendarCard 
                  recentOrders={calendarOrders} 
                  formatRupiah={formatRupiah} 
                />
              </section>

              <DashboardRecentOrdersCard
                recentOrders={recentOrders}
                statusStyles={statusStyles}
                formatRupiah={formatRupiah}
                onViewAll={() => navigate("/admin/transactions")}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
