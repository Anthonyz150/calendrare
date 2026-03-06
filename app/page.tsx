"use client";

import React, { useState } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  eachDayOfInterval,
} from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronLeft, ChevronRight, X, Save, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { UserButton, useUser, useClerk } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default function RebirthCalendar() {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [direction, setDirection] = useState<number>(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [note, setNote] = useState<string>("");

  const { user, isLoaded } = useUser();
  const { openSignIn } = useClerk();

  // Chargement Clerk
  if (!isLoaded) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center text-white text-2xl">
        Chargement...
      </div>
    );
  }

  // Utilisateur non connecté
  if (!user) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center gap-6 z-[99999]">
        <h1 className="text-white text-5xl font-black mb-8 tracking-tighter text-center">
          CALENDRARE
        </h1>

        <button
          onClick={() => openSignIn()}
          className="px-16 py-8 bg-white text-black font-black rounded-full text-2xl hover:scale-105 active:scale-95 transition-all"
        >
          SE CONNECTER
        </button>
      </div>
    );
  }

  // Navigation mois
  const nextMonth = (): void => {
    setDirection(1);
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const prevMonth = (): void => {
    setDirection(-1);
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  // Sauvegarde Supabase
  const handleSave = async (): Promise<void> => {
    const { error } = await supabase.from("events").upsert({
      user_id: user.id,
      date: format(selectedDate, "yyyy-MM-dd"),
      content: note,
    });

    if (error) {
      console.error(error);
      alert("Erreur de sauvegarde");
      return;
    }

    setIsDrawerOpen(false);
    alert("Note enregistrée !");
  };

  // Cliquer sur un jour
  const handleDateClick = async (day: Date): Promise<void> => {
    setSelectedDate(day);

    const { data } = await supabase
      .from("events")
      .select("content")
      .eq("user_id", user.id)
      .eq("date", format(day, "yyyy-MM-dd"))
      .single();

    setNote(data?.content || "");
    setIsDrawerOpen(true);
  };

  const days: Date[] = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 }),
  });

  return (
    <main className="h-screen w-screen overflow-hidden bg-black flex font-sans relative text-white">
      <div className="relative z-10 flex flex-col h-full flex-1 p-8 md:p-16">
        {/* HEADER */}
        <header className="flex items-center justify-between mb-12">
          <div>
            <div className="flex items-center gap-4 mb-6 bg-white/10 p-2 rounded-full w-fit border border-white/20 backdrop-blur-xl">
              <div className="scale-125 origin-left ml-1">
                <UserButton />
              </div>

              <span className="font-bold pr-4 text-sm tracking-wide">
                {user.firstName || "Utilisateur"}
              </span>
            </div>

            <h1 className="text-8xl font-black uppercase tracking-tighter leading-none">
              {format(currentMonth, "MMMM", { locale: fr })}
            </h1>
          </div>

          <div className="flex gap-4">
            <button
              onClick={prevMonth}
              className="p-6 bg-white/5 hover:bg-white/10 rounded-3xl border border-white/10"
            >
              <ChevronLeft size={32} />
            </button>

            <button
              onClick={nextMonth}
              className="p-6 bg-white/5 hover:bg-white/10 rounded-3xl border border-white/10"
            >
              <ChevronRight size={32} />
            </button>
          </div>
        </header>

        {/* CALENDRIER */}
        <div className="flex-1">
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={currentMonth.toString()}
              custom={direction}
              initial={{ x: direction * 500, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction * -500, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="grid grid-cols-7 gap-4 w-full h-full"
            >
              {["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"].map((d) => (
                <div
                  key={d}
                  className="text-center text-white/20 font-black text-xs uppercase"
                >
                  {d}
                </div>
              ))}

              {days.map((day: Date) => {
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, currentMonth);

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => isCurrentMonth && handleDateClick(day)}
                    className={`flex items-center justify-center rounded-3xl border
                    ${
                      isSelected
                        ? "bg-blue-600 border-white"
                        : isCurrentMonth
                        ? "bg-white/5 border-white/10"
                        : "opacity-0 pointer-events-none"
                    }`}
                  >
                    <span className="text-4xl font-black">
                      {format(day, "d")}
                    </span>
                  </button>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* TIROIR NOTE */}
      <AnimatePresence>
        {isDrawerOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="fixed right-0 top-0 w-full max-w-xl h-full bg-black border-l border-white/10 p-12 flex flex-col"
          >
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="self-end mb-8"
            >
              <X size={40} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <MessageSquare size={24} />
              <span className="font-black uppercase text-sm">
                Journal de Bord
              </span>
            </div>

            <h3 className="text-5xl font-black mb-10">
              {format(selectedDate, "EEEE d MMMM", { locale: fr })}
            </h3>

            <textarea
              value={note}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setNote(e.target.value)
              }
              className="flex-1 bg-white/5 border border-white/10 rounded-3xl p-6 text-white resize-none mb-8"
            />

            <button
              onClick={handleSave}
              className="py-6 bg-blue-600 rounded-2xl font-black flex items-center justify-center gap-4"
            >
              <Save size={28} />
              ENREGISTRER
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}