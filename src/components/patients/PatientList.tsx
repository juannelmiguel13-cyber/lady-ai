import { motion } from 'framer-motion';
import { User, Activity, Edit2, Trash2 } from 'lucide-react';
import { UserProfile } from '@/app/page';

interface PatientListProps {
  patients: UserProfile[];
  onSelectPatient: (patient: UserProfile) => void;
  onEditPatient: (patient: UserProfile) => void;
  onDeletePatient: (id: string) => void;
  onCreateNew: () => void;
}

export default function PatientList({
  patients,
  onSelectPatient,
  onEditPatient,
  onDeletePatient,
  onCreateNew,
}: PatientListProps) {
  return (
    <div className="mx-auto max-w-6xl w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Mis Pacientes</h2>
          <p className="text-zinc-400">Gestiona los perfiles y dietas de tus pacientes</p>
        </div>
        <button
          onClick={onCreateNew}
          className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 transition-colors"
        >
          <User className="h-4 w-4" />
          Nuevo Paciente
        </button>
      </div>

      {patients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-white/[0.1] rounded-2xl bg-white/[0.02]">
          <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
            <User className="h-8 w-8 text-emerald-400" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No tienes pacientes aún</h3>
          <p className="text-zinc-400 mb-6 max-w-sm">
            Comienza añadiendo tu primer paciente para generar su perfil nutricional y dietas con IA.
          </p>
          <button
            onClick={onCreateNew}
            className="flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-medium text-white hover:bg-emerald-600 transition-colors"
          >
            Añadir Paciente
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {patients.map((patient) => (
            <motion.div
              key={patient.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="group relative flex flex-col rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 hover:bg-white/[0.04] transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full overflow-hidden bg-zinc-800 flex-shrink-0 border border-white/[0.1]">
                    {patient.photo ? (
                      <img src={patient.photo} alt={patient.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-emerald-500/10">
                        <User className="h-6 w-6 text-emerald-400" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white line-clamp-1">{patient.name || 'Sin nombre'}</h3>
                    <p className="text-sm text-zinc-400">{patient.age} años • {patient.sex === 'M' ? 'Hombre' : 'Mujer'}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); onEditPatient(patient); }}
                    className="p-1.5 rounded-lg bg-white/[0.05] text-zinc-400 hover:text-white hover:bg-white/[0.1] transition-colors"
                    title="Editar paciente"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeletePatient(patient.id!); }}
                    className="p-1.5 rounded-lg bg-white/[0.05] text-red-400 hover:text-red-300 hover:bg-red-400/20 transition-colors"
                    title="Eliminar paciente"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-6">
                <div className="rounded-lg bg-black/20 p-2 text-center">
                  <p className="text-xs text-zinc-500 mb-0.5">Peso actual</p>
                  <p className="font-medium text-zinc-200">{patient.currentWeight} kg</p>
                </div>
                <div className="rounded-lg bg-black/20 p-2 text-center">
                  <p className="text-xs text-zinc-500 mb-0.5">Objetivo</p>
                  <p className="font-medium text-emerald-400">{patient.targetWeight} kg</p>
                </div>
              </div>

              <button
                onClick={() => onSelectPatient(patient)}
                className="mt-auto w-full flex items-center justify-center gap-2 rounded-xl bg-white/[0.05] py-2.5 text-sm font-medium text-white hover:bg-white/[0.1] transition-colors border border-white/[0.05]"
              >
                <Activity className="h-4 w-4" />
                Ver Dashboard
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
