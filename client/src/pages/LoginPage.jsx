import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ErrorAlert from "../components/ErrorAlert";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    const ok = await login(form);
    setLoading(false);
    if (ok) navigate(location.state?.from?.pathname || "/", { replace: true });
  };

  return (
    <div className="panel">
      <h1 className="text-2xl font-bold tracking-normal">Login</h1>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Access your boards and analytics.</p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <ErrorAlert message={error} />
        <label className="space-y-1">
          <span className="label">Email</span>
          <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </label>
        <label className="space-y-1">
          <span className="label">Password</span>
          <input className="input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        </label>
        <button className="btn-primary w-full" disabled={loading}>{loading ? "Logging in" : "Login"}</button>
      </form>
      <p className="mt-5 text-center text-sm text-zinc-500 dark:text-zinc-400">
        New here? <Link className="font-semibold text-emerald-600" to="/register">Create account</Link>
      </p>
    </div>
  );
};

export default LoginPage;
