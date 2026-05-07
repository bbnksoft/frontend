"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { reportsApi } from "@/lib/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type ReportTab = "profitLoss" | "balanceSheet" | "cashFlow" | "aging";

export default function ReportsPage() {
  const [tab, setTab] = useState<ReportTab>("profitLoss");
  const now = new Date();
  const fromDate = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const toDate = now.toISOString().split("T")[0];

  const plQuery = useQuery({
    queryKey: ["report-pl", fromDate, toDate],
    queryFn: () => reportsApi.profitLoss(fromDate, toDate),
    enabled: tab === "profitLoss",
  });

  const bsQuery = useQuery({
    queryKey: ["report-bs", toDate],
    queryFn: () => reportsApi.balanceSheet(toDate),
    enabled: tab === "balanceSheet",
  });

  const cfQuery = useQuery({
    queryKey: ["report-cf", fromDate, toDate],
    queryFn: () => reportsApi.cashFlow(fromDate, toDate),
    enabled: tab === "cashFlow",
  });

  const agingQuery = useQuery({
    queryKey: ["report-aging"],
    queryFn: () => reportsApi.aging("Receivable"),
    enabled: tab === "aging",
  });

  const tabs: { key: ReportTab; label: string }[] = [
    { key: "profitLoss", label: "Profit & Loss" },
    { key: "balanceSheet", label: "Balance Sheet" },
    { key: "cashFlow", label: "Cash Flow" },
    { key: "aging", label: "Aging Report" },
  ];

  const plData = plQuery.data?.data?.data;
  const bsData = bsQuery.data?.data?.data;
  const cfData = cfQuery.data?.data?.data;
  const agingData = agingQuery.data?.data?.data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-500 mt-1">Financial reports and analytics</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* P&L */}
      {tab === "profitLoss" && (
        <div className="space-y-4">
          {plQuery.isLoading ? (
            <Spinner />
          ) : plData ? (
            <>
              <div className="grid grid-cols-3 gap-4">
                <SummaryCard
                  label="Total Revenue"
                  value={plData.totalRevenue}
                  color="green"
                />
                <SummaryCard
                  label="Total Expenses"
                  value={plData.totalExpenses}
                  color="red"
                />
                <SummaryCard
                  label="Net Profit"
                  value={plData.netProfit}
                  color={plData.netProfit >= 0 ? "green" : "red"}
                />
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Revenue vs Expenses by Category
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={plData.categoryBreakdown ?? []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
                    <Bar dataKey="expenses" fill="#f59e0b" name="Expenses" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <EmptyState />
          )}
        </div>
      )}

      {/* Balance Sheet */}
      {tab === "balanceSheet" && (
        <div>
          {bsQuery.isLoading ? (
            <Spinner />
          ) : bsData ? (
            <div className="grid grid-cols-2 gap-6">
              <Section title="Assets" items={bsData.assets ?? []} />
              <div className="space-y-4">
                <Section title="Liabilities" items={bsData.liabilities ?? []} />
                <Section title="Equity" items={bsData.equity ?? []} />
              </div>
            </div>
          ) : (
            <EmptyState />
          )}
        </div>
      )}

      {/* Cash Flow */}
      {tab === "cashFlow" && (
        <div>
          {cfQuery.isLoading ? (
            <Spinner />
          ) : cfData ? (
            <div className="grid grid-cols-3 gap-4">
              <SummaryCard
                label="Operating"
                value={cfData.operatingActivities}
                color="blue"
              />
              <SummaryCard
                label="Investing"
                value={cfData.investingActivities}
                color="purple"
              />
              <SummaryCard
                label="Financing"
                value={cfData.financingActivities}
                color="orange"
              />
            </div>
          ) : (
            <EmptyState />
          )}
        </div>
      )}

      {/* Aging */}
      {tab === "aging" && (
        <div>
          {agingQuery.isLoading ? (
            <Spinner />
          ) : agingData ? (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                    <th className="px-6 py-3 text-left">Customer</th>
                    <th className="px-6 py-3 text-right">Current</th>
                    <th className="px-6 py-3 text-right">1-30 Days</th>
                    <th className="px-6 py-3 text-right">31-60 Days</th>
                    <th className="px-6 py-3 text-right">61-90 Days</th>
                    <th className="px-6 py-3 text-right">90+ Days</th>
                    <th className="px-6 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(agingData.rows ?? []).map(
                    (r: {
                      customerName: string;
                      current: number;
                      days1_30: number;
                      days31_60: number;
                      days61_90: number;
                      over90: number;
                      total: number;
                    }) => (
                      <tr key={r.customerName} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium">
                          {r.customerName}
                        </td>
                        <td className="px-6 py-4 text-right">
                          ${r.current?.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          ${r.days1_30?.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          ${r.days31_60?.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          ${r.days61_90?.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right text-red-500">
                          ${r.over90?.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right font-semibold">
                          ${r.total?.toLocaleString()}
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState />
          )}
        </div>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="p-16 text-center text-gray-400 bg-white rounded-xl border border-gray-100">
      No report data available for the selected period
    </div>
  );
}

function SummaryCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    green: "text-green-600",
    red: "text-red-500",
    blue: "text-blue-600",
    purple: "text-purple-600",
    orange: "text-orange-600",
  };
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <p className="text-sm text-gray-500">{label}</p>
      <p
        className={`text-2xl font-bold mt-1 ${colorMap[color] ?? "text-gray-900"}`}
      >
        ${value?.toLocaleString() ?? 0}
      </p>
    </div>
  );
}

function Section({
  title,
  items,
}: {
  title: string;
  items: { name: string; balance: number }[];
}) {
  const total = items.reduce((s, i) => s + (i.balance ?? 0), 0);
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="px-6 py-3 bg-gray-50 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>
      <table className="w-full text-sm">
        <tbody className="divide-y divide-gray-50">
          {items.map((item) => (
            <tr key={item.name} className="hover:bg-gray-50">
              <td className="px-6 py-3 text-gray-700">{item.name}</td>
              <td className="px-6 py-3 text-right font-medium">
                ${item.balance?.toLocaleString()}
              </td>
            </tr>
          ))}
          <tr className="bg-gray-50 font-semibold">
            <td className="px-6 py-3">Total {title}</td>
            <td className="px-6 py-3 text-right">${total.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
