import { groq } from '@ai-sdk/groq';
import { streamText } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages, userProfile } = await req.json();

    // Normalizar mensajes para el proveedor Groq (convertir parts a content string)
    const normalizedMessages = messages.map((msg: any) => {
      if (msg.parts && Array.isArray(msg.parts)) {
        return {
          ...msg,
          content: msg.parts.map((p: any) => p.text || '').join(''),
          parts: undefined
        };
      }
      return msg;
    });

    const systemMessage = `Eres Lady IA, el asistente virtual de nutrición clínica del Dr. Vásquez.
Tu objetivo es responder de forma profesional, empática, y dar recomendaciones nutricionales generales al paciente.

A CONTINUACIÓN, LOS DATOS CLÍNICOS DEL PACIENTE ACTUAL AL QUE ESTÁS ATENDIENDO:
- Nombre: ${userProfile?.name || 'Desconocido'}
- Edad: ${userProfile?.age || 'Desconocida'}
- Sexo: ${userProfile?.sex || 'Desconocido'}
- Peso Actual: ${userProfile?.currentWeight || 'N/A'} kg (Meta: ${userProfile?.targetWeight || 'N/A'} kg)
- Nivel de Actividad: ${userProfile?.activityLevel || 'Desconocido'}
- Condiciones de Salud: ${userProfile?.conditions?.length ? userProfile.conditions.join(', ') : 'Ninguna declarada'}
- Alergias/Intolerancias: ${userProfile?.allergies?.length ? userProfile.allergies.join(', ') : 'Ninguna declarada'}

INSTRUCCIONES CLAVES:
1. Dirígete al paciente por su nombre (${userProfile?.name || 'paciente'}).
2. Ten siempre en cuenta sus alergias (ej. intolerancia a la lactosa) y sus condiciones de salud para no recomendar alimentos prohibidos o perjudiciales.
3. Si el paciente te pregunta algo sobre su dieta, básate en estos datos clínicos.
4. IMPORTANTE: Aclara que tus recomendaciones son de soporte y el usuario siempre debe consultar a su médico tratante.`;

    const result = await streamText({
      model: groq('llama-3.3-70b-versatile'),
      messages: normalizedMessages,
      system: systemMessage,
    });

    return result.toUIMessageStreamResponse();
  } catch (error: any) {
    console.error("Error en la petición a Groq:", error);
    
    const statusCode = error?.statusCode || error?.status || 500;
    
    // Regla de seguridad: Si hay error 401/403 detener y no reintentar
    if (statusCode === 401 || statusCode === 403) {
      return new Response(
        JSON.stringify({ error: "Error de Autenticación con Groq. Por favor verifica la API Key." }),
        { status: statusCode, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        error: "Ocurrió un error inesperado al procesar el mensaje.",
        details: error?.message || String(error),
        stack: error?.stack 
      }),
      { status: statusCode, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
