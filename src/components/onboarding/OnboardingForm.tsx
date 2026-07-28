'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  User, Ruler, Weight, Target,
  Heart, AlertTriangle, Wheat, Brain, Droplets,
  ArrowRight, ArrowLeft, Sparkles, ShieldCheck,
  Syringe, Zap, FlaskConical
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import ConditionTag from '@/components/ui/ConditionTag';
import StepIndicator from '@/components/ui/StepIndicator';

interface UserProfile {
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

interface FormErrors {
  [key: string]: string;
}

const STEPS = [
  { id: 1, title: 'Datos Personales' },
  { id: 2, title: 'Biometría' },
  { id: 3, title: 'Historial Médico' },
];

const MEDICAL_CONDITIONS = [
  { id: 'diabetes-1', label: 'Diabetes Tipo 1', icon: <Syringe className="h-4 w-4" /> },
  { id: 'diabetes-2', label: 'Diabetes Tipo 2', icon: <Droplets className="h-4 w-4" /> },
  { id: 'hipertension', label: 'Hipertensión', icon: <Heart className="h-4 w-4" /> },
  { id: 'hipertiroidismo', label: 'Hipertiroidismo', icon: <Zap className="h-4 w-4" /> },
  { id: 'insuficiencia-renal', label: 'Insuficiencia Renal', icon: <FlaskConical className="h-4 w-4" /> },
  { id: 'celiaquia', label: 'Celiaquía', icon: <Wheat className="h-4 w-4" /> },
];

const FOOD_ALLERGIES = [
  { id: 'lactosa', label: 'Intolerancia a la Lactosa', icon: <Droplets className="h-4 w-4" /> },
  { id: 'gluten', label: 'Gluten', icon: <Wheat className="h-4 w-4" /> },
  { id: 'frutos-secos', label: 'Frutos Secos', icon: <Brain className="h-4 w-4" /> },
  { id: 'mariscos', label: 'Mariscos', icon: <AlertTriangle className="h-4 w-4" /> },
  { id: 'huevos', label: 'Huevos', icon: <AlertTriangle className="h-4 w-4" /> },
  { id: 'soja', label: 'Soja', icon: <AlertTriangle className="h-4 w-4" /> },
];

const SEX_OPTIONS = [
  { value: 'male', label: 'Masculino' },
  { value: 'female', label: 'Femenino' },
];

const ACTIVITY_OPTIONS = [
  { value: 'sedentary', label: 'Sedentario (poco o nada de ejercicio)' },
  { value: 'light', label: 'Ligero (1-3 días/semana)' },
  { value: 'moderate', label: 'Moderado (3-5 días/semana)' },
  { value: 'active', label: 'Activo (6-7 días/semana)' },
  { value: 'very-active', label: 'Muy Activo (atleta / trabajo físico)' },
];

export default function OnboardingForm({ 
  initialData, 
  onComplete,
  onCancel
}: { 
  initialData?: UserProfile; 
  onComplete?: (profile: UserProfile) => void;
  onCancel?: () => void;
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profile, setProfile] = useState<UserProfile>(initialData || {
    name: '',
    age: '',
    sex: '',
    height: '',
    currentWeight: '',
    targetWeight: '',
    activityLevel: '',
    conditions: [],
    allergies: [],
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [warnings, setWarnings] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const updateField = useCallback((field: keyof UserProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
    setWarnings((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const handlePhotoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('La imagen no debe superar los 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        updateField('photo', base64String);
      };
      reader.readAsDataURL(file);
    }
  }, [updateField]);

  const toggleCondition = useCallback((conditionId: string) => {
    setProfile((prev) => ({
      ...prev,
      conditions: prev.conditions.includes(conditionId)
        ? prev.conditions.filter((c) => c !== conditionId)
        : [...prev.conditions, conditionId],
    }));
  }, []);

  const toggleAllergy = useCallback((allergyId: string) => {
    setProfile((prev) => ({
      ...prev,
      allergies: prev.allergies.includes(allergyId)
        ? prev.allergies.filter((a) => a !== allergyId)
        : [...prev.allergies, allergyId],
    }));
  }, []);

  const validateStep = useCallback(
    (step: number): boolean => {
      const newErrors: FormErrors = {};
      const newWarnings: FormErrors = {};

      if (step === 1) {
        if (!profile.name.trim()) newErrors.name = 'El nombre es obligatorio';
        if (!profile.age || parseInt(profile.age) < 12 || parseInt(profile.age) > 120)
          newErrors.age = 'Edad debe estar entre 12 y 120 años';
        if (!profile.sex) newErrors.sex = 'Selecciona tu sexo biológico';
      }

      if (step === 2) {
        if (!profile.height || parseFloat(profile.height) < 100 || parseFloat(profile.height) > 250)
          newErrors.height = 'Altura debe estar entre 100 y 250 cm';
        
        if (!profile.currentWeight) {
          newErrors.currentWeight = 'Peso actual es obligatorio';
        } else if (parseFloat(profile.currentWeight) < 30 || parseFloat(profile.currentWeight) > 300) {
          newErrors.currentWeight = 'Peso debe estar entre 30 y 300 kg';
        } else if (parseFloat(profile.currentWeight) > 150) {
          newWarnings.currentWeight = 'Asegúrate de que este valor sea correcto.';
        }

        if (!profile.targetWeight) {
          newErrors.targetWeight = 'Peso objetivo es obligatorio';
        } else if (parseFloat(profile.targetWeight) < 30 || parseFloat(profile.targetWeight) > 300) {
          newErrors.targetWeight = 'Peso objetivo debe estar entre 30 y 300 kg';
        }

        if (!profile.activityLevel)
          newErrors.activityLevel = 'Selecciona tu nivel de actividad';
      }

      setErrors(newErrors);
      setWarnings(newWarnings);

      if (Object.keys(newErrors).length > 0) {
        toast.error('Por favor, corrige los campos marcados en rojo');
        return false;
      }
      return true;
    },
    [profile]
  );

  const nextStep = useCallback(() => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
      toast.success(
        currentStep === 1 ? '¡Datos personales guardados!' : '¡Datos biométricos guardados!'
      );
    }
  }, [currentStep, validateStep]);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }, []);

