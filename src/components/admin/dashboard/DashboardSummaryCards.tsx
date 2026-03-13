import React from "react";
import { ShoppingCart, TrendingUp, Users, Wallet, ArrowUp, ArrowDown } from "lucide-react";

interface DashboardSummaryCardsProps {
  totalIncome: number;
  totalOrders: number;
  totalUsers: number;
  avgIncomeUnit: number;
  formatRupiah: (amount: number) => string;
}

const DashboardSummaryCards: React.FC<DashboardSummaryCardsProps> = ({
  totalIncome,
  totalOrders,
  totalUsers,
  avgIncomeUnit,
  formatRupiah,
}) => {
  // Calculate growth indicators (mock data for now)
  const incomeGrowth = 12.5;
  const ordersGrowth = 8;
  const usersGrowth = 24;
  const avgGrowth = 3.2;

  const GrowthIndicator = ({ value }: { value: number }) => (
    <div className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold ring-1 ring-inset ${
      value > 0 
        ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' 
        : 'bg-rose-50 text-rose-700 ring-rose-200'
    }`}>
      {value > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
      {Math.abs(value)}%
    </div>
  );
  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 max-w-full">
      <div className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm min-w-0 max-w-full">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.15),_transparent_60%)]" />
        <div className="relative flex min-w-0 items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-[11px] font-medium text-slate-500">Total Income (7D)</div>
            <div className="mt-2 text-xl font-semibold text-slate-900 truncate">{formatRupiah(totalIncome)}</div>
            <div className="mt-2">
              <GrowthIndicator value={incomeGrowth} />
            </div>
          </div>
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-100">
            <Wallet className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm min-w-0 max-w-full">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.12),_transparent_60%)]" />
        <div className="relative flex min-w-0 items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-[11px] font-medium text-slate-500">Orders</div>
            <div className="mt-2 text-xl font-semibold text-slate-900">{totalOrders}</div>
            <div className="mt-2">
              <GrowthIndicator value={ordersGrowth} />
              <div className="mt-1 text-[9px] text-slate-500">+8 today</div>
            </div>
          </div>
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-100">
            <ShoppingCart className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm min-w-0 max-w-full">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.12),_transparent_60%)]" />
        <div className="relative flex min-w-0 items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-[11px] font-medium text-slate-500">Users</div>
            <div className="mt-2 text-xl font-semibold text-slate-900">{totalUsers}</div>
            <div className="mt-2">
              <GrowthIndicator value={usersGrowth} />
              <div className="mt-1 text-[9px] text-slate-500">+24 this month</div>
            </div>
          </div>
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 ring-1 ring-inset ring-purple-100">
            <Users className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm min-w-0 max-w-full">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.12),_transparent_60%)]" />
        <div className="relative flex min-w-0 items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-[11px] font-medium text-slate-500">Avg/day</div>
            <div className="mt-2 text-xl font-semibold text-slate-900">~{avgIncomeUnit}</div>
            <div className="mt-2">
              <GrowthIndicator value={avgGrowth} />
              <div className="mt-1 text-[9px] text-slate-500">trend stable</div>
            </div>
          </div>
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600 ring-1 ring-inset ring-sky-100">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardSummaryCards;
