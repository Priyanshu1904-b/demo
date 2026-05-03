import { useEffect, useState } from "react";
import { api } from "../api/client";
import PostCard from "../components/PostCard";
import PostForm from "../components/PostForm";
import { useAuth } from "../context/AuthContext";

export default function UserDashboard() {
  const { user, setUser } = useAuth();
  const [posts, setPosts] = useState([]);
  const [profile, setProfile] = useState({ name: user?.name || "", phone: user?.phone || "" });
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");

  async function loadMine() {
    const { data } = await api.get("/posts/mine");
    setPosts(data.posts);
  }

  useEffect(() => {
    loadMine().catch((err) => setError(err.response?.data?.message || "Could not load dashboard"));
  }, []);

  async function updateProfile(event) {
    event.preventDefault();
    const { data } = await api.patch("/users/me", profile);
    setUser(data.user);
  }

  async function deletePost(id) {
    await api.delete(`/posts/${id}`);
    setPosts((current) => current.filter((post) => post._id !== id));
  }

  async function updatePost(event) {
    event.preventDefault();
    const { data } = await api.patch(`/posts/${editing._id}`, {
      title: editing.title,
      description: editing.description,
      lat: editing.location.lat,
      lng: editing.location.lng,
      address: editing.location.address
    });
    setPosts((current) => current.map((post) => (post._id === data.post._id ? data.post : post)));
    setEditing(null);
  }

  return (
    <main className="container-page grid gap-5 lg:grid-cols-[360px_1fr]">
      <section className="grid content-start gap-4">
        <form className="panel grid gap-3" onSubmit={updateProfile}>
          <h1 className="text-xl font-semibold">Profile</h1>
          <input className="input" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
          <input className="input" placeholder="Phone" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
          <button className="btn-primary">Save Profile</button>
        </form>
        <PostForm onCreated={(post) => setPosts((current) => [post, ...current])} />
      </section>
      <section className="grid content-start gap-4">
        <h2 className="text-xl font-semibold">Your Posts</h2>
        {error && <p className="rounded-md bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
        {editing && (
          <form className="panel grid gap-3" onSubmit={updatePost}>
            <h3 className="text-lg font-semibold">Edit Post</h3>
            <input className="input" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
            <textarea className="input min-h-28" value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
            <div className="grid gap-3 sm:grid-cols-2">
              <input className="input" value={editing.location.lat} onChange={(e) => setEditing({ ...editing, location: { ...editing.location, lat: e.target.value } })} />
              <input className="input" value={editing.location.lng} onChange={(e) => setEditing({ ...editing, location: { ...editing.location, lng: e.target.value } })} />
            </div>
            <input className="input" value={editing.location.address || ""} onChange={(e) => setEditing({ ...editing, location: { ...editing.location, address: e.target.value } })} />
            <div className="flex gap-2">
              <button className="btn-primary">Save</button>
              <button className="btn-secondary" type="button" onClick={() => setEditing(null)}>Cancel</button>
            </div>
          </form>
        )}
        {posts.map((post) => <PostCard key={post._id} post={post} canDelete canEdit onEdit={setEditing} onDelete={deletePost} />)}
        {posts.length === 0 && <p className="panel text-sm text-gray-600">You have not posted yet.</p>}
      </section>
    </main>
  );
}