  const calculateTMB = useCallback(() => {
    const weight = parseFloat(profile.currentWeight);
    const height = parseFloat(profile.height);
    const age = parseInt(profile.age);

    // Mifflin-St Jeor formula
    let tmb: number;
    if (profile.sex === 'male') {
      tmb = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      tmb = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    // Activity level multiplier
    const activityFactors: Record<string, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      'very-active': 1.9,
    };
    const factor = activityFactors[profile.activityLevel] || 1.2;
    tmb *= factor;

    // Metabolic stress adjustment for medical conditions
    if (profile.conditions.includes('hipertiroidismo')) tmb *= 1.1;
    if (profile.conditions.includes('insuficiencia-renal')) tmb *= 0.9;

    return Math.round(tmb);
  }, [profile]);

  const handleSubmit = useCallback(async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const tmb = calculateTMB();

    toast.success(
      `¡Perfil completado! Tu TMB estimada es de ${tmb} kcal/día. Preparando tu plan...`,
      { duration: 4000 }
    );

    setIsSubmitting(false);
    
    // Switch to Dashboard
    if (onComplete) {
      onComplete(profile);
    } else {
      setSubmitted(true);
    }
  }, [validateStep, calculateTMB, currentStep, onComplete, profile]);

  const slideVariants = {
    enter: (direction: number) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction > 0 ? -300 : 300, opacity: 0 }),
  };

  // ── Success Screen (Fallback if no onComplete) ──
  if (submitted && !onComplete) {
    const tmb = calculateTMB();
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <GlassCard glow className="max-w-lg w-full text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/30"
          >
            <ShieldCheck className="h-10 w-10 text-emerald-400" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-2">¡Perfil Completado!</h2>
          <p className="text-zinc-400 mb-6">
            Tu Tasa Metabólica Basal estimada es de
          </p>
          <div className="inline-flex items-baseline gap-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-6 py-3 mb-6">
            <span className="text-3xl font-bold text-emerald-400">{tmb}</span>
            <span className="text-sm text-emerald-400/70">kcal/día</span>
          </div>
          <p className="text-sm text-zinc-500">
            Basado en la fórmula Mifflin-St Jeor ajustada a tus condiciones médicas.
          </p>
        </GlassCard>
      </div>
    );
  }

  // ── Multi-step Form ──
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-8">
        <StepIndicator steps={STEPS} currentStep={currentStep} />
      </div>

      <AnimatePresence mode="wait" custom={currentStep}>
        {/* ── Step 1: Personal Data ── */}
        {currentStep === 1 && (
          <motion.div
            key="step-1"
            custom={1}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <GlassCard>
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20">
                  <User className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Datos Personales</h2>
                  <p className="text-sm text-zinc-500">Cuéntanos sobre ti</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col items-center mb-6">
                  <div className="relative h-24 w-24 rounded-full overflow-hidden bg-zinc-800 border-2 border-dashed border-white/[0.2] flex items-center justify-center mb-3">
                    {profile.photo ? (
                      <img src={profile.photo} alt="Perfil" className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-10 w-10 text-zinc-500" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      title="Subir foto del paciente"
                    />
                  </div>
                  <p className="text-xs text-zinc-500">Opcional: Haz clic para subir foto</p>
                </div>
                <Input
                  label="Nombre completo"
                  placeholder="Ej: María García"
                  value={profile.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  error={errors.name}
                  icon={<User className="h-4 w-4" />}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Edad"
                    type="number"
                    placeholder="30"
                    value={profile.age}
                    onChange={(e) => updateField('age', e.target.value)}
                    error={errors.age}
                    suffix="años"
                    min={12}
                    max={120}
                  />
                  <Select
                    label="Sexo biológico"
                    options={SEX_OPTIONS}
                    placeholder="Seleccionar"
                    value={profile.sex}
                    onChange={(e) => updateField('sex', e.target.value)}
                    error={errors.sex}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-between">
                {onCancel ? (
                  <Button variant="ghost" onClick={onCancel}>
                    Cancelar
                  </Button>
                ) : <div />}
                <Button onClick={nextStep} size="lg">
                  Siguiente
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* ── Step 2: Biometric Data ── */}
        {currentStep === 2 && (
          <motion.div
            key="step-2"
            custom={1}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <GlassCard>
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20">
                  <Ruler className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Datos Biométricos</h2>
                  <p className="text-sm text-zinc-500">Tus medidas y nivel de actividad</p>
                </div>
              </div>

              <div className="space-y-4">
                <Input
                  label="Altura"
                  type="number"
                  placeholder="170"
                  value={profile.height}
                  onChange={(e) => updateField('height', e.target.value)}
                  error={errors.height}
                  suffix="cm"
                  icon={<Ruler className="h-4 w-4" />}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Peso actual"
                    type="number"
                    placeholder="75"
                    value={profile.currentWeight}
                    onChange={(e) => updateField('currentWeight', e.target.value)}
                    error={errors.currentWeight}
                    warning={warnings.currentWeight}
                    suffix="kg"
                    icon={<Weight className="h-4 w-4" />}
                  />
                  <Input
                    label="Peso objetivo"
                    type="number"
                    placeholder="68"
                    value={profile.targetWeight}
                    onChange={(e) => updateField('targetWeight', e.target.value)}
                    error={errors.targetWeight}
                    suffix="kg"
                    icon={<Target className="h-4 w-4" />}
                  />
                </div>
                <Select
                  label="Nivel de actividad física"
                  options={ACTIVITY_OPTIONS}
                  placeholder="Selecciona tu nivel"
                  value={profile.activityLevel}
                  onChange={(e) => updateField('activityLevel', e.target.value)}
                  error={errors.activityLevel}
                />
              </div>

              <div className="mt-6 flex justify-between">
                <Button variant="ghost" onClick={prevStep}>
                  <ArrowLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <Button onClick={nextStep} size="lg">
                  Siguiente
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* ── Step 3: Medical History ── */}
        {currentStep === 3 && (
          <motion.div
            key="step-3"
            custom={1}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <GlassCard>
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20">
                  <Heart className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Historial Médico</h2>
                  <p className="text-sm text-zinc-500">
                    Selecciona las condiciones que apliquen
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-zinc-300 mb-3">
                    Condiciones Médicas
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {MEDICAL_CONDITIONS.map((condition) => (
                      <ConditionTag
                        key={condition.id}
                        label={condition.label}
                        icon={condition.icon}
                        selected={profile.conditions.includes(condition.id)}
                        onClick={() => toggleCondition(condition.id)}
                      />
                    ))}
                  </div>
                </div>

                <div className="border-t border-white/[0.06] pt-6">
                  <h3 className="text-sm font-medium text-zinc-300 mb-3">
                    Alergias Alimentarias
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {FOOD_ALLERGIES.map((allergy) => (
                      <ConditionTag
                        key={allergy.id}
                        label={allergy.label}
                        icon={allergy.icon}
                        selected={profile.allergies.includes(allergy.id)}
                        onClick={() => toggleAllergy(allergy.id)}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-between">
                <Button variant="ghost" onClick={prevStep}>
                  <ArrowLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <Button
                  onClick={handleSubmit}
                  size="lg"
                  isLoading={isSubmitting}
                >
                  <Sparkles className="h-4 w-4" />
                  Completar Perfil
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
