"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { HeroMockup } from "./components/HeroMockup";
import { WaitlistForm } from "./components/WaitlistForm";

/* ── Scroll-reveal wrapper ─────────────────────────────── */
function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
      transition={{ duration: 0.55, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Data ──────────────────────────────────────────────── */
const features = [
  {
    icon: "📸",
    accentBg: "bg-[#FFC93C]/20",
    accentBorder: "border-[#FFC93C]/40",
    title: "Capture in one click",
    desc: "Extension captures visible viewport screenshot, exact page URL, browser user-agent, and buffered JavaScript console errors — automatically.",
  },
  {
    icon: "💬",
    accentBg: "bg-[#4A154B]/10",
    accentBorder: "border-[#4A154B]/30",
    title: "Straight to Slack",
    desc: "Fires directly into your team's Slack channel via lightweight Incoming Webhook. Developers get instant context where they already hang out.",
  },
  {
    icon: "📋",
    accentBg: "bg-[#2F9E44]/10",
    accentBorder: "border-[#2F9E44]/30",
    title: "A simple log, if you want it",
    desc: "No bloated ticketing boards. Access a clean, searchable web dashboard of past bug reports whenever you need to audit open issues.",
  },
];

const steps = [
  {
    num: "01",
    title: "Install & Paste API Key",
    desc: "Install the Chrome extension and enter your Team API key once. No account registration needed for team reporters.",
    icon: "🔑",
  },
  {
    num: "02",
    title: "Click & Describe",
    desc: 'Whenever something breaks, click the extension icon, add an optional quick note, and hit "Capture Bug".',
    icon: "🖱️",
  },
  {
    num: "03",
    title: "Fix in Slack",
    desc: "Your team receives a formatted Slack alert containing screenshot, console errors, page URL, and OS details instantly.",
    icon: "⚡",
  },
];

const faqItems = [
  {
    q: "Do reporters need an account or login to report bugs?",
    a: "No! Team reporters install the Chrome extension and enter your Team API Key once. Anyone on your team can submit bugs instantly without creating an account or logging in.",
  },
  {
    q: "Why no Jira or Linear integrations in v1?",
    a: "We intentionally built Bugsnapr for small teams who prefer Slack-native communication over heavy ticketing workflows. Slack Incoming Webhooks keep the setup under 90 seconds.",
  },
  {
    q: "What happens after the 14-day free trial?",
    a: "You'll be prompted in your dashboard to subscribe via Paddle Checkout. If you choose not to subscribe, the extension will pause sending new reports until activated.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Paddle provides a 1-click customer portal where you can view invoices or cancel your subscription at any time with no questions asked.",
  },
];

const comparisonRows = [
  { label: "Starting Price", us: "$15 – $19/mo", marker: "$39/mo", bugherd: "$39 – $50/mo", usWin: true },
  { label: "Setup Time", us: "~90 seconds", marker: "10-15 mins", bugherd: "15-30 mins", usWin: true },
  { label: "Slack-Native", us: "✓ Instant", marker: "OAuth", bugherd: "Dashboard", usWin: true },
  { label: "Reporter Login", us: "✕ None", marker: "Required", bugherd: "Required", usWin: true },
  { label: "Session Replay", us: "Not incl.", marker: "Included", bugherd: "Higher tiers", usWin: false },
];

/* ── Dot grid background ──────────────────────────────── */
function DotGrid({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      <svg className="w-full h-full opacity-[0.035]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="#14171F" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>
    </div>
  );
}

/* ── Page ──────────────────────────────────────────────── */
export default function BugsnaprLanding() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-[#EDEFF2] text-[#14171F] font-sans selection:bg-[#FFC93C] selection:text-[#14171F]">
      {/* ─── 1. STICKY NAV ────────────────────────────── */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#EDEFF2]/80 border-b border-gray-300/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2.5 group">
            <Image
              src="/bugsnapr-icon.svg"
              alt="Bugsnapr mark"
              width={32}
              height={32}
              className="w-7 h-7 sm:w-8 sm:h-8 transition-transform group-hover:scale-105"
            />
            <span className="font-display font-extrabold text-lg sm:text-xl tracking-tight text-[#14171F]">
              Bugsnapr
            </span>
          </a>

          <a
            href="#waitlist-hero"
            className="px-4 py-2 bg-[#14171F] hover:bg-[#2A303F] text-white font-display font-semibold rounded-xl text-xs sm:text-sm transition-all shadow-sm active:scale-95"
          >
            Join Waitlist
          </a>
        </div>
      </header>

      {/* ─── 2. HERO SECTION ──────────────────────────── */}
      <section className="relative pt-10 sm:pt-20 lg:pt-24 pb-10 sm:pb-16 px-4 sm:px-6 max-w-6xl mx-auto text-center overflow-hidden">
        {/* Decorative gradient orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/3 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#FFC93C]/15 to-[#E8543E]/10 blur-3xl pointer-events-none" />
        <div className="absolute top-40 -right-20 w-[300px] h-[300px] rounded-full bg-[#4A154B]/5 blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-5 sm:space-y-6 max-w-3xl mx-auto relative z-10"
        >
          {/* Eyebrow Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-gray-300 text-[11px] sm:text-xs font-medium text-[#4B5160] shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-[#E8543E] animate-pulse"></span>
            <span>In development — early access opening soon</span>
          </motion.div>

          {/* Headline */}
          <h1 className="font-display font-black text-[1.75rem] leading-[1.15] sm:text-5xl lg:text-[3.5rem] tracking-tight sm:leading-[1.1] text-[#14171F]">
            Bug reports straight to{" "}
            <span className="inline-block">
              <span className="relative inline-block px-1 sm:px-2">
                <span className="relative z-10">Slack</span>
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.4, duration: 0.5, ease: "easeOut" }}
                  className="absolute inset-x-0 bottom-0.5 sm:bottom-1 h-2.5 sm:h-4 bg-[#FFC93C] -rotate-1 rounded-sm -z-0 origin-left"
                />
              </span>
            </span>
            {" "}—{" "}
            <span className="text-[#4B5160]">no enterprise bloat.</span>
          </h1>

          {/* Subheading */}
          <p className="text-[15px] sm:text-lg lg:text-xl text-[#4B5160] max-w-2xl mx-auto leading-relaxed">
            Capture screenshots, console errors, and page context with 1 click. No reporter login needed. Built for small teams of 2–8.
          </p>

          {/* Hero Waitlist Form */}
          <div className="pt-1 sm:pt-2">
            <WaitlistForm id="waitlist-hero" source="landing_hero" />
          </div>
        </motion.div>

        {/* 3D Browser Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mt-10 sm:mt-16 lg:mt-20 relative z-10"
        >
          <HeroMockup />
        </motion.div>
      </section>

      {/* ─── 3. WHY BUGSNAPR ─────────────────────────── */}
      <section className="relative py-14 sm:py-24 bg-white border-y border-gray-300/80 px-4 sm:px-6 overflow-hidden">
        <DotGrid />
        <div className="max-w-4xl mx-auto relative z-10">
          <Reveal className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
            <span className="inline-block text-[10px] sm:text-xs uppercase tracking-[0.2em] font-display font-bold text-[#E8543E] mb-3">
              Comparison
            </span>
            <h2 className="font-display font-extrabold text-2xl sm:text-4xl lg:text-[2.6rem] text-[#14171F]">
              Why Bugsnapr?
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#4B5160] max-w-lg mx-auto">
              Enterprise bug trackers charge $50/month for complex video replays your small team never watches.
            </p>
          </Reveal>

          {/* Mobile: stacked comparison cards */}
          <div className="md:hidden space-y-3">
            {comparisonRows.map((row, i) => (
              <Reveal key={row.label} delay={i * 0.06}>
                <div className={`p-4 rounded-xl border transition-all ${row.usWin ? "border-[#FFC93C]/60 bg-[#FFC93C]/5" : "border-gray-200 bg-white"}`}>
                  <div className="text-[11px] uppercase tracking-wider font-display font-bold text-[#4B5160] mb-2.5">
                    {row.label}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs font-medium">
                    <div>
                      <div className="text-[10px] text-[#4B5160] mb-0.5">Bugsnapr</div>
                      <div className={`font-bold ${row.usWin ? "text-[#2F9E44]" : "text-gray-400 italic"}`}>
                        {row.us}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-400 mb-0.5">Marker.io</div>
                      <div className="text-gray-500">{row.marker}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-400 mb-0.5">BugHerd</div>
                      <div className="text-gray-500">{row.bugherd}</div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Desktop: table */}
          <Reveal className="hidden md:block">
            <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-md bg-white">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-gray-200">
                    <th className="py-4 px-6 font-display font-bold text-[#14171F]">Feature / Metric</th>
                    <th className="py-4 px-6 font-display font-bold text-[#14171F] bg-[#FFC93C]/20 border-x border-[#FFC93C]/40">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#2F9E44]"></span>
                        Bugsnapr
                      </span>
                    </th>
                    <th className="py-4 px-6 font-display font-semibold text-gray-500">Marker.io</th>
                    <th className="py-4 px-6 font-display font-semibold text-gray-500">BugHerd</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white font-medium">
                  {comparisonRows.map((row) => (
                    <tr key={row.label} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6 text-[#14171F] font-semibold">{row.label}</td>
                      <td className={`py-4 px-6 font-bold bg-[#FFC93C]/10 border-x border-[#FFC93C]/30 ${row.usWin ? "text-[#2F9E44]" : "text-gray-400 italic"}`}>
                        {row.us}
                      </td>
                      <td className="py-4 px-6 text-gray-500">{row.marker}</td>
                      <td className="py-4 px-6 text-gray-500">{row.bugherd}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── 4. FEATURES SECTION ──────────────────────── */}
      <section className="relative py-14 sm:py-24 px-4 sm:px-6 max-w-6xl mx-auto overflow-hidden">
        <Reveal className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
          <span className="inline-block text-[10px] sm:text-xs uppercase tracking-[0.2em] font-display font-bold text-[#4A154B] mb-3">
            Features
          </span>
          <h2 className="font-display font-extrabold text-2xl sm:text-4xl lg:text-[2.6rem] text-[#14171F]">
            Built for speed, not status meetings.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#4B5160]">
            Everything you need to squash bugs fast, with zero friction for your non-technical team members.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.08}>
              <motion.div
                whileHover={{ y: -6, boxShadow: "0 20px 40px -12px rgba(0,0,0,0.1)" }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={`p-5 sm:p-7 bg-white rounded-2xl border ${f.accentBorder} shadow-sm h-full flex flex-col`}
              >
                <div
                  className={`w-12 h-12 rounded-xl ${f.accentBg} flex items-center justify-center text-2xl mb-5`}
                >
                  {f.icon}
                </div>
                <h3 className="font-display font-bold text-lg sm:text-xl text-[#14171F] mb-2">
                  {f.title}
                </h3>
                <p className="text-sm text-[#4B5160] leading-relaxed flex-1">{f.desc}</p>

                {/* Decorative bottom line */}
                <div className={`mt-5 h-1 w-12 rounded-full ${f.accentBg}`} />
              </motion.div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ─── 5. HOW IT WORKS ──────────────────────────── */}
      <section className="relative py-14 sm:py-24 bg-white border-y border-gray-300/80 px-4 sm:px-6 overflow-hidden">
        <DotGrid />
        <div className="max-w-4xl mx-auto relative z-10">
          <Reveal className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
            <span className="inline-block text-[10px] sm:text-xs uppercase tracking-[0.2em] font-display font-bold text-[#2F9E44] mb-3">
              Getting Started
            </span>
            <h2 className="font-display font-extrabold text-2xl sm:text-4xl lg:text-[2.6rem] text-[#14171F]">
              How it works in 3 steps
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#4B5160]">
              Set up once in 90 seconds. Your whole team is ready to report bugs immediately.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 relative">
            {/* Connecting line (desktop only) */}
            <div className="hidden md:block absolute top-8 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

            {steps.map((s, i) => (
              <Reveal key={s.num} delay={i * 0.1}>
                <div className="flex flex-col items-center text-center space-y-4 relative">
                  {/* Number circle */}
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#14171F] text-white font-display font-bold text-lg sm:text-xl flex items-center justify-center shadow-lg relative z-10">
                    <span className="text-xs absolute -top-1 -right-1 w-5 h-5 bg-[#FFC93C] text-[#14171F] rounded-full flex items-center justify-center font-bold">
                      {s.icon}
                    </span>
                    {s.num}
                  </div>

                  {/* Mobile connecting line */}
                  {i < steps.length - 1 && (
                    <div className="w-px h-5 bg-gradient-to-b from-gray-300 to-transparent md:hidden" />
                  )}

                  <h3 className="font-display font-bold text-lg text-[#14171F]">
                    {s.title}
                  </h3>
                  <p className="text-sm text-[#4B5160] leading-relaxed max-w-xs">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 6. PRICING ───────────────────────────────── */}
      <section className="relative py-14 sm:py-24 px-4 sm:px-6 max-w-5xl mx-auto overflow-hidden">
        <Reveal className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
          <span className="inline-block text-[10px] sm:text-xs uppercase tracking-[0.2em] font-display font-bold text-[#FFC93C] mb-3">
            Pricing
          </span>
          <h2 className="font-display font-extrabold text-2xl sm:text-4xl lg:text-[2.6rem] text-[#14171F]">
            Simple, honest pricing.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#4B5160]">
            No per-user seat penalties. 14-day free trial on all plans at launch.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8 max-w-3xl mx-auto">
          {/* Starter Tier */}
          <Reveal>
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between h-full"
            >
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-display font-bold text-xl text-[#14171F]">Starter</h3>
                  <span className="text-[10px] sm:text-xs font-semibold px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md">
                    Small Teams
                  </span>
                </div>
                <div className="mb-6 flex items-end gap-1.5">
                  <span className="font-display font-black text-5xl text-[#14171F]">$15</span>
                  <span className="text-sm text-gray-500 font-medium pb-1.5"> / month</span>
                </div>
                <ul className="space-y-3 text-sm text-[#4B5160] mb-8">
                  {["Up to 8 team members", "Unlimited bug reports", "Slack Incoming Webhooks", "Console error & browser context"].map(
                    (item) => (
                      <li key={item} className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-[#2F9E44]/10 text-[#2F9E44] flex items-center justify-center text-xs font-bold flex-shrink-0">✓</span>
                        {item}
                      </li>
                    )
                  )}
                </ul>
              </div>
              <a
                href="#waitlist-hero"
                className="w-full py-3.5 bg-[#14171F] hover:bg-[#2A303F] text-white font-display font-semibold rounded-xl text-sm transition-all text-center block active:scale-[0.97]"
              >
                Get Early Access
              </a>
            </motion.div>
          </Reveal>

          {/* Pro Tier */}
          <Reveal delay={0.08}>
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="bg-white p-6 sm:p-8 rounded-2xl border-2 border-[#FFC93C] shadow-lg flex flex-col justify-between relative h-full"
            >
              <div className="absolute -top-3.5 right-5 px-3 py-1 bg-[#FFC93C] text-[#14171F] font-display font-bold text-[10px] sm:text-xs rounded-full shadow-sm">
                RECOMMENDED
              </div>
              {/* Glow behind card */}
              <div className="absolute -inset-1 rounded-2xl bg-[#FFC93C]/10 blur-xl pointer-events-none -z-10" />
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-display font-bold text-xl text-[#14171F]">Pro</h3>
                  <span className="text-[10px] sm:text-xs font-semibold px-2.5 py-1 bg-[#FFC93C]/30 text-[#14171F] rounded-md">
                    Growing Teams
                  </span>
                </div>
                <div className="mb-6 flex items-end gap-1.5">
                  <span className="font-display font-black text-5xl text-[#14171F]">$19</span>
                  <span className="text-sm text-gray-500 font-medium pb-1.5"> / month</span>
                </div>
                <ul className="space-y-3 text-sm text-[#4B5160] mb-8">
                  {["Unlimited team members", "Unlimited bug reports", "Slack Incoming Webhooks", "Priority email support"].map(
                    (item) => (
                      <li key={item} className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-[#2F9E44]/10 text-[#2F9E44] flex items-center justify-center text-xs font-bold flex-shrink-0">✓</span>
                        {item}
                      </li>
                    )
                  )}
                </ul>
              </div>
              <a
                href="#waitlist-hero"
                className="w-full py-3.5 bg-[#14171F] hover:bg-[#2A303F] text-white font-display font-semibold rounded-xl text-sm transition-all text-center block active:scale-[0.97]"
              >
                Get Early Access
              </a>
            </motion.div>
          </Reveal>
        </div>
      </section>

      {/* ─── 7. FAQ ACCORDION ─────────────────────────── */}
      <section className="py-14 sm:py-24 bg-white border-y border-gray-300/80 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <Reveal className="text-center mb-10 sm:mb-12">
            <span className="inline-block text-[10px] sm:text-xs uppercase tracking-[0.2em] font-display font-bold text-[#4B5160] mb-3">
              FAQ
            </span>
            <h2 className="font-display font-extrabold text-2xl sm:text-4xl lg:text-[2.6rem] text-[#14171F]">
              Frequently Asked Questions
            </h2>
          </Reveal>

          <div className="space-y-3">
            {faqItems.map((item, idx) => (
              <Reveal key={idx} delay={idx * 0.05}>
                <div className={`border rounded-xl overflow-hidden transition-all ${openFaq === idx ? "border-[#FFC93C]/60 bg-[#FFC93C]/5 shadow-sm" : "border-gray-200 bg-slate-50/50"}`}>
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full px-5 sm:px-6 py-4 text-left font-display font-bold text-[15px] sm:text-base text-[#14171F] flex justify-between items-center gap-4 cursor-pointer"
                  >
                    <span>{item.q}</span>
                    <motion.span
                      animate={{ rotate: openFaq === idx ? 45 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-xl font-mono text-gray-400 flex-shrink-0 w-6 h-6 flex items-center justify-center"
                    >
                      +
                    </motion.span>
                  </button>
                  <motion.div
                    initial={false}
                    animate={{
                      height: openFaq === idx ? "auto" : 0,
                      opacity: openFaq === idx ? 1 : 0,
                    }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 sm:px-6 pb-4 text-sm text-[#4B5160] leading-relaxed border-t border-gray-200/60 pt-3">
                      {item.a}
                    </div>
                  </motion.div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 8. FOUNDER NOTE ──────────────────────────── */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 max-w-3xl mx-auto text-center">
        <Reveal>
          <div className="p-6 sm:p-10 bg-white rounded-2xl border border-gray-300/80 shadow-sm space-y-4 relative overflow-hidden">
            {/* Decorative accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFC93C] via-[#E8543E] to-[#4A154B]" />

            <div className="w-14 h-14 rounded-full bg-[#FFC93C]/20 text-[#14171F] font-display font-bold flex items-center justify-center mx-auto text-2xl">
              🛠️
            </div>
            <h3 className="font-display font-bold text-xl sm:text-2xl text-[#14171F]">
              Built in public, solo.
            </h3>
            <p className="text-sm sm:text-base text-[#4B5160] leading-relaxed max-w-xl mx-auto">
              I built Bugsnapr because existing bug reporting tools are bloated, expensive ($39–$50/mo minimums), and force non-technical team members to create accounts just to report a broken button. Bugsnapr is streamlined, lightweight, and priced fairly for small teams. Reach out or suggest features directly at <a href="mailto:mail@bugsnapr.com" className="underline hover:text-[#14171F] font-semibold">mail@bugsnapr.com</a>.
            </p>
          </div>
        </Reveal>
      </section>

      {/* ─── 9. FINAL CTA SECTION ────────────────────── */}
      <section id="waitlist" className="relative py-14 sm:py-24 bg-[#14171F] text-white px-4 sm:px-6 text-center overflow-hidden">
        {/* Radial glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#FFC93C]/5 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#4A154B]/10 blur-3xl" />
        </div>

        {/* Dot grid */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <svg className="w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots-dark" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="#ffffff" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots-dark)" />
          </svg>
        </div>

        <div className="max-w-3xl mx-auto space-y-5 sm:space-y-6 relative z-10">
          <Reveal>
            <h2 className="font-display font-black text-[1.65rem] leading-tight sm:text-5xl lg:text-[3.2rem] tracking-tight">
              Ready to simplify your team&apos;s bug reports?
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="text-gray-400 text-sm sm:text-base max-w-xl mx-auto">
              Join the waitlist today for early access and a 14-day free trial when we launch.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="pt-1 sm:pt-2">
              <WaitlistForm source="landing_final" variant="dark" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── 10. FOOTER ───────────────────────────────── */}
      <footer className="py-6 sm:py-8 border-t border-gray-300/80 px-4 sm:px-6 text-xs text-gray-500 bg-[#EDEFF2]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image
              src="/bugsnapr-icon.svg"
              alt="Bugsnapr"
              width={20}
              height={20}
              className="w-5 h-5"
            />
            <span className="font-display font-bold text-[#14171F]">Bugsnapr</span>
            <span>© {new Date().getFullYear()} — Built for small teams.</span>
          </div>

          <div className="flex gap-6 font-medium">
            <a href="#waitlist-hero" className="hover:text-[#14171F] transition-colors">
              Waitlist
            </a>
            <a href="mailto:mail@bugsnapr.com" className="hover:text-[#14171F] transition-colors">
              Contact
            </a>
            <a href="#" className="hover:text-[#14171F] transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-[#14171F] transition-colors">
              Terms
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
