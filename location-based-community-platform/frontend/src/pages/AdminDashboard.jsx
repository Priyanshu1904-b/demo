import { useEffect, useState } from "react";
import { ShieldPlus, Trash2 } from "lucide-react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import PostCard from "../components/PostCard";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [adminForm, setAdminForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  async function load() {
    const [usersRes, postsRes] = await Promise.all([
      api.get("/admin/users"),
      api.get("/admin/posts")
    ]);
    setUsers(usersRes.data.users);
    setPosts(postsRes.data.posts);
  }

  useEffect(() => {
    load().catch((err) => setError(err.response?.data?.message || "Could not load admin data"));
  }, []);

  async function setVerified(id, verified) {
    const { data } = await api.patch(`/admin/users/${id}/verify`, { verified });
    setUsers((current) => current.map((item) => (item._id === id ? data.user : item)));
  }

  async function deleteUser(id) {
    await api.delete(`/admin/users/${id}`);
    setUsers((current) => current.filter((item) => item._id !== id));
  }

  async function changeRole(id, role) {
    const { data } = await api.patch(`/super-admin/users/${id}/role`, { role });
    setUsers((current) => current.map((item) => (item._id === id ? data.user : item)));
  }

  async function createAdmin(event) {
    event.preventDefault();
    const { data } = await api.post("/super-admin/admins", adminForm);
    setUsers((current) => [data.admin, ...current]);
    setAdminForm({ name: "", email: "", password: "" });
  }

  async function deletePost(id) {
    await api.delete(`/admin/posts/${id}`);
    setPosts((current) => current.filter((post) => post._id !== id));
  }

  return (
    <main className="container-page grid gap-5">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      {error && <p className="rounded-md bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
      {user?.role === "super-admin" && (
        <form className="panel grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]" onSubmit={createAdmin}>
          <input className="input" placeholder="Admin name" value={adminForm.name} onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })} />
          <input className="input" placeholder="Admin email" value={adminForm.email} onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })} />
          <input className="input" type="password" placeholder="Password" value={adminForm.password} onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })} />
          <button className="btn-primary" title="Create admin"><ShieldPlus className="h-4 w-4" /></button>
        </form>
      )}
      <section className="panel overflow-x-auto">
        <h2 className="mb-3 text-lg font-semibold">Users</h2>
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b text-gray-500">
            <tr><th className="py-2">Name</th><th>Email</th><th>Role</th><th>Verified</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {users.map((item) => (
              <tr className="border-b last:border-0" key={item._id}>
                <td className="py-2">{item.name}</td>
                <td>{item.email || item.phone}</td>
                <td>{item.role}</td>
                <td>{item.verified ? "Yes" : "No"}</td>
                <td className="flex flex-wrap gap-2 py-2">
                  <button className="btn-secondary" onClick={() => setVerified(item._id, !item.verified)}>{item.verified ? "Unverify" : "Verify"}</button>
                  {user?.role === "super-admin" && item.role !== "super-admin" && (
                    <button className="btn-secondary" onClick={() => changeRole(item._id, item.role === "admin" ? "user" : "admin")}>
                      {item.role === "admin" ? "Demote" : "Promote"}
                    </button>
                  )}
                  {item.role !== "super-admin" && <button className="btn-danger" onClick={() => deleteUser(item._id)} title="Delete user"><Trash2 className="h-4 w-4" /></button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section className="grid gap-4 md:grid-cols-2">
        {posts.map((post) => <PostCard key={post._id} post={post} canDelete onDelete={deletePost} />)}
      </section>
    </main>
  );
}
