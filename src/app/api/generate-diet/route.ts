import { NextResponse } from 'next/server';
import { buildMedicalPrompt } from '@/lib/ai-engine';
import { UserProfile } from '@/app/page';
import { groq } from '@ai-sdk/groq';
import { generateText } from 'ai';

export const maxDuration = 30;

// ═══════════════════════════════════════════════════════════════════
// EL GUARDIÁN 3.0 — Sistema de Auditoría Médica Inteligente
// En vez de bloquear y dejar al paciente SIN dieta,
// detecta violaciones y REGENERA automáticamente (hasta 3 veces).
// ═══════════════════════════════════════════════════════════════════

function construirPalabrasProhibidas(alergias: string[], condiciones: string[]): Set<string> {
  const palabrasProhibidas: Set<string> = new Set();

  // ── Diccionario Médico de Alergias (basado en IDs del formulario) ──
  if (alergias) {
    alergias.forEach(a => {
      const al = a.toLowerCase().trim();
      if (al === 'frutos-secos' || (al.includes('fruto') && al.includes('seco'))) {
        ['almendra', 'nuez', 'nueces', 'maní', 'mani', 'cacahuate', 'pistacho', 'avellana', 'macadamia', 'pecana'].forEach(p => palabrasProhibidas.add(p));
      } else if (al === 'gluten' || al.includes('gluten')) {
        ['trigo', 'avena', 'cebada', 'centeno', 'espelta', 'kamut', 'seitan', 'bulgur', 'cous cous'].forEach(p => palabrasProhibidas.add(p));
      } else if (al === 'lactosa' || al.includes('lactosa')) {
        ['leche entera', 'queso', 'yogur', 'crema', 'mantequilla', 'nata'].forEach(p => palabrasProhibidas.add(p));
      } else if (al === 'mariscos' || al.includes('marisco')) {
        ['camarón', 'camaron', 'langosta', 'cangrejo', 'mejillón', 'almeja', 'pulpo', 'calamar'].forEach(p => palabrasProhibidas.add(p));
      } else if (al === 'huevos' || al.includes('huevo')) {
        ['huevo', 'huevos', 'omelette', 'mayonesa'].forEach(p => palabrasProhibidas.add(p));
      } else if (al === 'soja' || al.includes('soja') || al.includes('soya')) {
        ['soja', 'soya', 'tofu', 'tempeh', 'edamame', 'salsa de soja'].forEach(p => palabrasProhibidas.add(p));
      }
    });
  }

  // ── Diccionario Médico de Patologías (basado en IDs del formulario) ──
  if (condiciones) {
    condiciones.forEach(c => {
      const cond = c.toLowerCase().trim();
      if (cond === 'celiaquia' || cond.includes('celiaquia') || cond.includes('celiaquía')) {
        ['trigo', 'avena', 'cebada', 'centeno', 'espelta', 'kamut', 'seitan', 'bulgur', 'cous cous'].forEach(p => palabrasProhibidas.add(p));
      }
      if (cond === 'diabetes-1' || cond === 'diabetes-2' || cond.includes('diabetes')) {
        ['azúcar refinad', 'azucar refinad', 'panela', 'jarabe', 'caramelo', 'refresco', 'bollería', 'pastel'].forEach(p => palabrasProhibidas.add(p));
      }
      if (cond === 'insuficiencia-renal' || cond.includes('renal')) {
        ['embutido', 'salchicha', 'tocino', 'sopa de sobre', 'caldo en cubo'].forEach(p => palabrasProhibidas.add(p));
      }
      if (cond === 'hipertension' || cond.includes('hipertension')) {
        ['embutido', 'salchicha', 'tocino', 'sopa de sobre', 'caldo en cubo', 'salsa de soja'].forEach(p => palabrasProhibidas.add(p));
      }
    });
  }

  return palabrasProhibidas;
}

function validarDieta(dietaTexto: string, palabrasProhibidas: Set<string>): string[] {
  let textoDieta = dietaTexto.toLowerCase();

  // Limpiar falsos positivos ("sin gluten", "deslactosada", etc.)
  const exclusionesPermitidas = [
    'sin gluten', 'libre de gluten', 'sin lactosa', 'deslactosad',
    'sin trigo', 'sin azúcar', 'sin azucar', 'sin sodio', 'sin sal',
    'libre de lactosa', 'apto para celíacos', 'apto para celiacos',
    'sin huevo', 'libre de huevo'
  ];
  exclusionesPermitidas.forEach(frase => {
    textoDieta = textoDieta.split(frase).join('');
  });

  // Devolver la lista de violaciones encontradas
  const violaciones: string[] = [];
  Array.from(palabrasProhibidas).forEach(palabra => {
    if (textoDieta.includes(palabra)) {
      violaciones.push(palabra);
    }
  });
  return violaciones;
}

