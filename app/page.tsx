"use client";

import React, { useState, useEffect } from 'react';
import {
  format, addMonths, subMonths, startOfMonth, endOfMonth,
  startOfWeek, endOfWeek, isSameMonth, isSameDay, eachDayOfInterval
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, X, Save, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserButton, useUser, useClerk } from "@clerk/nextjs"; // On ajoute useClerk
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default function RebirthCalendar() {
  // 1. D'abord tous les states
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [direction, setDirection] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [note, setNote] = useState("");

  // 2. Ensuite tous les Hooks de Clerk (Toujours groupés ici !)
  const { user, isLoaded } = useUser();
  const { openSignIn } = useClerk(); // <--- ELLE DOIT ÊTRE ICI

  // 3. SEULEMENT APRÈS, on fait les tests de redirection
  if (isLoaded && !user) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center gap-6 z-[99999]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#1e3a8a_0%,_black_70%)] opacity-40 pointer-events-none" />

        <h1 className="text-white text-5xl font-black mb-8 z-10 tracking-tighter text-center">
          CALENDRARE
        </h1>

        <button
          type="button"
          onClick={() => {
            alert("Le JavaScript fonctionne !");
            openSignIn({
              forceRedirectUrl: "/", // C'est le nom standard dans la v5/v6
            });
          }}
          className="relative z-[999999] px-16 py-8 bg-white text-black font-black rounded-full cursor-pointer"
        >
          C'EST ICI !
        </button>
      </div>
    );
  }

  // --- LOGIQUE DU CALENDRIER ---
  const nextMonth = () => {
    setDirection(1);
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const prevMonth = () => {
    setDirection(-1);
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleSave = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('events')
      .upsert({
        user_id: user.id,
        date: format(selectedDate, 'yyyy-MM-dd'),
        content: note
      });

    if (error) {
      console.error("Erreur Supabase:", error);
      alert("Erreur de sauvegarde !");
    } else {
      setIsDrawerOpen(false);
      setNote("");
      alert("Note enregistrée !");
    }
  };

  const handleDateClick = (day: Date) => {
    setSelectedDate(day);
    setIsDrawerOpen(true);
    setNote("");
  };

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 }),
  });

  return (
    <main className="h-screen w-screen overflow-hidden bg-black flex font-sans relative text-white">

      {/* FOND DYNAMIQUE */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_#1e3a8a,_black,_#7f1d1d)]" />
        <div className="absolute inset-0 backdrop-blur-3xl opacity-50" />
      </div>

      <div className={`relative z-10 flex flex-col h-full flex-1 p-8 md:p-16 transition-all duration-500 ${isDrawerOpen ? 'pr-4 opacity-30 scale-[0.98] blur-sm' : ''}`}>

        {/* HEADER */}
        <header className="relative z-[100] flex items-center justify-between mb-12">
          <div className="relative z-[110]">
            <div
              // ICI : On force l'ouverture si le bouton Clerk fait la sourde oreille
              onClick={() => {
                console.log("Clic sur le container détecté");
                // openUserProfile() est la fonction de secours
              }}
              className="flex items-center gap-4 mb-6 bg-white/10 p-2 rounded-full w-fit border border-white/20 shadow-2xl backdrop-blur-xl hover:bg-white/20 transition-all cursor-pointer"
            >
              <div className="scale-125 origin-left ml-1">
                {/* On enlève les styles complexes sur le UserButton pour laisser Clerk respirer */}
                <UserButton userProfileMode="modal" />
              </div>

              <span className="font-bold pr-4 text-sm tracking-wide text-white">
                {user?.firstName || "Utilisateur"}
              </span>
            </div>

            <h1 className="text-8xl font-black uppercase tracking-tighter leading-none pointer-events-none">
              {format(currentMonth, 'MMMM', { locale: fr })}
            </h1>
            <div className="h-2 w-24 bg-gradient-to-r from-blue-600 via-purple-500 to-red-600 mt-4 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.6)]" />
          </div>

          <div className="flex gap-4 relative z-[110]">
            <button onClick={prevMonth} className="p-6 bg-white/5 hover:bg-white/10 rounded-3xl border border-white/10 transition-all active:scale-90">
              <ChevronLeft size={32} />
            </button>
            <button onClick={nextMonth} className="p-6 bg-white/5 hover:bg-white/10 rounded-3xl border border-white/10 transition-all active:scale-90">
              <ChevronRight size={32} />
            </button>
          </div>
        </header>

        {/* GRILLE DU CALENDRIER */}
        <div className="flex-1 relative">
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
              {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((d) => (
                <div key={d} className="text-center text-white/20 font-black text-xs uppercase tracking-[0.3em] mb-2">{d}</div>
              ))}

              {days.map((day, idx) => {
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, currentMonth);

                return (
                  <motion.button
                    key={idx}
                    whileHover={isCurrentMonth ? { scale: 1.02 } : {}}
                    onClick={() => isCurrentMonth && handleDateClick(day)}
                    className={`relative flex flex-col items-center justify-center rounded-[2.5rem] border transition-all duration-300 
                      ${isSelected ? 'bg-gradient-to-br from-blue-600 to-red-600 border-white/50 shadow-2xl z-20' :
                        isCurrentMonth ? 'bg-white/5 border-white/10 backdrop-blur-md' : 'opacity-0 pointer-events-none'}`}
                  >
                    <span className={`text-5xl font-black ${isSelected ? 'text-white' : 'text-white/90'}`}>
                      {format(day, 'd')}
                    </span>
                  </motion.button>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* TIROIR (DRAWER) */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[998]"
            />

            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 z-[999] w-full max-w-xl h-full bg-black/80 backdrop-blur-3xl border-l border-white/10 p-12 flex flex-col shadow-2xl"
            >
              <button onClick={() => setIsDrawerOpen(false)} className="self-end p-2 hover:bg-white/10 rounded-full mb-8">
                <X size={40} className="text-white/30 hover:text-white" />
              </button>

              <div className="flex items-center gap-3 text-blue-500 mb-4">
                <MessageSquare size={24} />
                <span className="font-black uppercase tracking-[0.3em] text-sm">Journal de Bord</span>
              </div>

              <h3 className="text-6xl font-black mb-10 capitalize leading-tight">
                {format(selectedDate, 'EEEE d MMMM', { locale: fr })}
              </h3>

              <textarea
                autoFocus
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Écris tes pensées ici..."
                className="w-full flex-1 bg-white/5 border border-white/10 rounded-[3rem] p-10 text-2xl text-white focus:outline-none focus:border-red-500/50 transition-all resize-none mb-10 shadow-inner"
              />

              <button
                onClick={handleSave}
                className="w-full py-8 bg-gradient-to-r from-blue-600 to-red-600 rounded-[2rem] font-black text-2xl flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Save size={32} /> ENREGISTRER
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}