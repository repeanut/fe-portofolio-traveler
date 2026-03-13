import React from "react";
import ReactApexChart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { Users, DollarSign, Activity } from "lucide-react";

interface DashboardGrowthCardProps {
  growthPeriod: "month" | "year";
  onChangeGrowthPeriod: (v: "month" | "year") => void;
  chartOptions: ApexOptions;
  chartSeries: { name: string; type: "column" | "line"; data: number[] }[];
  monthlyIncome: MonthlyIncomeSummary;
  avgIncome: number;
  formatRupiah: (amount: number) => string;
}

interface MonthlyIncomeSummary {
  bestAmount: number;
  bestLabel: string;
  amounts: number[];
  categories: string[];
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
  // Calculate growth metrics
  const currentPeriodIncome = monthlyIncome.amounts[monthlyIncome.amounts.length - 1] || 0;
  const previousPeriodIncome = monthlyIncome.amounts[monthlyIncome.amounts.length - 2] || 0;
  const growthRate = previousPeriodIncome > 0 ? ((currentPeriodIncome - previousPeriodIncome) / previousPeriodIncome * 100) : 0;
  
  const totalGrowth = monthlyIncome.amounts.reduce((acc: number, amount: number, index: number) => {
    if (index === 0) return 0;
    const prevAmount = monthlyIncome.amounts[index - 1];
    return acc + (prevAmount > 0 ? ((amount - prevAmount) / prevAmount * 100) : 0);
  }, 0) / Math.max(1, monthlyIncome.amounts.length - 1);

  const MetricCard = ({ 
    icon: Icon, 
    label, 
    value, 
    change, 
    changeType 
  }: { 
    icon: React.ElementType;
    label: string;
    value: string | number;
    change?: number;
    changeType?: 'positive' | 'negative' | 'neutral';
  }) => (
    <div className="rounded-xl border border-slate-100 bg-white p-3 min-w-0">
      <div className="flex items-center gap-2">
        <div className={`inline-flex h-6 w-6 items-center justify-center rounded-lg ${
          label === 'Best Income' ? 'bg-emerald-50 text-emerald-600' :
          label === 'Avg/Day' ? 'bg-blue-50 text-blue-600' :
          label === 'Growth Rate' ? 'bg-purple-50 text-purple-600' :
          'bg-slate-50 text-slate-600'
        }`}>
          <Icon className="h-3 w-3" />
        </div>
        <div className="text-[10px] text-slate-500">{label}</div>
      </div>
      <div className="mt-1 font-semibold text-slate-900 truncate">{value}</div>
      {change !== undefined && (
        <div className={`mt-1 text-[9px] font-medium ${
          changeType === 'positive' ? 'text-emerald-600' :
          changeType === 'negative' ? 'text-rose-600' :
          'text-slate-500'
        }`}>
          {changeType === 'positive' ? '+' : changeType === 'negative' ? '-' : ''}{change.toFixed(1)}%
        </div>
      )}
    </div>
  );
  return (
    <div className="flex h-full min-w-0 flex-col">
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm h-full min-w-0 max-w-full overflow-hidden">
        <div className="flex min-w-0 items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-900 truncate">Profile Growth</h3>
            <p className="mt-0.5 text-[11px] text-slate-500">Overall information</p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
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

        <div className="relative mt-4 w-full max-w-full overflow-x-auto overflow-y-hidden rounded-2xl bg-indigo-50/60 px-3 py-3">
          <div className="min-w-[520px] md:min-w-0">
            <ReactApexChart type="line" height={192} options={chartOptions} series={chartSeries} />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-[11px] min-w-0">
          <MetricCard
            icon={DollarSign}
            label="Best Income"
            value={formatRupiah(monthlyIncome.bestAmount)}
            change={growthRate}
            changeType={growthRate >= 0 ? 'positive' : 'negative'}
          />
          <MetricCard
            icon={Activity}
            label="Avg/Day"
            value={formatRupiah(avgIncome)}
            change={totalGrowth}
            changeType={totalGrowth >= 0 ? 'positive' : 'negative'}
          />
        </div>
        
        {/* Additional Profile Growth Metrics */}
        <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-3">
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-4 w-4 text-slate-600" />
            <div className="text-[10px] font-medium text-slate-600">Profile Growth Metrics</div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
              <div className="text-sm font-semibold text-slate-900">{growthPeriod === 'year' ? '6' : '24'}</div>
              <div className="text-[9px] text-slate-500">{growthPeriod === 'year' ? 'Years' : 'Months'}</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-semibold text-emerald-600">{growthRate.toFixed(1)}%</div>
              <div className="text-[9px] text-slate-500">Growth</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-semibold text-blue-600">{monthlyIncome.bestLabel}</div>
              <div className="text-[9px] text-slate-500">Best Period</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardGrowthCard;
