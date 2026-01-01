"use client";

import React from "react";
import { motion } from "framer-motion";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
}

const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = "",
  onClick,
  hoverEffect = false,
}) => {
  return (
    <motion.div
      whileHover={hoverEffect ? { y: -5, scale: 1.01 } : {}}
      transition={{ duration: 0.4, ease: "easeOut" }}
      onClick={onClick}
      className={`glass-panel rounded-xl transition-all duration-500 ${
        hoverEffect ? "glass-panel-hover cursor-pointer group" : ""
      } ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;
