import { NavLink, Outlet } from "react-router-dom";
import { Bell, Boxes, LayoutDashboard, Moon, Search, ShoppingCart, Sun, Users, Warehouse } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/products", label: "Products", icon: Boxes },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/orders", label: "Orders", icon: ShoppingCart }
];

export function Layout() {
  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-100">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-slate-200/70 bg-white/72 p-4 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/70 lg:block">
        <div className="flex h-14 items-center gap-3 px-2">
          <div className="grid size-10 place-items-center rounded-md bg-gradient-to-br from-brand-indigo to-brand-cyan text-white shadow-glow">
            <Warehouse size={21} />
          </div>
          <div>
            <p className="text-base font-extrabold">Ethara</p>
            <p className="text-xs font-medium text-slate-500">Inventory Command</p>
          </div>
        </div>
        <nav className="mt-8 space-y-1">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition ${
                  isActive
                    ? "bg-slate-950 text-white shadow-sm dark:bg-white dark:text-slate-950"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/70 px-4 py-3 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/72 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input className="input pl-10" placeholder="Search products, customers, SKUs, orders..." />
            </div>
            <button className="btn-ghost size-10 px-0" title="Notifications">
              <Bell size={18} />
            </button>
            <button className="btn-ghost size-10 px-0" onClick={() => setDark((value) => !value)} title="Toggle theme">
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="hidden items-center gap-3 rounded-md border border-slate-200 bg-white/70 px-3 py-2 dark:border-white/10 dark:bg-white/5 sm:flex">
              <div className="grid size-8 place-items-center rounded-md bg-gradient-to-br from-brand-violet to-brand-emerald text-xs font-bold text-white">EA</div>
              <div>
                <p className="text-sm font-bold leading-none">Ops Admin</p>
                <p className="mt-1 text-xs text-slate-500">Enterprise</p>
              </div>
            </div>
          </div>
          <nav className="mt-3 flex gap-2 overflow-x-auto lg:hidden">
            {nav.map((item) => (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => `btn-ghost shrink-0 ${isActive ? "border-brand-indigo text-brand-indigo" : ""}`}>
                <item.icon size={16} />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </header>
        <motion.main className="mx-auto max-w-7xl px-4 py-6 lg:px-8" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
}
