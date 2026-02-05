import React from "react";
import { ShoppingCart, TrendingUp, Users, Wallet } from "lucide-react";

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
  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.15),_transparent_60%)]" />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <div className="text-[11px] font-medium text-slate-500">Total Income (7D)</div>
            <div className="mt-2 text-xl font-semibold text-slate-900">{formatRupiah(totalIncome)}</div>
            <div className="mt-2 inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
              +12.5%
            </div>
          </div>
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-100">
            <Wallet className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.12),_transparent_60%)]" />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <div className="text-[11px] font-medium text-slate-500">Orders</div>
            <div className="mt-2 text-xl font-semibold text-slate-900">{totalOrders}</div>
            <div className="mt-2 inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
              +8 today
            </div>
          </div>
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-100">
            <ShoppingCart className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.12),_transparent_60%)]" />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <div className="text-[11px] font-medium text-slate-500">Users</div>
            <div className="mt-2 text-xl font-semibold text-slate-900">{totalUsers}</div>
            <div className="mt-2 inline-flex items-center rounded-full bg-purple-50 px-2 py-1 text-[10px] font-semibold text-purple-700 ring-1 ring-inset ring-purple-200">
              +24 this month
            </div>
          </div>
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 ring-1 ring-inset ring-purple-100">
            <Users className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.12),_transparent_60%)]" />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <div className="text-[11px] font-medium text-slate-500">Avg/day</div>
            <div className="mt-2 text-xl font-semibold text-slate-900">~{avgIncomeUnit}</div>
            <div className="mt-2 inline-flex items-center rounded-full bg-sky-50 px-2 py-1 text-[10px] font-semibold text-sky-700 ring-1 ring-inset ring-sky-200">
              trend stable
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
