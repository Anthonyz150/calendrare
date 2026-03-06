"use client";

import React, { useState } from 'react';
import {
  format, addMonths, subMonths, startOfMonth, endOfMonth,
  startOfWeek, endOfWeek, isSameMonth, isSameDay, eachDayOfInterval
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
// 1. Importation des outils Clerk
import { UserButton, useUser } from "@clerk/nextjs";

export default function RebirthCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [direction, setDirection] = useState(0);

  // 2. Récupération de l'utilisateur actuel
  const { user } = useUser();

  const nextMonth = () => {
    setDirection(1);
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const prevMonth = () => {
    setDirection(-1);
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 }),
  });

  return (
    <main className="h-screen w-screen overflow-hidden bg-black flex flex-col font-sans relative">

      {/* LE FOND */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_#1e3a8a,_black,_#7f1d1d)]" />
        <div className="absolute inset-0 backdrop-blur-3xl opacity-50" />
      </div>

      <div className="relative z-10 flex flex-col h-full w-full p-8 md:p-16">

        {/* HEADER MODIFIÉ POUR L'UTILISATEUR */}
        <header className="flex items-center justify-between mb-12">
          <motion.div
            key={currentMonth.getMonth()}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-4 mb-2 bg-white/10 p-2 rounded-full">
              <UserButton afterSignOutUrl="/" />
              {!user && <span className="text-white text-xs">Déconnecté</span>}
              {user && <span className="text-white font-bold">{user.firstName}</span>}
            </div>
            <h1 className="text-6xl font-black text-white uppercase tracking-tight">
              {format(currentMonth, 'MMMM', { locale: fr })}
            </h1>
            <div className="h-1.5 w-32 bg-gradient-to-r from-blue-500 to-red-500 mt-2 rounded-full" />
          </motion.div>

          <div className="flex gap-4">
            <button onClick={prevMonth} className="p-5 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 text-white transition-all active:scale-90">
              <ChevronLeft size={32} />
            </button>
            <button onClick={nextMonth} className="p-5 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 text-white transition-all active:scale-90">
              <ChevronRight size={32} />
            </button>
          </div>
        </header>

        {/* GRILLE (Inchangée mais toujours aussi fluide) */}
        <div className="flex-1 relative">
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={currentMonth.toString()}
              custom={direction}
              initial={{ x: direction * 800, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction * -800, opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 450,
                damping: 35,
                opacity: { duration: 0.2 }
              }}
              className="grid grid-cols-7 gap-4 w-full h-full"
            >
              {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((d) => (
                <div key={d} className="text-center text-white/30 font-bold text-sm uppercase tracking-widest">
                  {d}
                </div>
              ))}

              {days.map((day, idx) => {
                const isToday = isSameDay(day, new Date());
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, currentMonth);

                return (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSelectedDate(day)}
                    className={`
                      relative flex flex-col items-center justify-center rounded-[2rem] border transition-all duration-200
                      ${isSelected
                        ? 'bg-gradient-to-br from-blue-600 to-red-600 border-white/20 shadow-2xl shadow-blue-900/40'
                        : isCurrentMonth ? 'bg-white/5 border-white/5 hover:border-white/20 backdrop-blur-md' : 'opacity-0 pointer-events-none'
                      }
                    `}
                  >
                    <span className={`text-4xl font-bold text-white`}>
                      {format(day, 'd')}
                    </span>
                    {isToday && !isSelected && (
                      <div className="absolute top-4 right-4 h-3 w-3 bg-blue-400 rounded-full shadow-[0_0_15px_#3b82f6]" />
                    )}
                  </motion.button>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}