"use client";

import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, Reorder } from "framer-motion";
import { GripVertical, X, ExternalLink, Tag, ChevronDown } from "lucide-react";
import { Project } from "../types";

type LightboxItem = {
  src: string;
  kind: "image" | "video";
};

function getMediaKind(src: string): LightboxItem["kind"] {
  const lower = src.toLowerCase();
  if (
    lower.endsWith(".mp4") ||
    lower.endsWith(".webm") ||
    lower.endsWith(".mov")
  )
    return "video";
  return "image";
}

function toYouTubeEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);

    if (u.hostname === "youtu.be") {
      const id = u.pathname.replace("/", "").trim();
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    if (u.hostname.endsWith("youtube.com")) {
      const id = u.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;

      const embedMatch = u.pathname.match(/\/embed\/([^/?#]+)/);
      if (embedMatch?.[1])
        return `https://www.youtube.com/embed/${embedMatch[1]}`;

      const shortsMatch = u.pathname.match(/\/shorts\/([^/?#]+)/);
      if (shortsMatch?.[1])
        return `https://www.youtube.com/embed/${shortsMatch[1]}`;
    }

    return null;
  } catch {
    return null;
  }
}

interface ProjectDetailProps {
  project: Project;
  onClose: () => void;
  devMode?: boolean;
  onReorderImages?: (images: string[]) => void;
  onUpdateProject?: (next: Project) => void;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({
  project,
  onClose,
  devMode = false,
  onReorderImages,
  onUpdateProject,
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [images, setImages] = useState<string[]>(() => project.images);
  const [lightboxItem, setLightboxItem] = useState<LightboxItem | null>(null);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [thumbX, setThumbX] = useState<number>(
    () => project.thumbnailPosition?.x ?? 50
  );
  const [thumbY, setThumbY] = useState<number>(
    () => project.thumbnailPosition?.y ?? 50
  );
  const saveThumbTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (container.scrollTop > 50) {
        setShowScrollHint(false);
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Disable body scroll when modal is open and compensate for scrollbar width
    const scrollBarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollBarWidth > 0) {
      document.body.style.paddingRight = `${scrollBarWidth}px`;
      // Also handle fixed elements if they shift
      const nav = document.querySelector("nav");
      if (nav) nav.style.paddingRight = `${scrollBarWidth}px`;
    }

    return () => {
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "0px";
      const nav = document.querySelector("nav");
      if (nav) nav.style.paddingRight = "0px";
    };
  }, []);

  useEffect(() => {
    if (!lightboxItem) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxItem(null);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxItem]);

  useEffect(() => {
    setThumbX(project.thumbnailPosition?.x ?? 50);
    setThumbY(project.thumbnailPosition?.y ?? 50);
  }, [project.id, project.thumbnailPosition?.x, project.thumbnailPosition?.y]);

  const persistThumbnailPosition = (x: number, y: number) => {
    if (!devMode) return;
    if (saveThumbTimerRef.current) clearTimeout(saveThumbTimerRef.current);

    saveThumbTimerRef.current = setTimeout(() => {
      void fetch("/api/dev/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          updateProjectId: project.id,
          thumbnailPosition: { x, y },
        }),
      }).catch(() => {
        // ignore local persistence failures
      });
    }, 250);
  };

  const handleReorder = (nextImages: string[]) => {
    setImages(nextImages);
    onReorderImages?.(nextImages);
  };

  return (
    <>
      {isMounted &&
        lightboxItem &&
        createPortal(
          <div
            className="fixed inset-0 z-[60]"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
              onClick={() => setLightboxItem(null)}
            />

            <button
              type="button"
              onClick={() => setLightboxItem(null)}
              className="absolute top-4 right-4 z-[61] p-2 rounded-full bg-black/50 text-white hover:bg-white hover:text-black transition-colors"
              aria-label="Close image"
            >
              <X size={24} />
            </button>

            <div
              className="absolute inset-0 z-[60] flex items-center justify-center p-4 sm:p-8"
              onClick={() => setLightboxItem(null)}
            >
              {lightboxItem.kind === "video" ? (
                <video
                  src={lightboxItem.src}
                  className="max-h-[90vh] max-w-[92vw] rounded-2xl shadow-2xl"
                  controls
                  playsInline
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <img
                  src={lightboxItem.src}
                  alt="Expanded view"
                  className="max-h-[90vh] max-w-[92vw] rounded-2xl shadow-2xl object-contain"
                  onClick={(e) => e.stopPropagation()}
                />
              )}
            </div>
          </div>,
          document.body
        )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        ref={scrollContainerRef}
        onClick={onClose}
        className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xl px-0 md:px-8"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-6xl mx-auto min-h-screen md:min-h-0 md:my-12 bg-[#0a0a0a] rounded-none md:rounded-3xl overflow-hidden border-0 md:border border-white/10 shadow-2xl flex flex-col-reverse md:flex-row"
        >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="fixed top-4 right-4 z-50 p-2 rounded-full bg-black/50 text-white hover:bg-white hover:text-black transition-colors border border-white/10"
        >
          <X size={24} />
        </button>

        <div className="w-full md:w-2/3 bg-black/20 relative">
          <div className="p-4 space-y-4">
            {devMode && (
              <div className="sticky top-0 z-10 mb-4 flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-[10px] uppercase tracking-[0.25em] text-gray-300 backdrop-blur">
                <GripVertical size={16} className="text-teal-400" />
                Drag images to reorder (dev mode)
              </div>
            )}

            {devMode ? (
              <Reorder.Group axis="y" values={images} onReorder={handleReorder}>
                {images.map((img, idx) => (
                  <Reorder.Item
                    key={img}
                    value={img}
                    className="cursor-grab active:cursor-grabbing"
                  >
                    {getMediaKind(img) === "video" ? (
                      <video
                        src={img}
                        className="w-full h-auto rounded-xl shadow-2xl select-none"
                        controls
                        muted
                        playsInline
                      />
                    ) : (
                      <img
                        src={img}
                        alt={`${project.title} screenshot ${idx + 1}`}
                        className="w-full h-auto rounded-xl shadow-2xl select-none cursor-zoom-in"
                        draggable={false}
                        onClick={() =>
                          setLightboxItem({ src: img, kind: "image" })
                        }
                      />
                    )}
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            ) : (
              images.map((img, idx) => (
                <div key={img}>
                  {getMediaKind(img) === "video" ? (
                    <video
                      src={img}
                      className="w-full h-auto rounded-xl shadow-2xl"
                      controls
                      muted
                      playsInline
                    />
                  ) : (
                    <img
                      src={img}
                      alt={`${project.title} screenshot ${idx + 1}`}
                      className="w-full h-auto rounded-xl shadow-2xl cursor-zoom-in"
                      onClick={() =>
                        setLightboxItem({ src: img, kind: "image" })
                      }
                    />
                  )}
                </div>
              ))
            )}

            {project.links && project.links.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  Videos
                </h3>

                {project.links
                  .map((link) => ({
                    label: link.label,
                    url: link.url,
                    embedUrl: toYouTubeEmbedUrl(link.url),
                  }))
                  .filter((x) => x.embedUrl)
                  .map((video) => (
                    <div key={video.url} className="space-y-2">
                      <div className="text-sm text-gray-300">{video.label}</div>
                      <div className="relative w-full overflow-hidden rounded-xl border border-white/10 bg-black/40 aspect-video">
                        <iframe
                          src={video.embedUrl!}
                          title={video.label}
                          className="absolute inset-0 h-full w-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Scroll Hint */}
          {showScrollHint && images.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none z-50"
            >
              <span className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-bold">
                Scroll for more
              </span>
              <motion.div
                animate={{ y: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <ChevronDown size={20} className="text-teal-400" />
              </motion.div>
            </motion.div>
          )}
        </div>

        <div className="w-full md:w-1/3 h-auto p-8 border-b md:border-b-0 md:border-l border-white/10 bg-gradient-to-b from-white/5 to-transparent">
          <div className="md:sticky md:top-8">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {devMode && (
                <div className="mb-6 rounded-2xl border border-white/10 bg-black/40 p-4 backdrop-blur">
                  <div className="text-[10px] uppercase tracking-[0.25em] text-gray-300 mb-3">
                    Thumbnail crop (dev)
                  </div>
                  <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black/30 h-32">
                    <img
                      src={project.thumbnail}
                      alt="Thumbnail preview"
                      className="h-full w-full object-cover"
                      style={{ objectPosition: `${thumbX}% ${thumbY}%` }}
                      draggable={false}
                    />
                  </div>

                  <div className="mt-4 space-y-3">
                    <label className="block">
                      <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-gray-400">
                        <span>Position X</span>
                        <span className="text-gray-500">{thumbX}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={thumbX}
                        onChange={(e) => {
                          const nextX = Number(e.target.value);
                          setThumbX(nextX);
                          const nextProject: Project = {
                            ...project,
                            thumbnailPosition: { x: nextX, y: thumbY },
                          };
                          onUpdateProject?.(nextProject);
                          persistThumbnailPosition(nextX, thumbY);
                        }}
                        className="w-full"
                      />
                    </label>

                    <label className="block">
                      <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-gray-400">
                        <span>Position Y</span>
                        <span className="text-gray-500">{thumbY}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={thumbY}
                        onChange={(e) => {
                          const nextY = Number(e.target.value);
                          setThumbY(nextY);
                          const nextProject: Project = {
                            ...project,
                            thumbnailPosition: { x: thumbX, y: nextY },
                          };
                          onUpdateProject?.(nextProject);
                          persistThumbnailPosition(thumbX, nextY);
                        }}
                        className="w-full"
                      />
                    </label>
                  </div>
                </div>
              )}

              <span className="text-teal-400 text-sm font-bold tracking-wider uppercase">
                {project.category}
              </span>
              <h2 className="text-3xl font-bold mt-2 mb-4 leading-tight">
                {project.title}
              </h2>

              <p className="text-gray-300 leading-relaxed whitespace-pre-line mb-8">
                {project.description}
              </p>

              {project.stats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                  {project.stats.map((stat, idx) => (
                    <div
                      key={idx}
                      className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col justify-center"
                    >
                      <div className="text-lg font-bold text-white leading-tight break-words">
                        {stat.value}
                      </div>
                      <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">
                  Technologies
                </h3>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 px-3 py-1 rounded-full bg-teal-500/10 text-teal-300 text-xs border border-teal-500/20"
                    >
                      <Tag size={12} /> {tag}
                    </span>
                  ))}
                </div>
              </div>

              {project.url && (
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 rounded-xl bg-white text-black font-bold text-lg hover:bg-teal-400 transition-colors flex items-center justify-center gap-2"
                >
                  View Live Project <ExternalLink size={20} />
                </a>
              )}
            </motion.div>
          </div>
        </div>
      </div>
      </motion.div>
    </>
  );
};

export default ProjectDetail;
