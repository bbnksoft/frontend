"use client";
import { useQuery } from "@tanstack/react-query";
import { customersApi } from "@/lib/api";
import { useState } from "react";
import { Plus, Search } from "lucide-react";

interface Customer {
  id: string;
  displayName: string;
  email: string;
  phone: string;
  outstandingBalance: number;
  creditLimit: number;
}

export default function CustomersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["customers", page, search],
    queryFn: () => customersApi.list({ page, pageSize: 20, search }),
  });

  const customers: Customer[] = data?.data?.items ?? [];
  const total: number = data?.data?.total ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-500 mt-1">{total} customers</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus className="h-4 w-4" /> New Customer
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search customers..."
          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Email</th>
                <th className="px-6 py-3 text-left">Phone</th>
                <th className="px-6 py-3 text-right">Outstanding</th>
                <th className="px-6 py-3 text-right">Credit Limit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{c.displayName}</td>
                  <td className="px-6 py-4 text-gray-500">{c.email}</td>
                  <td className="px-6 py-4 text-gray-500">{c.phone}</td>
                  <td className="px-6 py-4 text-right text-orange-600 font-medium">
                    ${c.outstandingBalance?.toLocaleString() ?? 0}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-600">
                    ${c.creditLimit?.toLocaleString() ?? 0}
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-16 text-center text-gray-400">No customers found</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
