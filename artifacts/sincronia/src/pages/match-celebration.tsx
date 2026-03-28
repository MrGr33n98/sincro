import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles, Star, Zap, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUpdateCoupleProfile } from "@workspace/api-client-react";

const WIZARD_STEPS = [
  {
    id: 1,
    title: "Bem-vindos ao Match! 💕",
    description: "Vocês dois agora estão conectados no Sincronia. Vamos configurar o perfil do casal?",
    icon: "💑",
  },
  {
    id: 2,
    title: "Quando se conheceram?",
    description: "Conte para a gente quando essa história de amor começou.",
    icon: "📅",
  },
  {
    id: 3,
    title: "O que gostam de fazer juntos?",
    description: "Assim podemos sugerir dates perfeitos para vocês!",
    icon: "🎯",
  },
  {
    id: 4,
    title: "Tudo pronto! ✨",
    description: "Seu casal está configurado. Vamos começar essa jornada?",
    icon: "🎉",
  },
];

export default function MatchCelebration() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [anniversaryDate, setAnniversaryDate] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const updateCoupleProfile = useUpdateCoupleProfile();

  const INTERESTS_OPTIONS = [
    { id: "outdoor", label: "Ar livre 🏞️" },
    { id: "gastronomy", label: "Gastronomia 🍷" },
    { id: "culture", label: "Cultura 🎭" },
    { id: "adventure", label: "Aventura 🧗" },
    { id: "relax", label: "Relaxar 🧘" },
    { id: "movies", label: "Filmes 🎬" },
    { id: "music", label: "Música 🎵" },
    { id: "sports", label: "Esportes ⚽" },
  ];

  const toggleInterest = (id: string) => {
    setInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleNext = () => {
    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Save couple profile
      if (anniversaryDate) {
        updateCoupleProfile.mutate({
          anniversaryDate: new Date(anniversaryDate).toISOString().split("T")[0],
        });
      }
      setLocation("/app");
    }
  };

  // Celebration animation on mount
  const [showConfetti, setShowConfetti] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const step = WIZARD_STEPS[currentStep];
  const progress = ((currentStep + 1) / WIZARD_STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-pink-200/40 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-purple-200/40 blur-3xl" />
      </div>

      {/* Confetti */}
      <AnimatePresence>
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 50 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  y: -20,
                  x: Math.random() * window.innerWidth,
                  rotate: 0,
                }}
                animate={{
                  y: window.innerHeight + 20,
                  x: Math.random() * window.innerWidth,
                  rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
                className="absolute w-3 h-3 rounded-sm"
                style={{
                  backgroundColor:
                    ["#FF2E6D", "#DD4A6B", "#C48A9B", "#F19FB0"][
                      Math.floor(Math.random() * 4)
                    ],
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Main card */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl shadow-pink-200 border-4 border-white p-8 relative z-10"
      >
        {/* Progress bar */}
        <div className="mb-8">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
              className="h-full bg-gradient-to-r from-pink-500 to-purple-600 rounded-full"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Passo {currentStep + 1} de {WIZARD_STEPS.length}
          </p>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Icon */}
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center text-5xl">
              {step.icon}
            </div>

            {/* Title */}
            <h1 className="text-3xl font-black text-center text-burgundy-900 mb-3">
              {step.title}
            </h1>

            {/* Description */}
            <p className="text-center text-muted-foreground mb-8">
              {step.description}
            </p>

            {/* Step content */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <input
                  type="date"
                  value={anniversaryDate}
                  onChange={(e) => setAnniversaryDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-pink-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all"
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>
            )}

            {currentStep === 2 && (
              <div className="grid grid-cols-2 gap-3">
                {INTERESTS_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => toggleInterest(option.id)}
                    className={cn(
                      "p-4 rounded-2xl border-2 font-bold text-sm transition-all",
                      interests.includes(option.id)
                        ? "border-pink-500 bg-pink-50 text-pink-600"
                        : "border-gray-200 hover:border-pink-300"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 mt-8">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep((prev) => prev - 1)}
                  className="flex-1 rounded-full"
                >
                  Voltar
                </Button>
              )}

              <Button
                onClick={handleNext}
                className={cn(
                  "flex-1 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700",
                  currentStep === 2 && interests.length === 0 && "opacity-50"
                )}
                disabled={
                  currentStep === 2 &&
                  interests.length === 0
                }
              >
                {currentStep === WIZARD_STEPS.length - 1 ? (
                  <>
                    Começar
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </>
                ) : (
                  "Próximo"
                )}
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Decorative elements */}
        <div className="absolute -top-4 -right-4 w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center text-2xl shadow-lg">
          <Star className="w-8 h-8 fill-yellow-400 text-yellow-400" />
        </div>
      </motion.div>
    </div>
  );
}

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}
