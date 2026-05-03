import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { useState } from "react";

function AuthForm({ type }: { type: "login" | "register" }) {
  const nav = useNavigate();
  const setToken = useAuth((s) => s.setToken);
  const { register, handleSubmit } = useForm<any>();
  const [error, setError] = useState("");

  return (
    <div className="min-h-screen grid place-items-center px-4">
      <form
        className="w-full max-w-md card card-pad space-y-4"
        onSubmit={handleSubmit(async (v) => {
          try {
            setError("");
            const { data } = await api.post(`/auth/${type}`, v);
            setToken(data.data.token);
            nav("/dashboard");
          } catch (e: any) {
            setError(e?.response?.data?.error?.message || "Authentication failed.");
          }
        })}
      >
        <div>
          <h1 className="text-2xl font-semibold">{type === "login" ? "Welcome back" : "Create account"}</h1>
          <p className="page-subtitle">{type === "login" ? "Login to manage your memory workspace." : "Create your Super Memory account."}</p>
        </div>
        {error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

        {type === "register" && (
          <div>
            <label className="label">Name</label>
            <input className="input" placeholder="Your name" {...register("name", { required: true })} />
          </div>
        )}

        <div>
          <label className="label">Email</label>
          <input className="input" type="email" placeholder="you@company.com" {...register("email", { required: true })} />
        </div>

        <div>
          <label className="label">Password</label>
          <input className="input" type="password" placeholder="••••••••" {...register("password", { required: true })} />
        </div>

        <button className="btn-primary w-full">{type === "login" ? "Login" : "Register"}</button>
        <Link className="block text-sm text-cyan-700 hover:text-cyan-800" to={type === "login" ? "/register" : "/login"}>
          {type === "login" ? "Need an account? Register" : "Already have account? Login"}
        </Link>
      </form>
    </div>
  );
}

export const LoginPage = () => <AuthForm type="login" />;
export const RegisterPage = () => <AuthForm type="register" />;
