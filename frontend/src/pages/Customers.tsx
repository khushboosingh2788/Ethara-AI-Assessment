import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import { DataShell } from "../components/DataShell";
import { Modal } from "../components/Modal";
import { api, apiError } from "../lib/api";
import { shortDate } from "../lib/utils";
import type { Customer } from "../types";

const empty = { name: "", email: "", phone: "", address: "" };

export function Customers() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState(empty);
  const { data = [] } = useQuery({ queryKey: ["customers"], queryFn: async () => (await api.get<Customer[]>("/customers")).data });
  const save = useMutation({
    mutationFn: async () => editing ? (await api.put(`/customers/${editing.id}`, form)).data : (await api.post("/customers", form)).data,
    onSuccess: () => { toast.success(editing ? "Customer updated" : "Customer created"); queryClient.invalidateQueries({ queryKey: ["customers"] }); setOpen(false); },
    onError: (error) => toast.error(apiError(error))
  });
  const remove = useMutation({ mutationFn: async (id: number) => api.delete(`/customers/${id}`), onSuccess: () => { toast.success("Customer deleted"); queryClient.invalidateQueries({ queryKey: ["customers"] }); }, onError: (error) => toast.error(apiError(error)) });

  function submit(event: FormEvent) { event.preventDefault(); save.mutate(); }
  function create() { setEditing(null); setForm(empty); setOpen(true); }
  function edit(customer: Customer) { setEditing(customer); setForm({ name: customer.name, email: customer.email, phone: customer.phone || "", address: customer.address || "" }); setOpen(true); }

  return (
    <DataShell title="Customers" subtitle="Maintain customer profiles with unique email validation and registration history." actionLabel="Create Customer" onAction={create}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.map((customer) => (
          <article key={customer.id} className="glass rounded-lg p-5">
            <div className="flex items-start justify-between gap-3">
              <div><p className="text-lg font-extrabold">{customer.name}</p><p className="text-sm text-brand-indigo">{customer.email}</p></div>
              <div className="flex gap-2"><button className="btn-ghost size-9 px-0" onClick={() => edit(customer)} title="Edit"><Edit size={16} /></button><button className="btn-ghost size-9 px-0" onClick={() => remove.mutate(customer.id)} title="Delete"><Trash2 size={16} /></button></div>
            </div>
            <div className="mt-5 space-y-2 text-sm text-slate-500 dark:text-slate-400"><p>{customer.phone || "No phone"}</p><p>{customer.address || "No address"}</p><p>Registered {shortDate(customer.created_at)}</p></div>
          </article>
        ))}
      </div>
      <Modal title={editing ? "Edit Customer" : "Create Customer"} open={open} onClose={() => setOpen(false)}>
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <label><span className="label">Full Name</span><input required className="input mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
          <label><span className="label">Email</span><input required type="email" className="input mt-1" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
          <label><span className="label">Phone</span><input className="input mt-1" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
          <label className="sm:col-span-2"><span className="label">Address</span><textarea className="input mt-1 min-h-24" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></label>
          <button className="btn-primary sm:col-span-2" disabled={save.isPending}>{save.isPending ? "Saving..." : "Save Customer"}</button>
        </form>
      </Modal>
    </DataShell>
  );
}
