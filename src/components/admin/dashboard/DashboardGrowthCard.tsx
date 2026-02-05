import React from "react";
import ReactApexChart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";

interface MonthlyIncomeSummary {
  bestAmount: number;
  bestLabel: string;
}

interface DashboardGrowthCardProps {
  growthPeriod: "month" | "year";
  onChangeGrowthPeriod: (v: "month" | "year") => void;
  chartOptions: ApexOptions;
  chartSeries: { name: string; type: "column" | "line"; data: number[] }[];
  monthlyIncome: MonthlyIncomeSummary;
  avgIncome: number;
  formatRupiah: (amount: number) => string;
}

const DashboardGrowthCard: React.FC<DashboardGrowthCardProps> = ({
  growthPeriod,
  onChangeGrowthPeriod,
  chartOptions,
  chartSeries,
  monthlyIncome,
  avgIncome,
  formatRupiah,
}) => {
  return (
    <div className="flex h-full flex-col">
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm h-full">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-900 truncate">Profile Growth</h3>
            <p className="mt-0.5 text-[11px] text-slate-500">Overall information</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex items-center rounded-full bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => onChangeGrowthPeriod("month")}
                className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-colors ${
                  growthPeriod === "month" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Month
              </button>
              <button
                type="button"
                onClick={() => onChangeGrowthPeriod("year")}
                className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-colors ${
                  growthPeriod === "year" ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Year
              </button>
            </div>
          </div>
        </div>

        <div className="relative mt-4 overflow-hidden rounded-2xl bg-indigo-50/60 px-3 py-3">
          <ReactApexChart type="line" height={192} options={chartOptions} series={chartSeries} />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-[11px]">
          <div className="rounded-xl border border-slate-100 bg-white p-3">
            <div className="text-slate-500">Best income</div>
            <div className="mt-1 font-semibold text-slate-900">{formatRupiah(monthlyIncome.bestAmount)}</div>
            <div className="mt-0.5 text-[10px] text-slate-500">{monthlyIncome.bestLabel}</div>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white p-3">
            <div className="text-slate-500">Avg/day</div>
            <div className="mt-1 font-semibold text-slate-900">{formatRupiah(avgIncome)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardGrowthCard;
