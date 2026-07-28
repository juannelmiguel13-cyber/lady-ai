import { UserProfile } from '@/app/page';

// Mapea las IDs del formulario a nombres legibles en español
const CONDITION_LABELS: Record<string, string> = {
  'diabetes-1': 'Diabetes Tipo 1',
  'diabetes-2': 'Diabetes Tipo 2',
  'hipertension': 'Hipertensión arterial',
  'hipertiroidismo': 'Hipertiroidismo',
  'insuficiencia-renal': 'Insuficiencia Renal Crónica',
  'celiaquia': 'Celiaquía (enfermedad celíaca)',
};

const ALLERGY_LABELS: Record<string, string> = {
  'lactosa': 'Intolerancia a la Lactosa',
  'gluten': 'Alergia/Intolerancia al Gluten',
  'frutos-secos': 'Alergia a Frutos Secos',
  'mariscos': 'Alergia a Mariscos',
  'huevos': 'Alergia al Huevo',
  'soja': 'Alergia a la Soja/Soya',
};

export function buildMedicalPrompt(profile: UserProfile, tmb: number): string {
  const conditions = profile.conditions.length > 0
    ? profile.conditions.map(c => CONDITION_LABELS[c] || c).join(', ')
    : 'Ninguna';
  const allergies = profile.allergies.length > 0
    ? profile.allergies.map(a => ALLERGY_LABELS[a] || a).join(', ')
    : 'Ninguna';

  const allergyRules = [];
  if (profile.allergies.includes('gluten')) allergyRules.push('   - GLUTEN: PROHIBIDO trigo, avena, cebada, centeno, espelta, pan común, pastas de trigo, seitan. Usa SOLO maíz, arroz o quinoa.');
  if (profile.allergies.includes('lactosa')) allergyRules.push('   - LACTOSA: PROHIBIDO leche entera, queso, yogur, crema, mantequilla, nata. Usa leche de almendras/arroz o productos deslactosados.');
  if (profile.allergies.includes('frutos-secos')) allergyRules.push('   - FRUTOS SECOS: PROHIBIDO almendras, nueces, maní, cacahuate, pistacho, avellana, macadamia.');
  if (profile.allergies.includes('mariscos')) allergyRules.push('   - MARISCOS: PROHIBIDO camarón, langosta, cangrejo, mejillones, almejas.');
  if (profile.allergies.includes('huevos')) allergyRules.push('   - HUEVO: PROHIBIDO huevos en cualquier forma, mayonesa, omelette.');
  if (profile.allergies.includes('soja')) allergyRules.push('   - SOJA: PROHIBIDO soja, soya, tofu, tempeh, edamame, salsa de soja.');

  const conditionRules = [];
  if (profile.conditions.includes('celiaquia')) conditionRules.push('   - CELIAQUÍA: Aplican TODAS las restricciones de GLUTEN (trigo, avena, cebada, centeno, espelta, pan común, pastas de trigo, seitan).');
  if (profile.conditions.includes('diabetes-1') || profile.conditions.includes('diabetes-2')) conditionRules.push('   - DIABETES: PROHIBIDO azúcar refinada, miel, panela, jarabe, caramelos, refrescos, bollería, pasteles. Usa edulcorantes naturales (stevia) si necesitas endulzar.');
  if (profile.conditions.includes('insuficiencia-renal')) conditionRules.push('   - INSUFICIENCIA RENAL: PROHIBIDO embutidos, salchichas, tocino, sopas de sobre, caldos en cubo. Limitar sodio. Preferir proteínas magras en porciones moderadas.');
  if (profile.conditions.includes('hipertension')) conditionRules.push('   - HIPERTENSIÓN: PROHIBIDO embutidos, salchichas, tocino, sopas de sobre, caldos en cubo, salsa de soja. Minimizar sodio.');
  if (profile.conditions.includes('hipertiroidismo')) conditionRules.push('   - HIPERTIROIDISMO: Limitar alimentos ricos en yodo (algas, mariscos).');

  let rulesSection = '';
  if (allergyRules.length > 0 || conditionRules.length > 0) {
    rulesSection = 'REGLAS MÉDICAS INQUEBRANTABLES (VIDA O MUERTE):\n\n';
    if (allergyRules.length > 0) {
      rulesSection += '1. RESTRICCIONES POR ALERGIA:\n' + allergyRules.join('\n') + '\n\n';
    }
    if (conditionRules.length > 0) {
      rulesSection += '2. RESTRICCIONES POR PATOLOGÍA:\n' + conditionRules.join('\n') + '\n\n';
    }
  }

  return `
Actúa como un nutriólogo clínico experto. Crea un menú de 1 día para el siguiente paciente:
- Edad: ${profile.age} años
- Peso: ${profile.currentWeight} kg
- Objetivo: ${profile.targetWeight} kg
- Patologías diagnosticadas: ${conditions}
- Alergias/Intolerancias: ${allergies}
- Tasa Metabólica Basal (Mifflin-St Jeor): ${tmb} kcal/día

${rulesSection}3. DEBES generar un menú viable SIEMPRE. Si hay muchas restricciones, usa ingredientes universalmente seguros: arroz blanco, pollo a la plancha, calabacín, zanahoria cocida, pepino, aceite de oliva.

4. SOLO aplica las restricciones de las patologías y alergias que TIENE el paciente. No restrinjas alimentos que no estén contraindicados.

Devuelve la respuesta ÚNICAMENTE en formato JSON válido con esta estructura exacta: 
{ 
  "desayuno": "descripción detallada con porciones",
  "almuerzo": "descripción detallada con porciones",
  "cena": "descripción detallada con porciones",
  "snacks": "descripción detallada",
  "totalCalorias": número_entero
}
No agregues texto adicional, explicaciones ni formato markdown. SOLO EL JSON PURO.
`.trim();
}
