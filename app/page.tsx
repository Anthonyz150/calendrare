"use client";

import React, { useState } from 'react';
import { 
  format, addMonths, subMonths, startOfMonth, endOfMonth, 
  startOfWeek, endOfWeek, isSameMonth, isSameDay, eachDayOfInterval 
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, X, Save, Calendar as CalendarIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserButton, useUser } from "@clerk/nextjs";

export default function RebirthCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [direction, setDirection] = useState(0); 
  
  // NOUVEAUX ÉTATS POUR LES NOTES
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [note, setNote] = useState("");

  const { user } = useUser();

  const handleDateClick = (day: Date) => {
    setSelectedDate(day);
    setIsDrawerOpen(true);
    // Ici on chargera plus tard la note depuis la base de données
  };

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 }),
  });

  return (
    <main className="h-screen w-screen overflow-hidden bg-black flex font-sans relative">
      
      {/* FOND CONSTANT */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_#1e3a8a,_black,_#7f1d1d)]" />
        <div className="absolute inset-0 backdrop-blur-3xl opacity-50" />
      </div>

      {/* PARTIE GAUCHE : LE CALENDRIER */}
      <div className="relative z-10 flex flex-col h-full flex-1 p-8 md:p-16 transition-all duration-500">
        <header className="flex items-center justify-between mb-12">
          <motion.div key={currentMonth.getMonth()} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-4 mb-2">
              <UserButton />
              <h2 className="text-white/50 text-xl font-medium">Salut, {user?.firstName || "l'ami"} !</h2>
            </div>
            <h1 className="text-6xl font-black text-white uppercase tracking-tight">
              {format(currentMonth, 'MMMM', { locale: fr })}
            </h1>
          </motion.div>

          <div className="flex gap-4">
            <button onClick={() => { setDirection(-1); setCurrentMonth(subMonths(currentMonth, 1)); }} className="p-5 bg-white/5 hover:bg-white/10 rounded-2xl text-white transition-all"><ChevronLeft size={32} /></button>
            <button onClick={() => { setDirection(1); setCurrentMonth(addMonths(currentMonth, 1)); }} className="p-5 bg-white/5 hover:bg-white/10 rounded-2xl text-white transition-all"><ChevronRight size={32} /></button>
          </div>
        </header>

        <div className="flex-1 relative">
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={currentMonth.toString()}
              custom={direction}
              initial={{ x: direction * 500, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction * -500, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 40 }}
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
                    whileHover={{ scale: 1.03 }}
                    onClick={() => isCurrentMonth && handleDateClick(day)}
                    className={`relative flex flex-col items-center justify-center rounded-[2rem] border transition-all
                      ${isSelected ? 'bg-gradient-to-br from-blue-600 to-red-600 border-white/20' : isCurrentMonth ? 'bg-white/5 border-white/5 hover:border-white/20 backdrop-blur-md' : 'opacity-0 pointer-events-none'}
                    `}
                  >
                    <span className="text-4xl font-bold text-white">{format(day, 'd')}</span>
                    {isToday && !isSelected && <div className="absolute top-4 right-4 h-3 w-3 bg-blue-400 rounded-full shadow-[0_0_15px_#3b82f6]" />}
                  </motion.button>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* PARTIE DROITE : LE TIROIR (SIDEBAR) */}
      <AnimatePresence>
        {isDrawerOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative z-20 w-full max-w-md h-full bg-white/10 backdrop-blur-3xl border-l border-white/20 p-10 flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.5)]"
          >
            <button onClick={() => setIsDrawerOpen(false)} className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors">
              <X size={32} />
            </button>

            <div className="mt-12">
              <div className="flex items-center gap-3 text-blue-400 mb-2">
                <CalendarIcon size={20} />
                <span className="font-bold uppercase tracking-widest text-sm">Événement pour le</span>
              </div>
              <h3 className="text-4xl font-black text-white capitalize mb-8">
                {format(selectedDate, 'do MMMM', { locale: fr })}
              </h3>

              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Qu'est-ce qu'on prévoit ?"
                className="w-full h-64 bg-white/5 border border-white/10 rounded-3xl p-6 text-white text-lg focus:outline-none focus:border-blue-500 transition-colors resize-none placeholder:text-white/20"
              />

              <button 
                onClick={() => {
                  alert("Bientôt sauvegardé dans Supabase !");
                  setIsDrawerOpen(false);
                }}
                className="mt-6 w-full py-5 bg-white text-black rounded-2xl font-black text-xl flex items-center justify-center gap-3 hover:bg-blue-500 hover:text-white transition-all active:scale-95 shadow-xl"
              >
                <Save size={24} />
                ENREGISTRER
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}