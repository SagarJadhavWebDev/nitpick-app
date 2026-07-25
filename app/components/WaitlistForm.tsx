"use client";

import React, { useState, useEffect } from "react";

interface WaitlistFormProps {
  source?: string;
  id?: string;
  variant?: "light" | "dark";
}

export function WaitlistForm({
  source = "landing_hero",
  id,
  variant = "light",
}: WaitlistFormProps) {
  const [email, setEmail] = useState("");
  const [count, setCount] = useState<number | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const isDark = variant === "dark";

  useEffect(() => {
    async function fetchCount() {
      try {
        const res = await fetch("/api/waitlist");
        if (res.ok) {
          const data = await res.json();
          if (typeof data.count === "number") {
            setCount(data.count);
          }
        }
      } catch (err) {
        console.error("Failed to fetch waitlist count", err);
      }
    }
    fetchCount();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus("success");
        setMessage(data.message || "You're on the list!");
        if (typeof data.count === "number") {
          setCount(data.count);
        } else if (count !== null && !data.duplicate) {
          setCount(count + 1);
        }
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setStatus("error");
      setMessage("Network error. Please try again later.");
    }
  };

  return (
    <div id={id} className="w-full max-w-md mx-auto text-left">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your work email..."
          required
          disabled={status === "loading" || status === "success"}
          className={`flex-1 px-4 py-3 rounded-xl text-sm transition-all shadow-sm focus:outline-none ${
            isDark
              ? "bg-[#1E2536] border-2 border-slate-700 text-white placeholder-gray-400 focus:border-[#FFC93C]"
              : "bg-white border-2 border-gray-300 text-[#14171F] placeholder-gray-400 focus:border-[#14171F]"
          }`}
        />
        <button
          type="submit"
          disabled={status === "loading" || status === "success"}
          className={`px-6 py-3 font-display font-semibold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 ${
            isDark
              ? "bg-[#FFC93C] hover:bg-[#eab62e] text-[#14171F]"
              : "bg-[#14171F] hover:bg-[#2A303F] text-white"
          }`}
        >
          {status === "loading" ? (
            <span
              className={`inline-block w-4 h-4 border-2 border-t-transparent rounded-full animate-spin ${
                isDark ? "border-[#14171F]" : "border-white"
              }`}
            ></span>
          ) : (
            "Join Waitlist"
          )}
        </button>
      </form>

      {/* Live Counter Display */}
      <div className="mt-3 flex items-center justify-between text-xs px-1">
        <div className="flex items-center gap-1.5 font-medium">
          <span className="w-2 h-2 rounded-full bg-[#2F9E44] animate-pulse"></span>
          {count === null ? (
            <span className={isDark ? "text-gray-300" : "text-[#4B5160]"}>
              Loading waitlist count...
            </span>
          ) : count > 0 ? (
            <span className={isDark ? "text-gray-300" : "text-[#4B5160]"}>
              <strong className={isDark ? "text-white font-bold" : "text-[#14171F] font-bold"}>
                {count}
              </strong>{" "}
              team{count === 1 ? "" : "s"} already waiting
            </span>
          ) : (
            <span className={isDark ? "font-bold text-white" : "font-bold text-[#14171F]"}>
              Be the first to join
            </span>
          )}
        </div>
        <span className={isDark ? "text-gray-400" : "text-gray-400"}>
          14-day free trial at launch
        </span>
      </div>

      {/* Status Alert */}
      {status === "success" && (
        <div className="mt-3 p-3 bg-emerald-950/40 border border-emerald-500/40 text-[#2F9E44] rounded-xl text-xs font-medium flex items-center gap-2">
          <span>✓</span>
          <span>{message}</span>
        </div>
      )}

      {status === "error" && (
        <div className="mt-3 p-3 bg-red-950/40 border border-red-500/40 text-[#E8543E] rounded-xl text-xs font-medium flex items-center gap-2">
          <span>⚠️</span>
          <span>{message}</span>
        </div>
      )}
    </div>
  );
}
