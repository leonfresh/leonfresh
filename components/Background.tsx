"use client";

import React from "react";
import Particles from "./Particles";

const Background: React.FC = () => {
  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden -z-10 bg-[#020617]">
      {/* Ambient Blobs with new Purple/Indigo accents */}
      <div className="absolute top-[-10%] left-[10%] w-[600px] h-[600px] bg-purple-900/20 rounded-full mix-blend-screen filter blur-[120px] animate-blob" />
      <div className="absolute top-[10%] right-[-5%] w-[500px] h-[500px] bg-indigo-900/30 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000" />
      <div className="absolute bottom-[-10%] left-[20%] w-[700px] h-[700px] bg-teal-900/10 rounded-full mix-blend-screen filter blur-[150px] animate-blob animation-delay-4000" />
      <div className="absolute top-[40%] left-[40%] w-[400px] h-[400px] bg-fuchsia-900/10 rounded-full mix-blend-screen filter blur-[130px] animate-blob animation-delay-3000" />

      <Particles />

      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.4' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] pointer-events-none" />
    </div>
  );
};

export default Background;
