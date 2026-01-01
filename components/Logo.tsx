"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Logo() {
  return (
    <Link href="/" className="group relative flex items-center gap-3">
      <div className="relative w-10 h-10 flex items-center justify-center">
        {/* Animated Hexagon/Tech Shape with Teal/Purple contrast */}
        <div className="absolute inset-0 border border-teal-500/30 rotate-45 group-hover:rotate-90 transition-transform duration-700" />
        <div className="absolute inset-1 border border-purple-500/40 -rotate-45 group-hover:-rotate-180 transition-transform duration-1000" />
        <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        <span className="font-black text-lg text-white z-10 tracking-tighter">L</span>
      </div>
      
      <div className="flex flex-col">
        <div className="flex items-center gap-1">
          <span className="font-black text-xl tracking-tighter leading-none text-white">
            LEON<span className="text-teal-400 group-hover:text-purple-400 transition-colors">FRESH</span>
          </span>
          <motion.div 
            animate={{ 
              opacity: [1, 0, 1],
              backgroundColor: ["#2dd4bf", "#a855f7", "#2dd4bf"]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="w-1.5 h-1.5 bg-teal-400 rounded-full"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[8px] text-gray-500 uppercase tracking-[0.4em] font-bold">
            Creative Engineer
          </span>
          <div className="h-[1px] w-8 bg-white/10" />
        </div>
      </div>

      {/* Glitch Effect Overlay (Hidden by default, shows on hover) */}
      <div className="absolute -inset-2 bg-teal-500/5 opacity-0 group-hover:opacity-100 blur-xl transition-opacity pointer-events-none" />
    </Link>
  );
}
