'use server';
/**
 * @fileOverview Fluxo de chat com memória de prontuário.
 * O Vet AI agora monitora consultas pendentes e sugere o fechamento quando o pet melhora.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PetChatInputSchema = z.object({
  petInfo: z.object({
    name: z.string(),
    species: z.string(),
    breed: z.string().optional(),
    age: z.number().optional(),
  }),
  pendingConsultations: z.array(z.object({
    id: z.string(),
    reason: z.string(),
    createdAt: z.string(),
  })).optional().describe('Lista de consultas ou sintomas ainda não resolvidos no prontuário.'),
  message: z.string(),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })).optional(),
});

const PetChatOutputSchema = z.object({
  response: z.string(),
  recommendConsultation: z.boolean().describe('Verdadeiro se for necessária uma nova consulta.'),
  resolvedConsultationId: z.string().optional().describe('O ID da consulta pendente que deve ser marcada como concluída porque o pet melhorou.'),
});

const petChatFlow = ai.defineFlow(
  {
    name: 'petChatFlow',
    inputSchema: PetChatInputSchema,
    outputSchema: PetChatOutputSchema,
  },
  async (input) => {
    const { petInfo, message, history = [], pendingConsultations = [] } = input;
    
    let pendingContext = "";
    if (pendingConsultations.length > 0) {
      pendingContext = "\nCONSULTAS/SINTOMAS PENDENTES NO PRONTUÁRIO:\n" + 
        pendingConsultations.map(c => `- ID: ${c.id}, Motivo: ${c.reason}`).join('\n');
    }

    const systemPrompt = `Você é o Vet AI Elite da WS Studios.
    
    DADOS DO PACIENTE:
    - Nome: ${petInfo.name}
    - Espécie: ${petInfo.species}
    - Raça: ${petInfo.breed || 'SRD'}
    - Idade: ${petInfo.age || 0} anos
    ${pendingContext}

    DIRETRIZES:
    1. Se o usuário disser que o pet "está melhor", "melhorou", "não tem mais nada" ou relatos similares sobre um sintoma que está na lista de PENDENTES, você deve identificar o ID correspondente e definir 'resolvedConsultationId' com esse ID.
    2. RECOMENDAÇÃO DE CONSULTA: Defina 'recommendConsultation' como TRUE se detectar novos sintomas graves.
    3. Se a mensagem for "SAUDACAO_INICIAL_TRIGGER", apresente-se mencionando os dados do pet. Se houver algo PENDENTE, pergunte como o pet está evoluindo em relação a esse problema específico.
    4. Limite suas respostas a no máximo 6 frases.
    5. Idioma: PT-BR.`;

    const chatMessages = history.map(h => ({ 
      role: h.role === 'model' ? 'model' as const : 'user' as const, 
      content: [{ text: h.content }] 
    }));

    const firstUserIndex = chatMessages.findIndex(m => m.role === 'user');
    const filteredHistory = firstUserIndex === -1 ? [] : chatMessages.slice(firstUserIndex);

    const { output } = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      system: systemPrompt,
      prompt: message,
      messages: filteredHistory,
      output: { schema: PetChatOutputSchema },
      config: { 
        maxOutputTokens: 800, 
        temperature: 0.4 
      }
    });

    return output || { 
      response: "Erro na análise.",
      recommendConsultation: false
    };
  }
);

export async function petChat(input: z.infer<typeof PetChatInputSchema>) {
  return petChatFlow(input);
}
