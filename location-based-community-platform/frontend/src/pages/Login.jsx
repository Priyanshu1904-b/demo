import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(form.identifier, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container-page max-w-md">
      <form className="panel grid gap-3" onSubmit={submit}>
        <h1 className="text-xl font-semibold">Login</h1>
        {error && <p className="rounded-md bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
        <input className="input" placeholder="Email or phone" value={form.identifier} onChange={(e) => setForm({ ...form, identifier: e.target.value })} />
        <input className="input" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button className="btn-primary" disabled={loading}>{loading ? "Signing in..." : "Login"}</button>
        <Link className="text-sm text-emerald-800" to="/signup">Create an account</Link>
      </form>
    </main>
  );
}
