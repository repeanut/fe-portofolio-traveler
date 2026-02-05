import React from "react";

type OrderStatus = "paid" | "pending" | "failed";

type RecentOrderLike = {
  id: string;
  customer: string;
  date: string;
  total: number;
  status: OrderStatus;
};

type StatusStyle = { label: string; className: string };

interface DashboardRecentOrdersCardProps {
  recentOrders: RecentOrderLike[];
  statusStyles: Record<OrderStatus, StatusStyle>;
  formatRupiah: (amount: number) => string;
  onViewAll: () => void;
}

const DashboardRecentOrdersCard: React.FC<DashboardRecentOrdersCardProps> = ({
  recentOrders,
  statusStyles,
  formatRupiah,
  onViewAll,
}) => {
  return (
    <section className="flex flex-col rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Recent Orders</h3>
          <p className="mt-0.5 text-[11px] text-slate-500">Latest transactions</p>
        </div>
        <button
          type="button"
          onClick={onViewAll}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
        >
          View All
        </button>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-slate-100">
        <div className="grid grid-cols-12 bg-slate-50 px-4 py-3 text-[11px] font-medium text-slate-500">
          <div className="col-span-4">Order</div>
          <div className="col-span-4">Customer</div>
          <div className="col-span-2">Total</div>
          <div className="col-span-2 text-right">Status</div>
        </div>
        <div className="divide-y divide-slate-100">
          {recentOrders.map((order) => {
            const s = statusStyles[order.status];
            return (
              <div key={order.id} className="grid grid-cols-12 items-center px-4 py-3">
                <div className="col-span-4 min-w-0">
                  <div className="text-[11px] font-semibold text-slate-900 truncate">{order.id}</div>
                  <div className="mt-0.5 text-[10px] text-slate-500">{order.date}</div>
                </div>
                <div className="col-span-4 min-w-0 text-[11px] text-slate-700 truncate">{order.customer}</div>
                <div className="col-span-2 text-[11px] font-medium text-slate-800">{formatRupiah(order.total)}</div>
                <div className="col-span-2 flex justify-end">
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-[10px] font-semibold ring-1 ring-inset ${s.className}`}>
                    {s.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default DashboardRecentOrdersCard;
