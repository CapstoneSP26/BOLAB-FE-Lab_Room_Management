import React, { useState } from "react";
import { Link } from "react-router-dom";
import {AuthLayout} from "./AuthLayout";

type Form = { email: string; password: string };

export default function LoginPage() {
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const [form, setForm] = useState<Form>({ email: "", password: "" });

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");

    if (!form.email.trim() || !form.password.trim()) {
      setErr("Vui lòng nhập Email và Password.");
      return;
    }

    // TODO: gọi API login (bạn có axios.ts sẵn)
    console.log("LOGIN", form);
  };

  const LoginGoogle = () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/login/google?returnUrl=${import.meta.env.VITE_FE_BASE_URL}`;
  }

  return (
    <AuthLayout
      title="Sign in"
      subtitle={
        <>
          Don’t have an account?{" "}
          <Link className="text-sky-300 font-semibold hover:underline" to="/signup">
            Create one
          </Link>
        </>
      }
      heroTitle={
        <>
          Welcome Back,
          <br />
          Let’s Continue
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <input
          name="email"
          value={form.email}
          onChange={onChange}
          placeholder="Email"
          className="auth-input"
        />

        <div className="relative">
          <input
            name="password"
            type={show ? "text" : "password"}
            value={form.password}
            onChange={onChange}
            placeholder="Password"
            className="auth-input pr-12"
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-2 rounded-lg text-white/70 hover:bg-white/10"
          >
          </button>
        </div>

        {err && <p className="text-sm font-semibold text-red-400">{err}</p>}

        <button className="primary-btn" type="submit">
          Login
        </button>

        <div className="my-5 flex items-center gap-3 text-xs text-white/45">
          <div className="h-px flex-1 bg-white/10" />
          Or continue with
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button type="button" className="social-btn" onClick={LoginGoogle}>
            <span className="font-black">G</span> Google
          </button>
          <button type="button" className="social-btn">
            <span className="text-lg"></span> Apple
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}
