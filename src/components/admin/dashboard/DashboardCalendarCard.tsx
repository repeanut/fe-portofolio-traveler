import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, ShoppingCart, TrendingUp } from "lucide-react";
import { DayPicker } from "react-day-picker";

type RecentOrderLike = {
  id: string;
  customer: string;
  date: string;
  total: number;
  status?: 'paid' | 'pending' | 'failed';
};

interface DashboardCalendarCardProps {
  recentOrders: RecentOrderLike[];
  formatRupiah: (amount: number) => string;
}

const DashboardCalendarCard: React.FC<DashboardCalendarCardProps> = ({ recentOrders, formatRupiah }) => {
  const [weekOffset, setWeekOffset] = useState(0);

  const calendarWeek = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const jsDay = now.getDay();
    const diffToMonday = (jsDay + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - diffToMonday + weekOffset * 7);

    const shortMonth = new Intl.DateTimeFormat("en-US", { month: "short" }).format(monday);

    const labels = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
    const days = labels.map((d, idx) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + idx);
      const active = date.getTime() === now.getTime();
      return {
        d,
        n: String(date.getDate()),
        key: date.toISOString().slice(0, 10),
        active,
      };
    });

    return { monthLabel: shortMonth, days };
  }, [weekOffset]);

  const orderDateSet = useMemo(() => new Set(recentOrders.map((o) => o.date)), [recentOrders]);

  const todayKey = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now.toISOString().slice(0, 10);
  }, []);

  const [selectedDateKey, setSelectedDateKey] = useState(todayKey);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const datePickerWrapRef = useRef<HTMLDivElement | null>(null);

  const selectedDateObj = useMemo(() => new Date(`${selectedDateKey}T00:00:00`), [selectedDateKey]);
  const selectedDateLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(selectedDateObj),
    [selectedDateObj]
  );

  const calendarRef = useRef<HTMLDivElement | null>(null);
  const lastWheelTsRef = useRef(0);

  const handleWeekScroll = useCallback(
    (dir: "prev" | "next") => {
      const nextOffset = weekOffset + (dir === "next" ? 1 : -1);
      setWeekOffset(nextOffset);

      const base = new Date();
      base.setHours(0, 0, 0, 0);
      const jsDay = base.getDay();
      const diffToMonday = (jsDay + 6) % 7;
      const monday = new Date(base);
      monday.setDate(base.getDate() - diffToMonday + nextOffset * 7);
      setSelectedDateKey(monday.toISOString().slice(0, 10));
    },
    [weekOffset]
  );

  const jumpToDate = useCallback((date: Date) => {
    const base = new Date();
    base.setHours(0, 0, 0, 0);

    const normalize = (d: Date) => {
      const x = new Date(d);
      x.setHours(0, 0, 0, 0);
      return x;
    };

    const startOfWeekMonday = (d: Date) => {
      const x = normalize(d);
      const jsDay = x.getDay();
      const diffToMonday = (jsDay + 6) % 7;
      x.setDate(x.getDate() - diffToMonday);
      return x;
    };

    const baseMonday = startOfWeekMonday(base);
    const targetMonday = startOfWeekMonday(date);
    const deltaWeeks = Math.round((targetMonday.getTime() - baseMonday.getTime()) / (7 * 24 * 60 * 60 * 1000));

    setWeekOffset(deltaWeeks);
    setSelectedDateKey(normalize(date).toISOString().slice(0, 10));
  }, []);

  useEffect(() => {
    if (!isDatePickerOpen) return;

    const onPointerDown = (e: MouseEvent) => {
      const el = datePickerWrapRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) {
        setIsDatePickerOpen(false);
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsDatePickerOpen(false);
    };

    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isDatePickerOpen]);

  useEffect(() => {
    const el = calendarRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < 6) return;
      const now = Date.now();
      if (now - lastWheelTsRef.current < 180) return;
      lastWheelTsRef.current = now;

      e.preventDefault();
      handleWeekScroll(e.deltaY > 0 ? "next" : "prev");
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [handleWeekScroll]);

  const selectedDayOrders = useMemo(() => recentOrders.filter((o) => o.date === selectedDateKey), [recentOrders, selectedDateKey]);

  // Calculate order statistics for selected date
  const selectedDateStats = useMemo(() => {
    const orders = selectedDayOrders;
    const total = orders.reduce((sum: number, order: RecentOrderLike) => sum + order.total, 0);
    const paidOrders = orders.filter((order: RecentOrderLike) => order.status === 'paid').length;
    const pendingOrders = orders.filter((order: RecentOrderLike) => order.status === 'pending').length;
    const failedOrders = orders.filter((order: RecentOrderLike) => order.status === 'failed').length;
    
    return {
      totalOrders: orders.length,
      totalRevenue: total,
      paidOrders,
      pendingOrders,
      failedOrders,
      avgOrderValue: orders.length > 0 ? total / orders.length : 0
    };
  }, [selectedDayOrders]);

  return (
    <div className="h-full">
      <div className="flex h-full flex-col rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Order Calendar</h3>
            <p className="mt-0.5 text-[11px] text-slate-500">My agenda</p>
          </div>
        </div>

        <div ref={calendarRef} className="mt-4 rounded-2xl bg-slate-50 p-3 overscroll-contain">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-semibold text-slate-700">This week</div>
            <div className="inline-flex items-center gap-2 text-[11px] text-slate-500">
              <button
                type="button"
                onClick={() => handleWeekScroll("prev")}
                className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-100"
                aria-label="Previous week"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div ref={datePickerWrapRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsDatePickerOpen((v) => !v)}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
                  aria-label="Pick date"
                  aria-haspopup="dialog"
                  aria-expanded={isDatePickerOpen}
                >
                  <CalendarDays className="h-4 w-4" />
                  {calendarWeek.monthLabel}
                </button>

                {isDatePickerOpen ? (
                  <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-[304px] rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
                    <div className="mb-3 flex items-start justify-between gap-3 px-1">
                      <div className="min-w-0">
                        <div className="text-[12px] font-semibold text-slate-900">Select date</div>
                        <div className="mt-0.5 text-[10px] font-medium text-slate-500 truncate">{selectedDateLabel}</div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const d = new Date();
                            d.setHours(0, 0, 0, 0);
                            jumpToDate(d);
                            setIsDatePickerOpen(false);
                          }}
                          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Today
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsDatePickerOpen(false);
                          }}
                          className="rounded-lg bg-slate-900 px-2.5 py-1 text-[10px] font-semibold text-white hover:bg-slate-800"
                        >
                          Close
                        </button>
                      </div>
                    </div>

                    <DayPicker
                      mode="single"
                      selected={selectedDateObj}
                      onSelect={(d: Date | undefined) => {
                        if (!d) return;
                        jumpToDate(d);
                        setIsDatePickerOpen(false);
                      }}
                      weekStartsOn={1}
                      showOutsideDays
                      fixedWeeks
                      components={{
                        Chevron: ({
                          orientation,
                          className,
                        }: {
                          orientation?: "left" | "right" | "up" | "down";
                          className?: string;
                        }) =>
                          orientation === "left" ? (
                            <ChevronLeft className={className ?? "h-4 w-4"} />
                          ) : (
                            <ChevronRight className={className ?? "h-4 w-4"} />
                          ),
                      }}
                      modifiers={{
                        hasOrder: (date) => orderDateSet.has(date.toISOString().slice(0, 10)),
                      }}
                      modifiersClassNames={{
                        hasOrder:
                          "relative after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:h-1 after:w-1 after:rounded-full after:bg-blue-600",
                      }}
                      classNames={{
                        root: "text-[11px] text-slate-900",
                        months: "flex justify-center",
                        month: "w-full",
                        caption: "flex items-center justify-between px-1 pb-2",
                        caption_label: "text-[12px] font-semibold text-slate-900",
                        nav: "flex items-center gap-1",
                        nav_button:
                          "h-8 w-8 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                        table: "w-full border-collapse",
                        head_row: "",
                        head_cell: "py-1 text-[10px] font-semibold text-slate-500",
                        row: "",
                        cell: "p-0 text-center",
                        day: "p-0",
                        day_button:
                          "mx-auto inline-flex h-9 w-9 items-center justify-center rounded-xl text-[11px] font-semibold text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30",
                        day_selected: "bg-slate-900 text-white hover:bg-slate-900 focus:bg-slate-900",
                        day_today: "ring-1 ring-inset ring-slate-200",
                        day_outside: "text-slate-300 opacity-70",
                      }}
                    />
                  </div>
                ) : null}
              </div>

              <button
                type="button"
                onClick={() => handleWeekScroll("next")}
                className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-100"
                aria-label="Next week"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-7 gap-2 text-center">
            {calendarWeek.days.map((x) => (
              <div key={`${x.d}-${x.n}`} className="space-y-1">
                <div className="text-[10px] font-medium text-slate-500">{x.d}</div>
                <button
                  type="button"
                  onClick={() => setSelectedDateKey(x.key)}
                  className={`mx-auto flex h-8 w-8 items-center justify-center rounded-xl text-[11px] font-semibold transition-colors ${
                    selectedDateKey === x.key
                      ? "bg-slate-900 text-white"
                      : x.active
                        ? "bg-white text-slate-900 ring-1 ring-inset ring-slate-200"
                        : "bg-white text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {x.n}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 flex-1 overflow-auto">
          {selectedDayOrders.length === 0 ? (
            <div className="flex h-full items-center justify-center rounded-2xl bg-slate-50 p-4 text-center">
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  {selectedDateKey === todayKey ? "You can take a break today" : "No orders"}
                </div>
                <div className="mt-1 text-[11px] text-slate-500">
                  {selectedDateKey === todayKey
                    ? "There are no orders for today."
                    : `There are no orders for ${selectedDateKey}.`}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Stats Summary */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-100 bg-white p-3">
                  <div className="flex items-center gap-2">
                    <div className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <ShoppingCart className="h-3 w-3" />
                    </div>
                    <div className="text-[10px] text-slate-500">Orders</div>
                  </div>
                  <div className="mt-1 text-lg font-semibold text-slate-900">{selectedDateStats.totalOrders}</div>
                </div>
                <div className="rounded-xl border border-slate-100 bg-white p-3">
                  <div className="flex items-center gap-2">
                    <div className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                      <TrendingUp className="h-3 w-3" />
                    </div>
                    <div className="text-[10px] text-slate-500">Revenue</div>
                  </div>
                  <div className="mt-1 text-lg font-semibold text-slate-900">{formatRupiah(selectedDateStats.totalRevenue)}</div>
                </div>
              </div>
              
              {/* Order Status Breakdown */}
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <div className="text-[10px] font-medium text-slate-600 mb-2">Status Breakdown</div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center">
                    <div className="text-sm font-semibold text-emerald-600">{selectedDateStats.paidOrders}</div>
                    <div className="text-[9px] text-slate-500">Paid</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold text-amber-600">{selectedDateStats.pendingOrders}</div>
                    <div className="text-[9px] text-slate-500">Pending</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold text-rose-600">{selectedDateStats.failedOrders}</div>
                    <div className="text-[9px] text-slate-500">Failed</div>
                  </div>
                </div>
              </div>
              
              {/* Orders List */}
              <div className="space-y-2">
                <div className="text-[10px] font-medium text-slate-600">Recent Orders</div>
                {selectedDayOrders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-white p-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200">
                        <ShoppingCart className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] font-semibold text-slate-900 truncate">{order.customer}</div>
                        <div className="text-[9px] text-slate-500 truncate">{order.id}</div>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-[9px] font-semibold text-slate-700">{formatRupiah(order.total)}</div>
                      {order.status && (
                        <div className={`mt-0.5 inline-flex items-center rounded-full px-1.5 py-0.5 text-[8px] font-semibold ${
                          order.status === 'paid' ? 'bg-emerald-50 text-emerald-700' :
                          order.status === 'pending' ? 'bg-amber-50 text-amber-700' :
                          'bg-rose-50 text-rose-700'
                        }`}>
                          {order.status}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {selectedDayOrders.length > 5 && (
                  <div className="text-center text-[9px] text-slate-500">
                    +{selectedDayOrders.length - 5} more orders
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardCalendarCard;