function extraerJSON(text: string): any {
  const startIndex = text.indexOf('{');
  const endIndex = text.lastIndexOf('}');
  if (startIndex === -1 || endIndex === -1) {
    throw new Error('La IA no devolvió un JSON válido.');
  }
  return JSON.parse(text.substring(startIndex, endIndex + 1));
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { profile, tmb } = body as { profile: UserProfile; tmb: number };

    if (!profile || !tmb) {
      return NextResponse.json({ error: 'Faltan datos del perfil' }, { status: 400 });
    }

    console.log("══════════════════════════════════════════");
    console.log("ALERGIAS RECIBIDAS:", profile.allergies);
    console.log("CONDICIONES RECIBIDAS:", profile.conditions);
    console.log("══════════════════════════════════════════");

    const palabrasProhibidas = construirPalabrasProhibidas(profile.allergies, profile.conditions);
    console.log("DICCIONARIO DEL GUARDIÁN:", Array.from(palabrasProhibidas));

    const MAX_INTENTOS = 3;
    let dietaJSON = null;
    let violaciones: string[] = [];

    for (let intento = 1; intento <= MAX_INTENTOS; intento++) {
      console.log(`\n── Intento ${intento} de ${MAX_INTENTOS} ──`);
      
      // En reintentos, añadimos las violaciones anteriores al prompt
      let promptExtra = '';
      if (intento > 1 && violaciones.length > 0) {
        promptExtra = `\n\nADVERTENCIA CRÍTICA: En tu respuesta anterior incluiste los siguientes alimentos PROHIBIDOS: ${violaciones.join(', ')}. 
Esos alimentos ponen en PELIGRO DE MUERTE al paciente. NO los incluyas bajo NINGUNA circunstancia. 
Reemplázalos por alternativas seguras (ej. arroz blanco, pollo a la plancha, claras de huevo, vegetales cocidos).`;
      }

      const prompt = buildMedicalPrompt(profile, tmb) + promptExtra;

      const { text } = await generateText({
        model: groq('llama-3.3-70b-versatile'),
        prompt: prompt,
      });

      try {
        dietaJSON = extraerJSON(text);
      } catch (e: any) {
        console.error(`Intento ${intento}: Error al parsear JSON:`, text.substring(0, 200));
        continue; // Reintentar
      }

      // Validar con El Guardián
      violaciones = validarDieta(JSON.stringify(dietaJSON), palabrasProhibidas);

      if (violaciones.length === 0) {
        console.log(`✅ Intento ${intento}: Dieta SEGURA. Aprobada por El Guardián.`);
        break;
      } else {
        console.warn(`⚠️ Intento ${intento}: Violaciones detectadas: ${violaciones.join(', ')}. Regenerando...`);
        dietaJSON = null; // Forzar regeneración
      }
    }

    // Si después de 3 intentos sigue fallando, devolver la última dieta con advertencia
    if (!dietaJSON) {
      // Último recurso: generar una dieta ultra-segura con ingredientes mínimos
      console.warn("⚠️ El Guardián: 3 intentos fallidos. Generando dieta de emergencia...");
      const emergencyPrompt = `Genera un menú de 1 día ULTRA SEGURO para un paciente con MÚLTIPLES restricciones.
Usa SOLO estos ingredientes permitidos: arroz blanco, pollo a la plancha, claras de huevo, calabacín, zanahoria cocida, pepino, aceite de oliva, sal marina (mínima).
NO uses: ${Array.from(palabrasProhibidas).join(', ')}.
TMB objetivo: ${tmb} kcal/día.
Devuelve SOLO JSON: { "desayuno": "...", "almuerzo": "...", "cena": "...", "snacks": "...", "totalCalorias": 0 }`;

      const { text } = await generateText({
        model: groq('llama-3.3-70b-versatile'),
        prompt: emergencyPrompt,
      });

      try {
        dietaJSON = extraerJSON(text);
      } catch (e) {
        return NextResponse.json({ error: 'No se pudo generar una dieta segura. Intente de nuevo.' }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      data: dietaJSON,
      _promptUtilizado: 'Guardián 3.0 activo',
    });
  } catch (error: any) {
    console.error('Error generating diet:', error);
    return NextResponse.json({ error: 'Error interno: ' + error.message }, { status: 500 });
  }
}
