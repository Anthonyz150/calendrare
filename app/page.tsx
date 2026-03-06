"use client";

import React, { useState } from 'react';
import {
  format, addMonths, subMonths, startOfMonth, endOfMonth,
  startOfWeek, endOfWeek, isSameMonth, isSameDay, eachDayOfInterval
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, X, Save, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserButton, useUser } from "@clerk/nextjs";
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default function RebirthCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [direction, setDirection] = useState(0);

  // États pour le tiroir et les notes
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [note, setNote] = useState("");

  const { user } = useUser();

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
      .from('events') // Nom de ta table sur Supabase
      .upsert({
        user_id: user.id,
        date: format(selectedDate, 'yyyy-MM-dd'),
        content: note
      });

    if (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      alert("Erreur de sauvegarde !");
    } else {
      setIsDrawerOpen(false);
      alert("Note enregistrée avec succès !");
    }
  };

  const handleDateClick = (day: Date) => {
    setSelectedDate(day);
    setIsDrawerOpen(true);
    // On réinitialise la note (on la chargera depuis Supabase plus tard)
    setNote("");
  };

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 }),
  });

  return (
    <main className="h-screen w-screen overflow-hidden bg-black flex font-sans relative">

      {/* LE FOND */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_#1e3a8a,_black,_#7f1d1d)]" />
        <div className="absolute inset-0 backdrop-blur-3xl opacity-50" />
      </div>

      {/* SECTION CALENDRIER (Flex-1 prend toute la place restante) */}
      <div className={`relative z-10 flex flex-col h-full flex-1 p-8 md:p-16 transition-all duration-500 ${isDrawerOpen ? 'pr-4 opacity-50 scale-[0.98]' : ''}`}>

        <header className="flex items-center justify-between mb-12">
          <motion.div
            key={currentMonth.getMonth()}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-4 mb-2 bg-white/10 p-2 rounded-full w-fit border border-white/20 shadow-xl relative z-50">
              <UserButton />
              {user && <span className="text-white font-bold pr-2">{user.firstName}</span>}
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

        <div className="flex-1 relative">
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={currentMonth.toString()}
              custom={direction}
              initial={{ x: direction * 800, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction * -800, opacity: 0 }}
              transition={{ type: "spring", stiffness: 450, damping: 35, opacity: { duration: 0.2 } }}
              className="grid grid-cols-7 gap-4 w-full h-full"
            >
              {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((d) => (
                <div key={d} className="text-center text-white/30 font-bold text-sm uppercase tracking-widest">{d}</div>
              ))}

              {days.map((day, idx) => {
                const isToday = isSameDay(day, new Date());
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, currentMonth);

                return (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.05 }}
                    // C'EST CETTE LIGNE QUI OUVRE LA SIDEBAR :
                    onClick={() => isCurrentMonth && handleDateClick(day)} 
                    className={`relative flex flex-col items-center justify-center rounded-[2rem] border ...`}
                  >
                    <span className="text-4xl font-bold text-white">{format(day, 'd')}</span>
                  </motion.button>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* TIROIR LATÉRAL (SIDEBAR) */}
      <AnimatePresence>
        {isDrawerOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative z-30 w-full max-w-md h-full bg-black/40 backdrop-blur-3xl border-l border-white/10 p-10 flex flex-col shadow-2xl"
          >
            <button onClick={() => setIsDrawerOpen(false)} className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors">
              <X size={32} />
            </button>

            <div className="mt-12">
              <div className="flex items-center gap-3 text-blue-400 mb-4">
                <MessageSquare size={20} />
                <span className="font-bold uppercase tracking-[0.2em] text-xs">Note du jour</span>
              </div>

              <h3 className="text-4xl font-black text-white mb-8 capitalize">
                {format(selectedDate, 'EEEE d MMMM', { locale: fr })}
              </h3>

              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Écris quelque chose..."
                className="w-full h-64 bg-white/5 border border-white/10 rounded-3xl p-6 text-white text-lg focus:outline-none focus:border-red-500/50 transition-all resize-none mb-6"
              />

              <button
                onClick={() => {
                  alert("On va envoyer '" + note + "' vers Supabase !");
                  setIsDrawerOpen(false);
                }}
                className="w-full py-5 bg-gradient-to-r from-blue-600 to-red-600 text-white rounded-2xl font-bold text-xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-blue-900/20"
              >
                <Save size={24} />
                Enregistrer
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}