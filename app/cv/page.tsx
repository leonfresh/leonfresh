"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  Globe,
  Award,
  Briefcase,
  GraduationCap,
  Code,
  Download,
  ExternalLink,
  Palette,
  Box,
  Code2,
  Cpu,
  Layers,
  Monitor,
  Zap,
  Terminal,
  Sparkles,
  Gamepad2,
  Type,
} from "lucide-react";
import Link from "next/link";
import Background from "../../components/Background";
import ContactForm from "../../components/ContactForm";
import TechVisual from "../../components/TechVisual";
import Logo from "../../components/Logo";
import { useState, useRef } from "react";

const CVPage = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen text-slate-100 selection:bg-teal-500/30 selection:text-white pb-20 overflow-hidden"
    >
      <Background />

      <div
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(1000px circle at ${mousePos.x}px ${mousePos.y}px, rgba(45, 212, 191, 0.05), transparent 40%)`,
        }}
      />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 p-6 md:p-8 bg-gradient-to-b from-[#020617]/90 to-transparent backdrop-blur-[2px]">
        <div className="max-w-[1400px] mx-auto flex justify-between items-center">
          <Logo />

          <div className="flex items-center gap-6 md:gap-12">
            <div className="hidden md:flex items-center gap-12 bg-white/5 backdrop-blur-md px-8 py-3 rounded-full border border-white/5 shadow-2xl">
              {[
                { label: "Work", href: "/#work" },
                { label: "Stack", href: "/#stack" },
                { label: "CV", href: "/cv" },
                { label: "Contact", href: "#contact" },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`text-xs font-bold transition-colors uppercase tracking-[0.15em] hover:glow ${
                    item.label === "CV"
                      ? "text-teal-400"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-32 px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="max-w-[1400px] mx-auto"
        >
          {/* Header */}
          <motion.header variants={itemVariants} className="mb-20 relative">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
              <div className="text-center md:text-left">
                <h1 className="text-5xl md:text-7xl font-black font-[Outfit] mb-4 tracking-tighter">
                  LEON <span className="text-teal-400">FRESH</span>
                </h1>
                <p className="text-xl md:text-2xl text-gray-400 font-light mb-8">
                  Digital All-Rounder • Designer & Developer
                </p>

                <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm text-gray-500 uppercase tracking-widest font-bold">
                  <a
                    href="mailto:leonfreshdesign@gmail.com"
                    className="flex items-center gap-2 hover:text-teal-400 transition-colors"
                  >
                    <Mail size={16} /> leonfreshdesign@gmail.com
                  </a>
                  <a
                    href="tel:0466463379"
                    className="flex items-center gap-2 hover:text-teal-400 transition-colors"
                  >
                    <Phone size={16} /> 0466 463 379
                  </a>
                  <a
                    href="http://www.leonfresh.com"
                    target="_blank"
                    className="flex items-center gap-2 hover:text-teal-400 transition-colors"
                  >
                    <Globe size={16} /> leonfresh.com
                  </a>
                </div>
              </div>

              <div className="flex justify-center md:justify-end">
                <a
                  href="/LeonFresh-CV.pdf"
                  target="_blank"
                  className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 hover:bg-teal-500 hover:text-black transition-all duration-500 group shadow-[0_0_30px_-10px_rgba(45,212,191,0.3)]"
                >
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 group-hover:opacity-100">
                      Available Offline
                    </span>
                    <span className="text-sm font-bold uppercase tracking-widest">
                      Download PDF CV
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-teal-500/20 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                    <Download size={20} />
                  </div>
                </a>
              </div>
            </div>
          </motion.header>

          {/* Wow Factor 3D Visual */}
          <motion.section variants={itemVariants} className="mb-12">
            <TechVisual />
          </motion.section>

          {/* Tech Stack Grid */}
          <motion.section variants={itemVariants} className="mb-24">
            <h3 className="text-[10px] uppercase tracking-[0.4em] text-teal-400 font-bold mb-8 flex items-center gap-3">
              <span className="w-8 h-[1px] bg-teal-400/30" />
              Technical Stack
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
              {[
                {
                  name: "Unity 3D",
                  icon: Gamepad2,
                  level: "Expert",
                  desc: "Game Dev & Interactive",
                },
                {
                  name: "React / Next.js",
                  icon: Code2,
                  level: "Expert",
                  desc: "Modern Web Apps",
                },
                {
                  name: "TypeScript",
                  icon: Terminal,
                  level: "Expert",
                  desc: "Type-safe Dev",
                },
                {
                  name: "Adobe Suite",
                  icon: Palette,
                  level: "Expert",
                  desc: "PS, AI, ID, AE",
                },
                {
                  name: "AI Tech",
                  icon: Sparkles,
                  level: "Expert",
                  desc: "LLMs & Automation",
                },
                {
                  name: "Unity C#",
                  icon: Zap,
                  level: "Expert",
                  desc: "Scripting & Logic",
                },
                {
                  name: "PHP / WP",
                  icon: Globe,
                  level: "Expert",
                  desc: "Backend & CMS",
                },
                {
                  name: "Python",
                  icon: Cpu,
                  level: "Expert",
                  desc: "Scripting & AI",
                },
                {
                  name: "UI / UX",
                  icon: Monitor,
                  level: "Expert",
                  desc: "Digital Design",
                },
                {
                  name: "Motion Graphics",
                  icon: Layers,
                  level: "Expert",
                  desc: "Video & Animation",
                },
                {
                  name: "Typography",
                  icon: Type,
                  level: "Expert",
                  desc: "Layout & Branding",
                },
                {
                  name: "Tailwind CSS",
                  icon: Code,
                  level: "Expert",
                  desc: "Modern Styling",
                },
              ].map((tech) => (
                <div
                  key={tech.name}
                  className="group relative p-4 md:p-6 rounded-xl md:rounded-2xl bg-white/5 border border-white/5 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all duration-500 overflow-hidden"
                >
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all duration-500" />
                  <tech.icon className="mb-3 md:mb-4 w-7 h-7 md:w-8 md:h-8 text-gray-400 group-hover:text-purple-400 group-hover:scale-110 transition-all duration-500" />
                  <h4 className="text-sm font-bold text-white mb-1 group-hover:text-purple-400 transition-colors leading-tight">
                    {tech.name}
                  </h4>
                  <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest mb-2">
                    {tech.level}
                  </p>
                  <p className="text-[10px] text-gray-400 leading-tight opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-500">
                    {tech.desc}
                  </p>
                </div>
              ))}
            </div>
          </motion.section>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {/* Left Column: Summary & Skills */}
            <div className="md:col-span-1 space-y-16">
              <motion.section variants={itemVariants}>
                <h3 className="text-[10px] uppercase tracking-[0.4em] text-teal-400 font-bold mb-6 flex items-center gap-3">
                  <span className="w-8 h-[1px] bg-teal-400/30" />
                  Summary
                </h3>
                <p className="text-gray-400 leading-relaxed text-sm">
                  Dynamic and creative Web Developer and Graphic Designer with
                  over a decade of experience across tech, finance, and
                  exhibition management. Adept at creating visually appealing
                  and functional designs for high-profile clients. Passionate
                  about AI, automation, and continuous learning.
                </p>
              </motion.section>

              <motion.section variants={itemVariants}>
                <h3 className="text-[10px] uppercase tracking-[0.4em] text-teal-400 font-bold mb-6 flex items-center gap-3">
                  <span className="w-8 h-[1px] bg-teal-400/30" />
                  Key Achievements
                </h3>
                <ul className="space-y-4">
                  {[
                    "Projects used by Kevin Mitnick & Guy Kawasaki",
                    "35k YouTube Subscribers (18M+ views)",
                    "Gaming mods with millions of plays",
                    "2300 ELO Online Chess Rating",
                  ].map((ach, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-sm text-gray-400"
                    >
                      <Award
                        size={16}
                        className="text-teal-500 shrink-0 mt-0.5"
                      />
                      {ach}
                    </li>
                  ))}
                </ul>
              </motion.section>
            </div>

            {/* Right Column: Experience & Education */}
            <div className="md:col-span-2 space-y-16">
              <motion.section variants={itemVariants}>
                <h3 className="text-[10px] uppercase tracking-[0.4em] text-teal-400 font-bold mb-10 flex items-center gap-3">
                  <span className="w-8 h-[1px] bg-teal-400/30" />
                  Experience
                </h3>

                <div className="space-y-12">
                  {[
                    {
                      role: "Freelance Designer & Developer",
                      company: "The Swoop Inn, Lightrise Studio",
                      period: "2015 – Present",
                      desc: "Providing design and web development for high-profile clients including Sony Australia, BMW, Maserati, and Elastic Studios. Developed innovative HTML5 banners and digital assets for major global campaigns.",
                    },
                    {
                      role: "Web Developer & Graphic Designer",
                      company: "CeBIT Australia (Hannover Fairs)",
                      period: "2014 – 2015",
                      desc: "Sole Designer and Developer for Australia’s leading IT Exhibition. Built the 2015 event website from scratch and designed all event collateral, including print, advertising, and signage.",
                    },
                    {
                      role: "Web Developer & Graphic Designer",
                      company: "MoneyTech",
                      period: "2012 – 2013",
                      desc: "Developed new websites and promotional print items for corporate financial services. Utilized HTML/CSS, WordPress, PHP, and Adobe Creative Suite.",
                    },
                    {
                      role: "Web Developer & Graphic Designer",
                      company: "Entire Travel Connection",
                      period: "2011 – 2012",
                      desc: "Revamped websites resulting in a 300% increase in viewer retention. Collaborated with marketing teams on brand alignment and promotional materials.",
                    },
                  ].map((exp, i) => (
                    <div
                      key={i}
                      className="relative pl-8 border-l border-white/10 group"
                    >
                      <div className="absolute left-[-5px] top-0 w-[9px] h-[9px] rounded-full bg-teal-500 group-hover:scale-150 transition-transform" />
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-2 gap-1">
                        <h4 className="text-lg font-bold text-white">
                          {exp.role}
                        </h4>
                        <span className="text-[10px] uppercase tracking-widest text-teal-400 font-bold bg-teal-400/10 px-2 py-1 rounded">
                          {exp.period}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 font-bold mb-3 uppercase tracking-wider">
                        {exp.company}
                      </p>
                      <p className="text-sm text-gray-400 leading-relaxed">
                        {exp.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.section>

              <motion.section variants={itemVariants}>
                <h3 className="text-[10px] uppercase tracking-[0.4em] text-teal-400 font-bold mb-10 flex items-center gap-3">
                  <span className="w-8 h-[1px] bg-teal-400/30" />
                  Education
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {[
                    {
                      degree: "Advanced Diploma of Graphic Design",
                      school: "Enmore Design Center",
                      year: "2011",
                    },
                    {
                      degree: "Diploma of Multimedia & Graphic Design",
                      school: "QANTM College Sydney",
                      year: "2007",
                    },
                  ].map((edu, i) => (
                    <div
                      key={i}
                      className="bg-white/5 p-6 rounded-2xl border border-white/5 hover:border-teal-500/30 transition-colors"
                    >
                      <GraduationCap size={24} className="text-teal-500 mb-4" />
                      <h4 className="text-sm font-bold text-white mb-1">
                        {edu.degree}
                      </h4>
                      <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">
                        {edu.school}
                      </p>
                      <span className="text-[10px] text-teal-400 font-bold">
                        {edu.year}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.section>
            </div>
          </div>

          {/* Contact Section */}
          <motion.section
            id="contact"
            variants={itemVariants}
            className="mt-32 pt-32 border-t border-white/5"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
              <div>
                <h2 className="text-5xl md:text-7xl font-black font-[Outfit] mb-8 leading-[0.9] uppercase tracking-tighter">
                  Ready to <br />{" "}
                  <span className="text-teal-400 text-glow">Collaborate?</span>
                </h2>
                <p className="text-gray-400 text-lg mb-12 leading-relaxed">
                  Whether you have a specific project in mind or just want to
                  chat about digital possibilities, I&apos;m always open to new
                  opportunities.
                </p>
                <div className="space-y-6">
                  <a
                    href="mailto:leonfreshdesign@gmail.com"
                    className="flex items-center gap-4 text-lg font-bold hover:text-teal-400 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                      <Mail size={20} />
                    </div>
                    leonfreshdesign@gmail.com
                  </a>
                </div>
              </div>
              <ContactForm />
            </div>
          </motion.section>
        </motion.div>
      </main>
    </div>
  );
};

export default CVPage;
