import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const MOODS = [
  { id: "happy", emoji: "😊", label: "Feliz" },
  { id: "excited", emoji: "⚡", label: "Animado" },
  { id: "calm", emoji: "🌊", label: "Calmo" },
  { id: "focused", emoji: "🎯", label: "Focado" },
  { id: "tired", emoji: "🔋", label: "Cansado" },
  { id: "stressed", emoji: "😤", label: "Estressado" },
  { id: "sad", emoji: "😢", label: "Triste" },
  { id: "anxious", emoji: "😰", label: "Ansioso" },
  { id: "romantic", emoji: "💕", label: "Romântico" },
  { id: "playful", emoji: "🎉", label: "Divertido" },
] as const;

export type MoodId = (typeof MOODS)[number]["id"];

export interface MoodPickerProps {
  value?: MoodId;
  onChange?: (mood: MoodId) => void;
  disabled?: boolean;
  className?: string;
}

export function MoodPicker({
  value,
  onChange,
  disabled = false,
  className,
}: MoodPickerProps) {
  const handleSelect = (moodId: MoodId) => {
    if (!disabled && onChange) {
      onChange(moodId);
    }
  };

  return (
    <div
      className={cn(
        "grid grid-cols-5 gap-3 sm:gap-4 p-4 bg-white/50 rounded-3xl border border-primary/10",
        className
      )}
    >
      {MOODS.map((mood, index) => (
        <motion.button
          key={mood.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.04 }}
          whileHover={{ scale: disabled ? 1 : 1.1 }}
          whileTap={{ scale: disabled ? 1 : 0.95 }}
          onClick={() => handleSelect(mood.id)}
          disabled={disabled}
          className={cn(
            "flex flex-col items-center gap-2 p-3 rounded-2xl transition-all",
            value === mood.id
              ? "bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-primary shadow-md scale-105"
              : "bg-white/70 border-2 border-transparent hover:border-primary/30 hover:bg-white",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          type="button"
        >
          <span className="text-3xl sm:text-4xl">{mood.emoji}</span>
          <span
            className={cn(
              "text-xs font-bold text-center",
              value === mood.id
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            {mood.label}
          </span>
        </motion.button>
      ))}
    </div>
  );
}
