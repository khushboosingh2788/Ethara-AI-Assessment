import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import { DataShell } from "../components/DataShell";
import { Modal } from "../components/Modal";
import { api, apiError } from "../lib/api";
import { currency, shortDate } from "../lib/utils";
import type { Customer, Order, OrderStatus, Product } from "../types";

const statuses: OrderStatus[] = ["Pending", "Processing", "Completed", "Cancelled"];

export function Orders() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState<Order | null>(null);
  const [customerId, setCustomerId] = useState("");
  const [status, setStatus] = useState<OrderStatus>("Pending");
  const [items, setItems] = useState([{ product_id: "", quantity: 1 }]);
  const [nextStatus, setNextStatus] = useState<OrderStatus>("Pending");
  const { data: orders = [] } = useQuery({ queryKey: ["orders"], queryFn: async () => (await api.get<Order[]>("/orders")).data });
  const { data: customers = [] } = useQuery({ queryKey: ["customers"], queryFn: async () => (await api.get<Customer[]>("/customers")).data });
  const { data: products = [] } = useQuery({ queryKey: ["products"], queryFn: async () => (await api.get<Product[]>("/products")).data });
  const productMap = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);
  const total = items.reduce((sum, item) => sum + (productMap.get(Number(item.product_id))?.price || 0) * item.quantity, 0);

  const create = useMutation({
    mutationFn: async () => api.post("/orders", { customer_id: Number(customerId), status, items: items.map((item) => ({ product_id: Number(item.product_id), quantity: item.quantity })) }),
    onSuccess: () => { toast.success("Order created and stock reduced"); queryClient.invalidateQueries(); setOpen(false); },
    onError: (error) => toast.error(apiError(error))
  });
  const update = useMutation({
    mutationFn: async () => statusOpen && api.put(`/orders/${statusOpen.id}`, { status: nextStatus }),
    onSuccess: () => { toast.success("Order status updated"); queryClient.invalidateQueries({ queryKey: ["orders"] }); setStatusOpen(null); },
    onError: (error) => toast.error(apiError(error))
  });
  const remove = useMutation({ mutationFn: async (id: number) => api.delete(`/orders/${id}`), onSuccess: () => { toast.success("Order deleted"); queryClient.invalidateQueries({ queryKey: ["orders"] }); }, onError: (error) => toast.error(apiError(error)) });

  function submit(event: FormEvent) {
    event.preventDefault();
    create.mutate();
  }

  return (
    <DataShell title="Orders" subtitle="Create orders, auto-calculate totals, and reduce product stock when submitted." actionLabel="Create Order" onAction={() => setOpen(true)}>
      <div className="glass rounded-lg p-4">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="text-xs uppercase text-slate-500"><tr><th className="py-3">Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th><th></th></tr></thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-white/10">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/80 dark:hover:bg-white/5">
                  <td className="py-3 font-bold">#{order.id}</td><td>{order.customer.name}</td><td>{order.items.map((item) => `${item.product.name} x${item.quantity}`).join(", ")}</td><td>{currency(order.total_amount)}</td>
                  <td><span className="rounded-md bg-brand-indigo/10 px-2 py-1 text-xs font-bold text-brand-indigo">{order.status}</span></td><td>{shortDate(order.created_at)}</td>
                  <td className="text-right"><button className="btn-ghost mr-2 size-9 px-0" onClick={() => { setStatusOpen(order); setNextStatus(order.status); }} title="Update status"><Edit size={16} /></button><button className="btn-ghost size-9 px-0" onClick={() => remove.mutate(order.id)} title="Delete"><Trash2 size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Modal title="Create Order" open={open} onClose={() => setOpen(false)}>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label><span className="label">Customer</span><select required className="input mt-1" value={customerId} onChange={(e) => setCustomerId(e.target.value)}><option value="">Select customer</option>{customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}</select></label>
            <label><span className="label">Status</span><select className="input mt-1" value={status} onChange={(e) => setStatus(e.target.value as OrderStatus)}>{statuses.map((value) => <option key={value}>{value}</option>)}</select></label>
          </div>
          {items.map((item, index) => (
            <div key={index} className="grid gap-3 sm:grid-cols-[1fr_120px_90px]">
              <select required className="input" value={item.product_id} onChange={(e) => setItems(items.map((row, rowIndex) => rowIndex === index ? { ...row, product_id: e.target.value } : row))}><option value="">Select product</option>{products.map((product) => <option key={product.id} value={product.id}>{product.name} · {product.quantity} in stock</option>)}</select>
              <input required type="number" min="1" className="input" value={item.quantity} onChange={(e) => setItems(items.map((row, rowIndex) => rowIndex === index ? { ...row, quantity: Number(e.target.value) } : row))} />
              <button type="button" className="btn-ghost" onClick={() => setItems(items.filter((_, rowIndex) => rowIndex !== index))}>Remove</button>
            </div>
          ))}
          <div className="flex items-center justify-between"><button type="button" className="btn-ghost" onClick={() => setItems([...items, { product_id: "", quantity: 1 }])}>Add item</button><p className="text-lg font-extrabold">{currency(total)}</p></div>
          <button className="btn-primary w-full" disabled={create.isPending}>{create.isPending ? "Creating..." : "Place Order"}</button>
        </form>
      </Modal>
      <Modal title="Update Order Status" open={Boolean(statusOpen)} onClose={() => setStatusOpen(null)}>
        <div className="space-y-4"><select className="input" value={nextStatus} onChange={(e) => setNextStatus(e.target.value as OrderStatus)}>{statuses.map((value) => <option key={value}>{value}</option>)}</select><button className="btn-primary w-full" onClick={() => update.mutate()}>Save Status</button></div>
      </Modal>
    </DataShell>
  );
}
