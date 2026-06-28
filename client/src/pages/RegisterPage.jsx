import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ErrorAlert from "../components/ErrorAlert";
import { useAuth } from "../context/AuthContext";

const RegisterPage = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { register, error } = useAuth();
  const navigate = useNavigate();

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    const ok = await register(form);
    setLoading(false);
    if (ok) navigate("/", { replace: true });
  };

  return (
    <div className="panel">
      <h1 className="text-2xl font-bold tracking-normal">Create account</h1>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Start managing tasks with AI planning support.</p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <ErrorAlert message={error} />
        <label className="space-y-1">
          <span className="label">Name</span>
          <input className="input" name="name" value={form.name} onChange={update} required minLength={2} />
        </label>
        <label className="space-y-1">
          <span className="label">Email</span>
          <input className="input" name="email" type="email" value={form.email} onChange={update} required />
        </label>
        <label className="space-y-1">
          <span className="label">Password</span>
          <input className="input" name="password" type="password" value={form.password} onChange={update} required minLength={6} />
        </label>
        <button className="btn-primary w-full" disabled={loading}>{loading ? "Creating" : "Register"}</button>
      </form>
      <p className="mt-5 text-center text-sm text-zinc-500 dark:text-zinc-400">
        Already have an account? <Link className="font-semibold text-emerald-600" to="/login">Login</Link>
      </p>
    </div>
  );
};

export default RegisterPage;
