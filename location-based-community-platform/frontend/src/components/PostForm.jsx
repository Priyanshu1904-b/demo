import { useState } from "react";
import { api } from "../api/client";

const empty = { title: "", description: "", lat: "", lng: "", address: "", image: null };

export default function PostForm({ onCreated }) {
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value !== null && value !== "") payload.append(key, value);
      });
      const { data } = await api.post("/posts", payload);
      setForm(empty);
      onCreated(data.post);
    } catch (err) {
      setError(err.response?.data?.message || "Could not create post");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="panel grid gap-3" onSubmit={submit}>
      <h2 className="text-lg font-semibold">Create Post</h2>
      {error && <p className="rounded-md bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
      <input className="input" placeholder="Title" value={form.title} onChange={(e) => update("title", e.target.value)} />
      <textarea className="input min-h-28" placeholder="Description" value={form.description} onChange={(e) => update("description", e.target.value)} />
      <div className="grid gap-3 sm:grid-cols-2">
        <input className="input" placeholder="Latitude" value={form.lat} onChange={(e) => update("lat", e.target.value)} />
        <input className="input" placeholder="Longitude" value={form.lng} onChange={(e) => update("lng", e.target.value)} />
      </div>
      <input className="input" placeholder="Address" value={form.address} onChange={(e) => update("address", e.target.value)} />
      <input className="input" type="file" accept="image/*" onChange={(e) => update("image", e.target.files?.[0] || null)} />
      <button className="btn-primary" disabled={loading}>{loading ? "Posting..." : "Publish"}</button>
    </form>
  );
}
