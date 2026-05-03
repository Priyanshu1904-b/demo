import { Link, NavLink } from "react-router-dom";
import { LogOut, MapPin, Shield, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const linkClass = ({ isActive }) =>
    `rounded-md px-3 py-2 text-sm font-medium ${isActive ? "bg-emerald-100 text-emerald-900" : "text-gray-700 hover:bg-gray-100"}`;

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-base font-semibold text-gray-950">
          <MapPin className="h-5 w-5 text-emerald-700" />
          Location Community
        </Link>
        <nav className="flex flex-wrap items-center gap-1">
          <NavLink className={linkClass} to="/">Home</NavLink>
          {user && <NavLink className={linkClass} to="/dashboard"><User className="h-4 w-4" /> Dashboard</NavLink>}
          {["admin", "super-admin"].includes(user?.role) && (
            <NavLink className={linkClass} to="/admin"><Shield className="h-4 w-4" /> Admin</NavLink>
          )}
          {!user ? (
            <>
              <NavLink className={linkClass} to="/login">Login</NavLink>
              <NavLink className={linkClass} to="/signup">Signup</NavLink>
            </>
          ) : (
            <button className="btn-secondary" onClick={logout} title="Logout">
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
