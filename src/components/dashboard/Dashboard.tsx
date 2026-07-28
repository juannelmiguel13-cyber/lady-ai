'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, MessageSquare, Scale, Calendar, ChevronRight, Apple, Zap, Loader2 } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import ChatSidebar from '@/components/chat/ChatSidebar';
import Modal from '@/components/ui/Modal';
import { toast } from 'sonner';

// Reusing UserProfile type without importing from page to avoid circular deps if any
interface UserProfile {
  name: string;
  age: string;
  sex: string;
  height: string;
  currentWeight: string;
  targetWeight: string;
  activityLevel: string;
  conditions: string[];
  allergies: string[];
}

interface DashboardProps {
  userProfile: UserProfile;
  onBack: () => void;
}

export default function Dashboard({ userProfile, onBack }: DashboardProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [isRegenerateModalOpen, setIsRegenerateModalOpen] = useState(false);
  
  const [dietPlan, setDietPlan] = useState<Record<string, string | number> | null>(null);
  const [isLoadingDiet, setIsLoadingDiet] = useState(true);

  const mainCondition = userProfile.conditions[0] || 'default';
  const userName = userProfile.name;

  useEffect(() => {
    // Generar la dieta al montar el Dashboard
    const fetchDiet = async () => {
      try {
        // En una app real, el TMB se calcularía aquí o vendría del backend
        const tmb = 1800; // Mock TMB

        const res = await fetch('/api/generate-diet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profile: userProfile, tmb }),
        });

        const data = await res.json();
        if (data.success) {
          setDietPlan(data.data);
        } else {
          toast.error('Error al generar la dieta');
        }
      } catch {
        toast.error('Error de conexión con el motor de IA');
      } finally {
        setIsLoadingDiet(false);
      }
    };

    fetchDiet();
  }, [userProfile]);

  const handleUpdateWeight = () => {
    toast.success('¡Peso actualizado con éxito! Tu ingesta calórica se ha recalculado.');
    setIsWeightModalOpen(false);
  };

  const handleRegenerateMenu = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: 'Analizando restricciones y regenerando menú...',
        success: '¡Menú regenerado exitosamente con alternativas permitidas!',
        error: 'Error al regenerar el menú',
      }
    );
    setIsRegenerateModalOpen(false);
  };

  const getSubtitle = () => {
    if (mainCondition === 'diabetes-1' || mainCondition === 'diabetes-2') {
      return 'Tu plan metabólico para el control glucémico está activo y optimizado.';
    }
    if (mainCondition === 'hipertension') {
      return 'Tu plan metabólico bajo en sodio está activo y optimizado.';
    }
    if (mainCondition === 'insuficiencia-renal') {
      return 'Tu plan nutricional de protección renal está activo y optimizado.';
    }
    return 'Tu plan nutricional personalizado está activo y optimizado.';
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in zoom-in duration-500">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-2"
      >
        <span className="text-xl">←</span> Volver a pacientes
      </button>

      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-white mb-2"
          >
            Paciente: {userName || 'Usuario'}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-zinc-400"
          >
            {getSubtitle()}
          </motion.p>
        </div>
        <Button onClick={() => setIsChatOpen(true)} className="md:w-auto w-full group">
          <MessageSquare className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
          Consultar con la IA
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard 
          glow 
          className="cursor-pointer hover:-translate-y-1 transition-transform duration-300"
          onClick={() => setIsRegenerateModalOpen(true)}
        >
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <Apple className="h-6 w-6 text-orange-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Mi Dieta de Hoy</h3>
              <p className="text-sm text-zinc-400">Ver o modificar ingestas</p>
            </div>
            <ChevronRight className="h-5 w-5 text-zinc-500 ml-auto" />
          </div>
        </GlassCard>

        <GlassCard 
          className="cursor-pointer hover:-translate-y-1 transition-transform duration-300"
          onClick={() => setIsChatOpen(true)}
        >
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Zap className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Asistente Clínico</h3>
              <p className="text-sm text-zinc-400">Resolver dudas 24/7</p>
            </div>
            <ChevronRight className="h-5 w-5 text-zinc-500 ml-auto" />
          </div>
        </GlassCard>

        <GlassCard 
          className="cursor-pointer hover:-translate-y-1 transition-transform duration-300"
          onClick={() => setIsWeightModalOpen(true)}
        >
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Scale className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Actualizar Peso</h3>
              <p className="text-sm text-zinc-400">Recalcular requerimientos</p>
            </div>
            <ChevronRight className="h-5 w-5 text-zinc-500 ml-auto" />
          </div>
        </GlassCard>
      </div>

      {/* Main Content Area */}
      <GlassCard className="min-h-[400px] flex flex-col p-8 border-white/[0.08]">
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="h-6 w-6 text-emerald-400" />
          <h3 className="text-xl font-semibold text-white">Tu Plan Diario</h3>
        </div>
        
        {isLoadingDiet ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <Loader2 className="h-10 w-10 text-emerald-500 animate-spin mb-4" />
            <h4 className="text-lg font-medium text-white mb-2">Construyendo menú...</h4>
            <p className="text-zinc-500 max-w-sm text-sm">
              El motor de IA está procesando tus restricciones clínicas y diseñando tu menú a medida.
            </p>
          </div>
        ) : dietPlan ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <h4 className="text-emerald-400 font-medium mb-1">Desayuno</h4>
                <p className="text-zinc-300 text-sm">{dietPlan.desayuno}</p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <h4 className="text-emerald-400 font-medium mb-1">Almuerzo</h4>
                <p className="text-zinc-300 text-sm">{dietPlan.almuerzo}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <h4 className="text-emerald-400 font-medium mb-1">Cena</h4>
                <p className="text-zinc-300 text-sm">{dietPlan.cena}</p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <h4 className="text-emerald-400 font-medium mb-1">Snacks</h4>
                <p className="text-zinc-300 text-sm">{dietPlan.snacks}</p>
              </div>
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mt-4 flex items-center justify-between">
                <span className="text-white font-medium">Total Calorías:</span>
                <span className="text-emerald-400 font-bold text-lg">{dietPlan.totalCalorias} kcal</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-red-400">
            Hubo un error al generar la dieta.
          </div>
        )}
      </GlassCard>

      {/* Slide-out Chat */}
      <ChatSidebar 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        userProfile={userProfile}
      />

      {/* Modals */}
      <Modal
        isOpen={isWeightModalOpen}
        onClose={() => setIsWeightModalOpen(false)}
        title="Actualizar Peso Actual"
        primaryAction={{ label: 'Guardar y Recalcular', onClick: handleUpdateWeight }}
        secondaryAction={{ label: 'Cancelar', onClick: () => setIsWeightModalOpen(false) }}
      >
        <p className="mb-4 text-sm">
          Ingresa tu peso actual para que la IA ajuste tus macronutrientes automáticamente.
        </p>
        <div className="flex items-center gap-3">
          <input 
            type="number" 
            placeholder="Ej: 72"
            className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition"
          />
          <span className="text-zinc-500 font-medium">kg</span>
        </div>
      </Modal>

      <Modal
        isOpen={isRegenerateModalOpen}
        onClose={() => setIsRegenerateModalOpen(false)}
        title="Regenerar Menú"
        primaryAction={{ label: 'Sí, regenerar menú', onClick: handleRegenerateMenu }}
        secondaryAction={{ label: 'Cancelar', onClick: () => setIsRegenerateModalOpen(false) }}
      >
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-full bg-amber-500/10 text-amber-400 mt-1">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-white font-medium mb-1">¿Deseas regenerar el menú de hoy?</h4>
            <p className="text-sm text-zinc-400">
              Si te faltan ingredientes o no te apetece alguna comida, la IA puede crear una alternativa manteniendo tu balance calórico y respetando tus restricciones.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
