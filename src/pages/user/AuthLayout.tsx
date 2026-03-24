import React from "react";

type Props = {
  title: string;
  subtitle: React.ReactNode;
  children: React.ReactNode;
  heroTitle: React.ReactNode;
  heroImgUrl?: string;
};

export function AuthLayout({
  title,
  subtitle,
  children,
  heroTitle,
  heroImgUrl,
}: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 lg:p-6 bg-[radial-gradient(1000px_600px_at_18%_18%,#dbeafe_0%,#f0f9ff_45%,#ffffff_100%)]">
      <div className="w-full max-w-[1320px] rounded-[28px] bg-white/70 backdrop-blur border border-sky-100 p-5 shadow-[0_30px_90px_rgba(2,132,199,0.12)]">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-5">
          {/* LEFT HERO */}
          <section className="relative overflow-hidden rounded-2xl min-h-[420px] lg:min-h-[640px] bg-white">
            {heroImgUrl ? (
              <img
                src={heroImgUrl}
                alt="hero"
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <>
                {/* Pastel FPT: Sky -> Mint -> White */}
                <div className="absolute inset-0 bg-[linear-gradient(135deg,#dbeafe_0%,#e0f2fe_40%,#d1fae5_85%,#ffffff_100%)]" />
                {/* Light glow xanh dương */}
                <div className="absolute inset-0 bg-[radial-gradient(700px_420px_at_30%_30%,rgba(2,132,199,0.18),transparent_60%)]" />
              </>
            )}

            <div className="relative z-10 flex items-center justify-between p-5">
              <div className="flex items-center gap-3 text-slate-900 font-extrabold tracking-wide">
                <div className="h-9 w-9 rounded-xl bg-white border border-sky-100 shadow-sm" />
                FPT University
              </div>

              <button
                type="button"
                onClick={() => window.location.assign("/")}
                className="rounded-full px-4 py-2 text-slate-800 text-sm font-semibold border border-sky-100 bg-white/80 hover:bg-white transition"
              >
                Back to homepage →
              </button>
            </div>

            <div className="relative z-10 h-[calc(100%-76px)] flex flex-col justify-end p-6">
              <div className="text-slate-900">
                <h3 className="text-4xl lg:text-[44px] font-extrabold leading-tight">
                  {heroTitle}
                </h3>

                {/* 3 màu FPT */}
                <div className="mt-5 flex items-center gap-2">
                  <span className="h-1 w-7 rounded-full bg-sky-400/80" />
                  <span className="h-1 w-7 rounded-full bg-emerald-400/80" />
                  <span className="h-1 w-7 rounded-full bg-orange-500" />
                </div>
              </div>
            </div>
          </section>

          {/* RIGHT PANEL */}
          <section className="rounded-2xl bg-white text-slate-900 border border-sky-100 shadow-[0_20px_60px_rgba(2,132,199,0.12)] p-8 lg:p-12">
            <h1 className="text-4xl lg:text-[44px] font-extrabold tracking-tight">
              {title}
            </h1>

            {/* FIX: subtitle phải là text-slate-500 chứ không phải text-white */}
            <div className="mt-2 text-sm text-slate-500">{subtitle}</div>

            <div className="mt-7">{children}</div>
          </section>
        </div>
      </div>
    </div>
  );
}
