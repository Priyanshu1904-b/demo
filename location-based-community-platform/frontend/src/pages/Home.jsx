import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../api/client";
import PostCard from "../components/PostCard";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadPosts(nextPage = 1, append = false) {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/posts", { params: { page: nextPage, search } });
      setPosts((current) => (append ? [...current, ...data.posts] : data.posts));
      setPage(data.page);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load posts");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPosts(1);
  }, []);

  return (
    <main className="container-page grid gap-5">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-950">Community Feed</h1>
          <p className="text-sm text-gray-600">Browse nearby reports, requests, and community updates.</p>
        </div>
        <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); loadPosts(1); }}>
          <input className="input" placeholder="Search posts" value={search} onChange={(e) => setSearch(e.target.value)} />
          <button className="btn-secondary" title="Search"><Search className="h-4 w-4" /></button>
        </form>
      </section>
      {error && <p className="rounded-md bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
      <section className="grid gap-4 md:grid-cols-2">
        {posts.map((post) => <PostCard key={post._id} post={post} />)}
      </section>
      {!loading && posts.length === 0 && <p className="panel text-sm text-gray-600">No posts yet.</p>}
      {page < totalPages && (
        <button className="btn-secondary mx-auto" onClick={() => loadPosts(page + 1, true)} disabled={loading}>
          {loading ? "Loading..." : "Load more"}
        </button>
      )}
    </main>
  );
}
