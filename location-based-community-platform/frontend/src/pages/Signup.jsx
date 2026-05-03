import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [step, setStep] = useState("register");
  const [contact, setContact] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", otp: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function register(event) {
    event.preventDefault();
    setError("");
    try {
      await api.post("/auth/register", form);
      setContact(form.email || form.phone);
      setMessage("Registration created. In development, check backend logs for the OTP.");
      setStep("otp");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    }
  }

  async function verify(event) {
    event.preventDefault();
    setError("");
    try {
      const payload = form.email ? { email: form.email, otp: form.otp } : { phone: form.phone, otp: form.otp };
      const { data } = await api.post("/auth/verify-otp", payload);
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      setUser(data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "OTP verification failed");
    }
  }

  return (
    <main className="container-page max-w-md">
      <form className="panel grid gap-3" onSubmit={step === "register" ? register : verify}>
        <h1 className="text-xl font-semibold">Signup</h1>
        {message && <p className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>}
        {error && <p className="rounded-md bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
        {step === "register" ? (
          <>
            <input className="input" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className="input" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input className="input" placeholder="Phone optional" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <input className="input" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <button className="btn-primary">Register</button>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-600">Enter the OTP sent to {contact}.</p>
            <input className="input" placeholder="6-digit OTP" value={form.otp} onChange={(e) => setForm({ ...form, otp: e.target.value })} />
            <button className="btn-primary">Verify Account</button>
          </>
        )}
      </form>
    </main>
  );
}
