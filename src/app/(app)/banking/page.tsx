"use client";
import { useQuery } from "@tanstack/react-query";
import { bankingApi } from "@/lib/api";
import { Building2, TrendingUp, TrendingDown } from "lucide-react";
import { useState } from "react";

interface BankAccount {
  id: string;
  accountName: string;
  bankName: string;
  accountNumber: string;
  currentBalance: number;
  currency: string;
  isActive: boolean;
}

export default function BankingPage() {
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  const { data: accountsData, isLoading } = useQuery({
    queryKey: ["bank-accounts"],
    queryFn: () => bankingApi.accounts(),
  });

  const accounts: BankAccount[] = accountsData?.data?.value ?? accountsData?.data ?? [];

  const { data: txnData } = useQuery({
    queryKey: ["bank-transactions", selectedAccountId],
    queryFn: () => bankingApi.transactions(selectedAccountId!, { page: 1, pageSize: 50 }),
    enabled: !!selectedAccountId,
  });

  const transactions = txnData?.data?.items ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Banking</h1>
        <p className="text-gray-500 mt-1">Manage bank accounts and transactions</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      ) : (
        <>
          {/* Account Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {accounts.map((acct) => (
              <button
                key={acct.id}
                onClick={() => setSelectedAccountId(acct.id)}
                className={`text-left p-5 rounded-xl border-2 transition-all ${
                  selectedAccountId === acct.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-100 bg-white hover:border-gray-200"
                } shadow-sm`}
              >
                <div className="flex items-start justify-between">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${acct.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {acct.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="mt-3 font-semibold text-gray-900">{acct.accountName}</p>
                <p className="text-xs text-gray-500 mt-0.5">{acct.bankName} • {acct.accountNumber}</p>
                <p className="mt-3 text-xl font-bold text-gray-900">
                  {acct.currency} {acct.currentBalance.toLocaleString()}
                </p>
              </button>
            ))}
            {accounts.length === 0 && (
              <div className="col-span-3 p-10 text-center text-gray-400 bg-white rounded-xl border border-gray-100">
                No bank accounts configured
              </div>
            )}
          </div>

          {/* Transactions */}
          {selectedAccountId && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-base font-semibold text-gray-900">Recent Transactions</h2>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                    <th className="px-6 py-3 text-left">Date</th>
                    <th className="px-6 py-3 text-left">Description</th>
                    <th className="px-6 py-3 text-right">Amount</th>
                    <th className="px-6 py-3 text-left">Type</th>
                    <th className="px-6 py-3 text-left">Reconciled</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {transactions.map((t: { id: string; date: string; description: string; amount: number; type: string; isReconciled: boolean }) => (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-500">{new Date(t.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-gray-700">{t.description}</td>
                      <td className={`px-6 py-4 text-right font-medium ${t.type === "Credit" ? "text-green-600" : "text-red-500"}`}>
                        {t.type === "Credit" ? "+" : "-"} ${Math.abs(t.amount).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 flex items-center gap-1 text-gray-500">
                        {t.type === "Credit"
                          ? <TrendingUp className="h-4 w-4 text-green-500" />
                          : <TrendingDown className="h-4 w-4 text-red-500" />}
                        {t.type}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${t.isReconciled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                          {t.isReconciled ? "Reconciled" : "Pending"}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">No transactions</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
