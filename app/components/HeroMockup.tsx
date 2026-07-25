"use client";

import React, { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";

export function HeroMockup() {
  const shouldReduceMotion = useReducedMotion();
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || "ontouchstart" in window);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile || shouldReduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;
    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  return (
    <div
      className="w-full max-w-2xl mx-auto py-2"
      style={{ perspective: 1000 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        style={{
          transformStyle: "preserve-3d",
        }}
        animate={{
          rotateX: isMobile || shouldReduceMotion ? 3 : rotate.x,
          rotateY: isMobile || shouldReduceMotion ? -3 : rotate.y,
        }}
        transition={{ type: "spring", stiffness: 200, damping: 22 }}
        className="relative bg-white rounded-2xl shadow-2xl border border-gray-300/80 overflow-hidden text-left"
      >
        {/* Browser Top Bar */}
        <div className="bg-slate-100 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#E8543E]"></div>
            <div className="w-3 h-3 rounded-full bg-[#FFC93C]"></div>
            <div className="w-3 h-3 rounded-full bg-[#2F9E44]"></div>
          </div>
          <div className="bg-white px-3 py-1 rounded-md text-[11px] font-mono text-gray-500 border border-gray-200 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            https://your-app.com/checkout
          </div>
          <div className="w-12"></div>
        </div>

        {/* Simulated Webpage Content */}
        <div className="p-5 sm:p-6 bg-slate-50 relative min-h-[300px] flex flex-col justify-between">
          {/* Mock Dashboard UI */}
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <div className="h-5 w-32 bg-gray-200 rounded"></div>
              <div className="h-7 w-24 bg-[#14171F] rounded text-white text-xs flex items-center justify-center font-medium">
                Pay Now
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="p-3.5 bg-white rounded-lg border border-gray-200 space-y-2">
                <div className="h-3 w-16 bg-gray-200 rounded"></div>
                <div className="h-7 w-full bg-gray-100 rounded border border-gray-200"></div>
              </div>
              <div className="p-3.5 bg-white rounded-lg border border-gray-200 space-y-2 relative">
                <div className="h-3 w-20 bg-gray-200 rounded"></div>
                <div className="h-7 w-full bg-red-50 border-2 border-[#E8543E] rounded flex items-center px-3 text-xs font-mono text-[#E8543E] font-bold">
                  Total: NaN USD
                </div>

                {/* Bug Annotation Circle */}
                <motion.div
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="absolute -top-3 -right-3 z-10"
                >
                  <span className="relative flex h-8 w-8">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E8543E] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-8 w-8 bg-[#E8543E] text-white text-xs font-bold items-center justify-center shadow-lg">
                      !
                    </span>
                  </span>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Console Log Snippet */}
          <div className="mt-4 p-3 bg-gray-900 rounded-lg text-[11px] font-mono text-red-400 flex items-start gap-2 border border-gray-800">
            <span className="text-red-500 font-bold">✖</span>
            <div>
              <span className="text-gray-300 font-semibold">Uncaught TypeError:</span> Cannot read properties of undefined (&apos;total&apos;)
              <div className="text-gray-500 text-[10px] mt-0.5">at checkout.js:142:12</div>
            </div>
          </div>

          {/* Slack Toast Notification */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 140 }}
            className="mt-4 bg-[#4A154B] text-white p-3.5 rounded-xl shadow-xl border border-purple-900 flex items-start gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-base flex-shrink-0">
              💬
            </div>
            <div className="text-xs space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#FFC93C]">#bug-reports</span>
                <span className="text-purple-200 text-[10px]">Bugsnapr Bot • Just now</span>
              </div>
              <p className="text-gray-100 font-medium">
                <span className="text-red-300 font-bold">Cart total NaN on checkout</span> — /checkout
              </p>
              <div className="text-[11px] text-purple-200 bg-black/20 px-2 py-1 rounded font-mono mt-1">
                Includes screenshot + console logs + macOS Chrome
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
