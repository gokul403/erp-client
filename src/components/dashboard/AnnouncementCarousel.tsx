import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Megaphone } from "lucide-react";
import { useTeacherDashboardEventsQuery } from "@/hooks/use-api-data";

export function AnnouncementCarousel() {
  const navigate = useNavigate();
  const { data: events = [], isLoading } = useTeacherDashboardEventsQuery();

  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-play interval
  useEffect(() => {
    if (events.length <= 1) return;
    if (isHovered) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setDirection(1);
      setActiveIndex((prev) => (prev + 1) % events.length);
    }, 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isHovered, events.length]);

  const handlePrev = () => {
    if (events.length === 0) return;
    setDirection(-1);
    setActiveIndex((prev) => (prev - 1 + events.length) % events.length);
  };

  const handleNext = () => {
    if (events.length === 0) return;
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % events.length);
  };

  const handleJump = (idx: number) => {
    setDirection(idx > activeIndex ? 1 : -1);
    setActiveIndex(idx);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, events.length]);

  if (isLoading) {
    return (
      <div className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-indigo-500 to-purple-700 h-64 md:h-56 flex items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-indigo-500 to-purple-750 h-64 md:h-56 flex flex-col justify-center items-center text-center text-white border border-white/15">
        <Megaphone className="h-8 w-8 opacity-40 mb-2" />
        <h3 className="text-sm font-bold">No Active Events</h3>
        <p className="text-[10px] opacity-75 mt-1 max-w-xs">
          There are currently no active events or announcements targeted to your classes.
        </p>
      </div>
    );
  }

  const slide = events[activeIndex] || events[0];

  const categoryBadgeMap: Record<string, { label: string; gradient: string; glow: string }> = {
    Events: { label: "EVENT", gradient: "from-blue-500 to-cyan-600", glow: "bg-blue-400/20" },
    Announcements: { label: "ANNOUNCEMENT", gradient: "from-amber-500 to-red-600", glow: "bg-amber-400/20" },
    "Academic Activities": { label: "ACADEMIC ACTIVITY", gradient: "from-emerald-500 to-teal-600", glow: "bg-emerald-400/20" }
  };
  const badgeConfig = categoryBadgeMap[slide.category] || categoryBadgeMap["Events"];

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 100 : -100,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 100 : -100,
      opacity: 0
    })
  };

  const formattedDate = new Date(slide.start_date).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative overflow-hidden rounded-3xl p-6 md:p-8 text-white select-none h-64 md:h-56 flex flex-col justify-between transition-all duration-500 border border-white/10"
      style={{
        backgroundImage: `linear-gradient(to bottom right, rgba(15, 23, 42, 0.85), rgba(30, 41, 59, 0.95)), url(${slide.cover_image || "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=600&auto=format&fit=crop"})`,
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}
    >
      {events.length > 1 && (
        <div className="absolute top-0 left-0 right-0 flex gap-[3px] px-6 pt-2.5 z-20">
          {events.map((_, idx) => (
            <div
              key={idx}
              className="h-[2.5px] flex-1 bg-white/20 rounded-full overflow-hidden cursor-pointer"
              onClick={() => handleJump(idx)}
            >
              <motion.div
                key={`${idx}-${activeIndex}`}
                className="h-full bg-white rounded-full"
                initial={{ width: "0%" }}
                animate={{
                  width: activeIndex === idx ? "100%" : activeIndex > idx ? "100%" : "0%"
                }}
                transition={
                  activeIndex === idx
                    ? { duration: 5, ease: "linear" }
                    : { duration: 0.3 }
                }
              />
            </div>
          ))}
        </div>
      )}

      <div className="relative z-10 flex-1 flex flex-col justify-between pt-2">
        <div className="mt-4 flex-1 flex flex-col justify-between">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={activeIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-2 md:space-y-3 flex-1 flex flex-col justify-between"
            >
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 text-[9px] font-black uppercase tracking-wider backdrop-blur select-none">
                  <Megaphone className="h-3 w-3 shrink-0" /> {badgeConfig.label} • {formattedDate}
                </div>
                <h2 className="text-base md:text-xl font-black tracking-tight mt-2.5 line-clamp-1">
                  {slide.title}
                </h2>
                <p className="text-[11px] md:text-xs opacity-90 leading-relaxed mt-1 max-w-2xl line-clamp-2">
                  {slide.description}
                </p>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => navigate({ to: "/events", search: { eventId: slide.id } })}
                  className="inline-flex h-8 items-center justify-center rounded-full bg-white px-4 text-[10px] font-bold text-slate-900 transition hover:bg-white/95 hover:scale-101 active:scale-99 cursor-pointer shadow-sm select-none"
                >
                  View Details →
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {events.length > 1 && (
        <div className="absolute right-4 bottom-4 md:right-8 md:bottom-8 z-20 flex gap-2 select-none">
          <button
            onClick={handlePrev}
            className="h-8 w-8 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 transition-all flex items-center justify-center text-white backdrop-blur cursor-pointer active:scale-95"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={handleNext}
            className="h-8 w-8 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 transition-all flex items-center justify-center text-white backdrop-blur cursor-pointer active:scale-95"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
