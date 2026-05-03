import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { useState } from "react";
function AuthForm({ type }) {
    const nav = useNavigate();
    const setToken = useAuth((s) => s.setToken);
    const { register, handleSubmit } = useForm();
    const [error, setError] = useState("");
    return (_jsx("div", { className: "min-h-screen grid place-items-center px-4", children: _jsxs("form", { className: "w-full max-w-md card card-pad space-y-4", onSubmit: handleSubmit(async (v) => {
                try {
                    setError("");
                    const { data } = await api.post(`/auth/${type}`, v);
                    setToken(data.data.token);
                    nav("/dashboard");
                }
                catch (e) {
                    setError(e?.response?.data?.error?.message || "Authentication failed.");
                }
            }), children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-semibold", children: type === "login" ? "Welcome back" : "Create account" }), _jsx("p", { className: "page-subtitle", children: type === "login" ? "Login to manage your memory workspace." : "Create your Super Memory account." })] }), error && _jsx("div", { className: "rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700", children: error }), type === "register" && (_jsxs("div", { children: [_jsx("label", { className: "label", children: "Name" }), _jsx("input", { className: "input", placeholder: "Your name", ...register("name", { required: true }) })] })), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Email" }), _jsx("input", { className: "input", type: "email", placeholder: "you@company.com", ...register("email", { required: true }) })] }), _jsxs("div", { children: [_jsx("label", { className: "label", children: "Password" }), _jsx("input", { className: "input", type: "password", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", ...register("password", { required: true }) })] }), _jsx("button", { className: "btn-primary w-full", children: type === "login" ? "Login" : "Register" }), _jsx(Link, { className: "block text-sm text-cyan-700 hover:text-cyan-800", to: type === "login" ? "/register" : "/login", children: type === "login" ? "Need an account? Register" : "Already have account? Login" })] }) }));
}
export const LoginPage = () => _jsx(AuthForm, { type: "login" });
export const RegisterPage = () => _jsx(AuthForm, { type: "register" });
