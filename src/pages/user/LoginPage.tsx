import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useToast } from "../../hooks/useToast";
import { AuthLayout } from "./AuthLayout";

type Form = { email: string; password: string };

const ERROR_MESSAGES: Record<string, { title: string; message: string }> = {
  User_not_found: {
    title: "Không thể đăng nhập",
    message: "Tài khoản Google của bạn chưa được đăng ký trong hệ thống",
  },
  User_role_not_found: {
    title: "Lỗi cấu hình tài khoản",
    message: "Tài khoản của bạn chưa được cấp quyền. Vui lòng liên hệ quản trị viên",
  },
  Google_auth_failed: {
    title: "Đăng nhập Google thất bại",
    message: "Không thể xác thực với Google. Vui lòng thử lại",
  },
};

export default function LoginPage() {
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const [form, setForm] = useState<Form>({ email: "", password: "" });
  const [searchParams] = useSearchParams();
  const { error: showError } = useToast();

  // Check OAuth error from backend redirect
  useEffect(() => {
    const errorCode = searchParams.get("error");
    if (errorCode) {
      const errorConfig = ERROR_MESSAGES[errorCode as keyof typeof ERROR_MESSAGES];
      if (errorConfig) {
        showError(errorConfig.title, errorConfig.message);
      }
    }
  }, [searchParams, showError]);

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
  };

  const LoginGoogle = () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/login/google?returnUrl=${import.meta.env.VITE_FE_BASE_URL}/login`;
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
