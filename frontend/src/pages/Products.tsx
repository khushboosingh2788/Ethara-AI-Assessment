import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, Search, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import { DataShell } from "../components/DataShell";
import { Modal } from "../components/Modal";
import { api, apiError } from "../lib/api";
import { currency, shortDate } from "../lib/utils";
import type { Product } from "../types";

const empty = { name: "", sku: "", description: "", price: "", quantity: "", category: "General" };

function cleanPrice(value: string) {
  const normalized = value.replace(/[^\d.]/g, "");
  const [whole, ...decimalParts] = normalized.split(".");
  const decimals = decimalParts.join("").slice(0, 2);
  const cleanWhole = whole.replace(/^0+(?=\d)/, "");
  return decimalParts.length > 0 ? `${cleanWhole || "0"}.${decimals}` : cleanWhole;
}

function cleanQuantity(value: string) {
  return value.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
}

export function Products() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(empty);
  const { data = [] } = useQuery({ queryKey: ["products", search], queryFn: async () => (await api.get<Product[]>("/products", { params: { search } })).data });
  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        price: Number(form.price),
        quantity: Number(form.quantity)
      };
      return editing ? (await api.put(`/products/${editing.id}`, payload)).data : (await api.post("/products", payload)).data;
    },
    onSuccess: () => {
      toast.success(editing ? "Product updated" : "Product created");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setOpen(false);
    },
    onError: (error) => toast.error(apiError(error))
  });
  const remove = useMutation({
    mutationFn: async (id: number) => api.delete(`/products/${id}`),
    onSuccess: () => {
      toast.success("Product deleted");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error) => toast.error(apiError(error))
  });

  function startCreate() {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  }

  function startEdit(product: Product) {
    setEditing(product);
    setForm({
      name: product.name,
      sku: product.sku,
      description: product.description || "",
      price: String(product.price),
      quantity: String(product.quantity),
      category: product.category
    });
    setOpen(true);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    save.mutate();
  }

  return (
    <DataShell title="Products" subtitle="Manage SKUs, categories, pricing, and live inventory quantity." actionLabel="Create Product" onAction={startCreate}>
      <div className="glass rounded-lg p-4">
        <div className="relative mb-4 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input className="input pl-10" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, SKU, description" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr><th className="py-3">Product</th><th>SKU</th><th>Category</th><th>Price</th><th>Stock</th><th>Created</th><th></th></tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-white/10">
              {data.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50/80 dark:hover:bg-white/5">
                  <td className="py-3"><p className="font-bold">{product.name}</p><p className="text-xs text-slate-500">{product.description}</p></td>
                  <td>{product.sku}</td><td>{product.category}</td><td>{currency(product.price)}</td>
                  <td><span className={`rounded-md px-2 py-1 text-xs font-bold ${product.quantity <= 10 ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>{product.quantity}</span></td>
                  <td>{shortDate(product.created_at)}</td>
                  <td className="text-right"><button className="btn-ghost mr-2 size-9 px-0" onClick={() => startEdit(product)} title="Edit"><Edit size={16} /></button><button className="btn-ghost size-9 px-0" onClick={() => remove.mutate(product.id)} title="Delete"><Trash2 size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Modal title={editing ? "Edit Product" : "Create Product"} open={open} onClose={() => setOpen(false)}>
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <label><span className="label">Name</span><input required className="input mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
          <label><span className="label">SKU</span><input required className="input mt-1" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></label>
          <label><span className="label">Price</span><input required inputMode="decimal" pattern="^(?!0(?:\.0{1,2})?$)\d+(\.\d{1,2})?$" className="input mt-1" value={form.price} onChange={(e) => setForm({ ...form, price: cleanPrice(e.target.value) })} placeholder="0.00" /></label>
          <label><span className="label">Quantity</span><input required inputMode="numeric" pattern="\d+" className="input mt-1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: cleanQuantity(e.target.value) })} placeholder="0" /></label>
          <label><span className="label">Category</span><input required className="input mt-1" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></label>
          <label className="sm:col-span-2"><span className="label">Description</span><textarea className="input mt-1 min-h-24" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
          <button className="btn-primary sm:col-span-2" disabled={save.isPending}>{save.isPending ? "Saving..." : "Save Product"}</button>
        </form>
      </Modal>
    </DataShell>
  );
}
