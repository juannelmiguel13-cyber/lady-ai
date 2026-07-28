'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Shield, Brain, ChefHat, AlertTriangle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import OnboardingForm from '@/components/onboarding/OnboardingForm';
import Dashboard from '@/components/dashboard/Dashboard';
import SplashScreen from '@/components/ui/SplashScreen';
import PatientList from '@/components/patients/PatientList';
import Modal from '@/components/ui/Modal';

export interface UserProfile {
  id?: string;
  photo?: string;
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

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const [patients, setPatients] = useState<UserProfile[]>([]);
  const [currentView, setCurrentView] = useState<'list' | 'form' | 'dashboard'>('list');
  const [activePatient, setActivePatient] = useState<UserProfile | null>(null);
  const [editingPatient, setEditingPatient] = useState<UserProfile | undefined>(undefined);

  const [patientToDelete, setPatientToDelete] = useState<string | null>(null);

  // Cargar pacientes desde localStorage
  useEffect(() => {
    const saved = localStorage.getItem('lady_ia_patients');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setPatients(parsed);
        }
      } catch (e) {
        console.error('Error parsing patients from local storage');
      }
    }
  }, []);

  // Fallback para ocultar el splash si la animación falla
  useEffect(() => {
    if (showSplash) {
      const timer = setTimeout(() => setShowSplash(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showSplash]);

  const savePatients = (newPatients: UserProfile[]) => {
    setPatients(newPatients);
    localStorage.setItem('lady_ia_patients', JSON.stringify(newPatients));
  };

  const handleSavePatient = (profile: UserProfile) => {
    let updatedPatients;
    if (profile.id) {
      // Editar existente
      updatedPatients = patients.map((p) => (p.id === profile.id ? profile : p));
    } else {
      // Crear nuevo
      const newProfile = { ...profile, id: crypto.randomUUID() };
      updatedPatients = [...patients, newProfile];
    }
    savePatients(updatedPatients);
    setCurrentView('list');
    setEditingPatient(undefined);
  };

  const confirmDeletePatient = (id: string) => {
    setPatientToDelete(id);
  };

  const executeDeletePatient = () => {
    if (patientToDelete) {
      const updatedPatients = patients.filter((p) => p.id !== patientToDelete);
      savePatients(updatedPatients);
      setPatientToDelete(null);
    }
  };

  const renderContent = () => {
    if (showSplash) return null;

    switch (currentView) {
      case 'list':
        return (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="flex-1 flex flex-col p-4 pt-8"
          >
            <PatientList
              patients={patients}
              onSelectPatient={(p) => {
                setActivePatient(p);
                setCurrentView('dashboard');
              }}
              onEditPatient={(p) => {
                setEditingPatient(p);
                setCurrentView('form');
              }}
              onDeletePatient={confirmDeletePatient}
              onCreateNew={() => {
                setEditingPatient(undefined);
                setCurrentView('form');
              }}
            />
          </motion.div>
        );

      case 'form':
        return (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="flex-1 flex flex-col"
          >
            <section className="mx-auto max-w-6xl px-4 pt-12 pb-8 text-center">
              <h2 className="text-3xl font-bold text-white mb-2">
                {editingPatient ? 'Editar Paciente' : 'Nuevo Paciente'}
              </h2>
              <p className="text-zinc-400">
                {editingPatient ? 'Actualiza los datos del paciente' : 'Ingresa los datos para crear un nuevo perfil clínico'}
              </p>
            </section>
            <section className="mx-auto max-w-6xl w-full px-4 pb-16">
              <OnboardingForm 
                initialData={editingPatient} 
                onComplete={handleSavePatient}
                onCancel={() => {
                  setCurrentView('list');
                  setEditingPatient(undefined);
                }}
              />
            </section>
          </motion.div>
        );

      case 'dashboard':
        return activePatient ? (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex-1 flex flex-col p-4 pt-8"
          >
            <Dashboard 
              userProfile={activePatient} 
              onBack={() => {
                setCurrentView('list');
                setActivePatient(null);
              }}
            />
          </motion.div>
        ) : null;

      default:
        return null;
    }
  };

  return (
    <>
      <AnimatePresence>
        {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      </AnimatePresence>

      <main className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="w-full border-b border-white/[0.06] bg-white/[0.02] backdrop-blur-md sticky top-0 z-30">
          <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/25">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white tracking-tight">Lady IA</h1>
                <p className="text-xs text-zinc-500">Panel para Especialistas</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5">
                <Shield className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-xs font-medium text-emerald-400">Validado Clínicamente</span>
              </div>
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>

        {/* Modal de confirmación de eliminación */}
        <Modal
          isOpen={patientToDelete !== null}
          onClose={() => setPatientToDelete(null)}
          title="Eliminar Paciente"
          primaryAction={{
            label: 'Sí, eliminar',
            onClick: executeDeletePatient,
            variant: 'danger',
          }}
          secondaryAction={{
            label: 'Cancelar',
            onClick: () => setPatientToDelete(null),
          }}
        >
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-red-500/10 text-red-400 mt-1 flex-shrink-0">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-white font-medium mb-1">¿Eliminar este paciente?</h4>
              <p className="text-sm text-zinc-400">
                Se borrarán todos sus datos, historial médico y dietas generadas. Esta acción no se puede deshacer.
              </p>
            </div>
          </div>
        </Modal>

        {/* Footer */}
        <footer className="mt-auto border-t border-white/[0.06] bg-white/[0.02]">
          <div className="mx-auto max-w-6xl px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-zinc-600">
              © 2026 Lady IA — Nutrición Clínica Inteligente. Todos los derechos reservados.
            </p>
            <p className="text-xs text-zinc-700">
              ⚕️ Esta herramienta es de soporte y no sustituye el criterio médico.
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}
