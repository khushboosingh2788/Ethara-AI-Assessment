import { useQuery } from "@tanstack/react-query";
import { Boxes, CircleDollarSign, ShoppingCart, Users } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { MetricCard } from "../components/MetricCard";
import { api } from "../lib/api";
import { currency, shortDate } from "../lib/utils";
import type { DashboardStats } from "../types";

const colors = ["#6366F1", "#06B6D4", "#10B981", "#8B5CF6"];

export function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => (await api.get<DashboardStats>("/dashboard/stats")).data
  });

  if (isLoading || !data) {
    return <div className="grid gap-4 md:grid-cols-4">{Array.from({ length: 8 }).map((_, index) => <div key={index} className="glass h-36 animate-pulse rounded-lg" />)}</div>;
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="label">Live command center</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-normal">Inventory & Order Intelligence</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">Track product velocity, customer demand, low-stock risk, and revenue momentum from one responsive operating surface.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Products" value={String(data.total_products)} hint="Active catalog items" icon={Boxes} />
        <MetricCard label="Customers" value={String(data.total_customers)} hint="Registered buyers" icon={Users} />
        <MetricCard label="Orders" value={String(data.total_orders)} hint="Lifecycle tracked" icon={ShoppingCart} />
        <MetricCard label="Revenue" value={currency(data.revenue)} hint="Auto-calculated totals" icon={CircleDollarSign} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <div className="glass rounded-lg p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="label">Revenue</p>
              <h2 className="mt-2 text-xl font-extrabold">Order Value Trend</h2>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer>
              <LineChart data={data.revenue_series}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b833" />
                <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 12 }} />
                <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
                <Tooltip formatter={(value) => currency(Number(value))} contentStyle={{ borderRadius: 8 }} />
                <Line type="monotone" dataKey="revenue" stroke="#6366F1" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-lg p-5">
          <p className="label">Mix</p>
          <h2 className="mt-2 text-xl font-extrabold">Order Status</h2>
          <div className="h-80">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={data.order_status_breakdown} dataKey="value" nameKey="name" innerRadius={68} outerRadius={105} paddingAngle={5}>
                  {data.order_status_breakdown.map((_, index) => <Cell key={index} fill={colors[index % colors.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="glass rounded-lg p-5 xl:col-span-2">
          <p className="label">Categories</p>
          <h2 className="mt-2 text-xl font-extrabold">Catalog Distribution</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer>
              <BarChart data={data.category_breakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b833" />
                <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 12 }} />
                <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="glass rounded-lg p-5">
          <p className="label">Activity</p>
          <h2 className="mt-2 text-xl font-extrabold">Recent Orders</h2>
          <div className="mt-5 space-y-4">
            {data.recent_orders.map((order) => (
              <div key={order.id} className="flex gap-3">
                <div className="mt-1 size-2 rounded-full bg-brand-cyan shadow-glow" />
                <div>
                  <p className="text-sm font-bold">Order #{order.id} · {order.customer.name}</p>
                  <p className="text-xs text-slate-500">{currency(order.total_amount)} · {order.status} · {shortDate(order.created_at)}</p>
                </div>
              </div>
            ))}
            {!data.recent_orders.length && <p className="text-sm text-slate-500">No orders yet.</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
