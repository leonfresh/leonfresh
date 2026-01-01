"use client";

import React, { useRef, useState, useEffect, Suspense } from "react";
import {
  AnimatePresence,
  motion,
  Reorder,
  useDragControls,
} from "framer-motion";
import {
  ArrowUpRight,
  Briefcase,
  ChevronRight,
  Mail,
  Trash2,
  GripVertical,
  GraduationCap,
  Gamepad2,
  Code2,
  Terminal,
  Palette,
  Sparkles,
  Zap,
  Globe,
  Cpu,
  Monitor,
  Layers,
  Type,
  Code,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import Background from "../components/Background";
import ContactForm from "../components/ContactForm";
import TechVisual from "../components/TechVisual";
import HeroVisual from "../components/HeroVisual";
import Logo from "../components/Logo";
import GlassCard from "../components/GlassCard";
import ProjectDetail from "../components/ProjectDetail";
import { INITIAL_PROJECTS, TECH_STACK } from "../constants";
import { Project } from "../types";

function ReorderableProjectCard({
  project,
  index,
  onOpen,
  onDelete,
}: {
  project: Project;
  index: number;
  onOpen: () => void;
  onDelete: () => void;
}) {
  const controls = useDragControls();
  const objectPosition = project.thumbnailPosition
    ? `${project.thumbnailPosition.x}% ${project.thumbnailPosition.y}%`
    : "50% 50%";

  return (
    <Reorder.Item
      value={project}
      dragListener={false}
      dragControls={controls}
      className="bento-item"
    >
      <GlassCard
        className="relative h-full w-full overflow-hidden p-0 border-white/5 bg-black/40 hover:bg-black/60 transition-all cursor-pointer group"
        onClick={onOpen}
      >
        <div className="absolute inset-0 z-0">
          <img
            src={project.thumbnail}
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-[1.05]"
            style={{ objectPosition }}
            alt={project.title}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/40 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
        </div>

        <div className="relative z-10 h-full p-6 flex flex-col">
          <div className="absolute left-6 top-6 right-6 flex justify-between items-start">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center bg-black/40 hover:bg-white hover:text-black transition-all opacity-0 group-hover:opacity-100"
                title="Drag to reorder"
                onPointerDown={(e) => controls.start(e)}
                onClick={(e) => e.stopPropagation()}
              >
                <GripVertical size={14} />
              </button>
              <button
                type="button"
                className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center bg-black/40 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                title="Delete project"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                <Trash2 size={14} />
              </button>
            </div>
            <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center bg-black/40 group-hover:bg-white group-hover:text-black transition-all">
              <ArrowUpRight size={18} />
            </div>
          </div>

          <div className="mt-auto pt-14">
            <span className="text-[10px] uppercase tracking-[0.3em] text-teal-400 font-bold">
              {project.category}
            </span>
            <h3 className="text-2xl md:text-3xl font-bold mt-2 mb-2 font-[Outfit] leading-tight">
              {project.title}
            </h3>
          </div>
        </div>
      </GlassCard>
    </Reorder.Item>
  );
}

function PortfolioContent() {
  const devMode = process.env.NODE_ENV !== "production";
  const router = useRouter();
  const searchParams = useSearchParams();
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );

  // Sync URL with selected project
  useEffect(() => {
    const projectFromUrl = searchParams.get("project");
    if (projectFromUrl && projects.some((p) => p.id === projectFromUrl)) {
      setSelectedProjectId(projectFromUrl);
    }
  }, [searchParams, projects]);

  const handleOpenProject = (id: string) => {
    setSelectedProjectId(id);
    router.push(`?project=${id}`, { scroll: false });
  };

  const handleCloseProject = () => {
    setSelectedProjectId(null);
    router.push("/", { scroll: false });
  };
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const saveReorderTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const saveProjectsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const selectedProject = selectedProjectId
    ? projects.find((p) => p.id === selectedProjectId) ?? null
    : null;

  const handleReorderImages = (projectId: string, nextImages: string[]) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, images: nextImages } : p))
    );

    if (!devMode) return;

    if (saveReorderTimerRef.current) {
      clearTimeout(saveReorderTimerRef.current);
    }

    saveReorderTimerRef.current = setTimeout(() => {
      void fetch("/api/dev/image-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId,
          images: nextImages,
        }),
      }).catch(() => {
        // ignore local persistence failures
      });
    }, 300);
  };

  const persistProjects = (next: Project[], removeId?: string) => {
    if (!devMode) return;

    if (saveProjectsTimerRef.current) {
      clearTimeout(saveProjectsTimerRef.current);
    }

    saveProjectsTimerRef.current = setTimeout(() => {
      void fetch("/api/dev/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderedIds: next.map((p) => p.id),
          ...(removeId ? { removeId } : {}),
        }),
      }).catch(() => {
        // ignore local persistence failures
      });
    }, 250);
  };

  const handleReorderProjects = (nextProjects: Project[]) => {
    setProjects(nextProjects);
    persistProjects(nextProjects);
  };

  const handleDeleteProject = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    const label = project?.title ?? projectId;

    const ok = window.confirm(`Delete “${label}” from projects.json?`);
    if (!ok) return;

    setProjects((prev) => {
      const next = prev.filter((p) => p.id !== projectId);
      persistProjects(next, projectId);
      return next;
    });

    setSelectedProjectId((prev) => (prev === projectId ? null : prev));
  };

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
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number],
      },
    },
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen text-slate-100 selection:bg-teal-500/30 selection:text-white"
    >
      <Background />

      <div
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(1000px circle at ${mousePos.x}px ${mousePos.y}px, rgba(45, 212, 191, 0.05), transparent 40%)`,
        }}
      />

      <nav className="fixed top-0 left-0 right-0 z-40 p-6 md:p-8 transition-all duration-300 bg-gradient-to-b from-[#020617]/90 to-transparent backdrop-blur-[2px]">
        <div className="max-w-[1400px] mx-auto flex justify-between items-center">
          <Logo />

          <div className="hidden md:flex items-center gap-12 bg-white/5 backdrop-blur-md px-8 py-3 rounded-full border border-white/5 shadow-2xl">
            {[
              { label: "Work", href: "#work" },
              { label: "Stack", href: "#stack" },
              { label: "CV", href: "/cv", isLink: true },
              { label: "Contact", href: "#contact" },
            ].map((item) =>
              item.isLink ? (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-xs font-bold text-gray-400 hover:text-white transition-colors uppercase tracking-[0.15em] hover:glow"
                >
                  {item.label}
                </Link>
              ) : (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-xs font-bold text-gray-400 hover:text-white transition-colors uppercase tracking-[0.15em] hover:glow"
                >
                  {item.label}
                </a>
              )
            )}
          </div>
        </div>
      </nav>

      <main>
        <section className="relative min-h-screen flex flex-col justify-center items-center text-center overflow-hidden px-6">
          <HeroVisual />

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="relative z-10 max-w-5xl mx-auto"
          >
            <motion.div
              variants={itemVariants}
              className="mb-6 flex justify-center"
            >
              <div className="flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500" />
                </span>
                <span className="text-xs font-semibold tracking-widest text-gray-300 uppercase">
                  Open for freelance projects
                </span>
              </div>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-6xl sm:text-8xl md:text-[10rem] font-black leading-[0.85] tracking-tighter mb-8 font-[Outfit]"
            >
              <span className="block text-white mix-blend-overlay opacity-50 text-stroke-thin uppercase">
                Hybrid
              </span>
              <span className="bg-gradient-to-r from-teal-200 via-white to-teal-400 text-transparent bg-clip-text animate-shimmer">
                CREATIVE
              </span>
              <span className="block text-white/20">TALENT</span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="max-w-2xl mx-auto text-lg md:text-xl text-gray-400 font-light leading-relaxed mb-12"
            >
              I design and build{" "}
              <span className="text-teal-400 font-medium text-glow">
                premium websites, interactive experiences, and AI
              </span>{" "}
              — fast, polished, and conversion-focused.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center justify-center gap-6"
            >
              <a
                href="#work"
                className="group relative bg-white text-black px-12 py-4 rounded-full font-bold overflow-hidden transition-all hover:scale-105"
              >
                <div className="absolute inset-0 w-full h-full bg-teal-400 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 ease-out z-0" />
                <span className="relative z-10 flex items-center gap-3 uppercase tracking-wider text-xs">
                  Explore Work <ChevronRight size={18} />
                </span>
              </a>

              <a
                href="#contact"
                className="group relative px-12 py-4 rounded-full font-bold overflow-hidden transition-all hover:scale-105 border border-white/15 bg-white/5 hover:bg-white/10"
              >
                <span className="relative z-10 flex items-center gap-3 uppercase tracking-wider text-xs text-white">
                  Start a Project <Mail size={18} />
                </span>
              </a>

              <div className="flex items-center gap-8 px-6">
                <a
                  href="https://freelancer.com/u/leonfresh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-500 hover:text-white transition-all hover:scale-110"
                >
                  <Briefcase size={24} />
                  <span className="font-bold hidden sm:inline text-xs uppercase tracking-widest">
                    Freelancer
                  </span>
                </a>

                <Link
                  href="/cv"
                  className="flex items-center gap-2 text-gray-500 hover:text-white transition-all hover:scale-110"
                >
                  <GraduationCap size={24} />
                  <span className="font-bold hidden sm:inline text-xs uppercase tracking-widest">
                    CV
                  </span>
                </Link>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="mt-20 flex flex-col items-center gap-8"
            >
              <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-bold">
                Previously worked with
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 opacity-40 hover:opacity-60 transition-opacity duration-500">
                {[
                  { name: "BMW", src: "/clients/bmw-group.svg" },
                  { name: "CeBIT", src: "/clients/cebit.svg" },
                  { name: "Sony", src: "/clients/sony.svg" },
                  { name: "Maserati", src: "/clients/maserati.svg" },
                ].map((client) => (
                  <div
                    key={client.name}
                    className="h-12 md:h-14 w-36 md:w-44 flex items-center justify-center rounded-2xl border border-white/10 bg-white/5"
                  >
                    <img
                      src={client.src}
                      alt={client.name}
                      className="max-h-7 md:max-h-9 max-w-[72%] w-auto grayscale invert"
                      style={{ filter: "invert(1) grayscale(1) brightness(2)" }}
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </section>

        <div className="max-w-[1400px] mx-auto px-6">
          <section id="work" className="mb-40 pt-10">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
              <div>
                <h2 className="text-5xl md:text-7xl font-bold mb-6 font-[Outfit]">
                  Selected Work
                </h2>
                <div className="flex items-center gap-4">
                  <div className="h-[1px] w-12 bg-teal-500" />
                  <p className="text-gray-500 text-sm uppercase tracking-widest">
                    Immersive Digital Cases
                  </p>
                </div>
              </div>
            </div>

            <div className="bento-grid">
              {devMode ? (
                <Reorder.Group
                  axis="y"
                  values={projects}
                  onReorder={handleReorderProjects}
                  className="contents"
                >
                  {projects.map((project, index) => (
                    <ReorderableProjectCard
                      key={project.id}
                      project={project}
                      index={index}
                      onOpen={() => handleOpenProject(project.id)}
                      onDelete={() => handleDeleteProject(project.id)}
                    />
                  ))}
                </Reorder.Group>
              ) : (
                projects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bento-item group"
                  >
                    <GlassCard
                      className="relative h-full w-full overflow-hidden p-0 border-white/5 bg-black/40 hover:bg-black/60 transition-all cursor-pointer"
                      onClick={() => handleOpenProject(project.id)}
                    >
                      <div className="absolute inset-0 z-0">
                        <img
                          src={project.thumbnail}
                          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-[1.05]"
                          style={{
                            objectPosition: project.thumbnailPosition
                              ? `${project.thumbnailPosition.x}% ${project.thumbnailPosition.y}%`
                              : "50% 50%",
                          }}
                          alt={project.title}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/40 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
                      </div>

                      <div className="relative z-10 h-full p-8 flex flex-col">
                        <div className="absolute right-8 top-8">
                          <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center bg-black/40 group-hover:bg-white group-hover:text-black transition-all">
                            <ArrowUpRight size={20} />
                          </div>
                        </div>

                        <div className="mt-auto pt-16">
                          <span className="text-[10px] uppercase tracking-[0.3em] text-teal-400 font-bold">
                            {project.category}
                          </span>
                          <h3 className="mt-3 font-[Outfit] font-bold leading-snug text-2xl md:text-3xl xl:text-4xl line-clamp-2">
                            {project.title}
                          </h3>
                          <div className="flex flex-wrap gap-2 mt-5 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            {project.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="text-[9px] uppercase tracking-widest text-teal-300/60 px-3 py-1 rounded-full border border-teal-500/20 bg-teal-500/5"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))
              )}
            </div>
          </section>

          {/* Wow Factor 3D Visual */}
          <div className="max-w-[1400px] mx-auto px-6 mb-0 md:mb-[-100px]">
            <TechVisual />
          </div>

          <section
            id="stack"
            className="mb-24 md:mb-40 border-y border-white/5 py-16 md:py-24"
          >
            <div className="max-w-[1400px] mx-auto px-6">
              <h3 className="text-[10px] uppercase tracking-[0.4em] text-teal-400 font-bold mb-8 md:mb-12 flex items-center gap-3">
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
                    className="group relative p-4 md:p-6 rounded-xl md:rounded-2xl bg-white/5 border border-white/5 hover:border-teal-500/50 hover:bg-teal-500/5 transition-all duration-500 overflow-hidden"
                  >
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-teal-500/10 rounded-full blur-3xl group-hover:bg-teal-500/20 transition-all duration-500" />
                    <tech.icon className="mb-3 md:mb-4 w-7 h-7 md:w-8 md:h-8 text-gray-400 group-hover:text-teal-400 group-hover:scale-110 transition-all duration-500" />
                    <h4 className="text-sm font-bold text-white mb-1 group-hover:text-teal-400 transition-colors leading-tight">
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
            </div>
          </section>

          <footer id="contact" className="py-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
              <div>
                <h2 className="text-6xl md:text-8xl font-black font-[Outfit] mb-8 leading-[0.9] uppercase tracking-tighter">
                  Let&apos;s Build <br />{" "}
                  <span className="text-teal-400 text-glow">The Future.</span>
                </h2>
                <div className="space-y-8">
                  <a
                    href="mailto:leonfreshdesign@gmail.com"
                    className="flex items-center gap-6 text-xl font-bold hover:text-teal-400 transition-all group"
                  >
                    <div className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                      <Mail size={22} />
                    </div>
                    leonfreshdesign@gmail.com
                  </a>
                  <a
                    href="https://freelancer.com/u/leonfresh"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-6 text-xl font-bold hover:text-teal-400 transition-all group"
                  >
                    <div className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-[#29B2FE] group-hover:border-[#29B2FE] group-hover:text-white transition-all">
                      <Briefcase size={22} />
                    </div>
                    freelancer.com/u/leonfresh
                  </a>
                  <Link
                    href="/cv"
                    className="flex items-center gap-6 text-xl font-bold hover:text-teal-400 transition-all group"
                  >
                    <div className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-teal-500 group-hover:border-teal-500 group-hover:text-white transition-all">
                      <GraduationCap size={22} />
                    </div>
                    View Full CV
                  </Link>
                </div>
              </div>
              <ContactForm />
            </div>

            <div className="mt-32 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] text-gray-600 uppercase tracking-[0.3em]">
              <span>© 2024 Leon Fresh Architecture</span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                System Live • Sydney/AU
              </span>
            </div>
          </footer>
        </div>
      </main>

      <AnimatePresence>
        {selectedProject && (
          <ProjectDetail
            key={selectedProject.id}
            project={selectedProject}
            onClose={handleCloseProject}
            devMode={devMode}
            onReorderImages={(imgs) => {
              handleReorderImages(selectedProject.id, imgs);
            }}
            onUpdateProject={(nextProject) => {
              setProjects((prev) =>
                prev.map((p) => (p.id === nextProject.id ? nextProject : p))
              );
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <PortfolioContent />
    </Suspense>
  );
}
