'use server';
/**
 * @fileOverview Fluxo de IA para chat interativo sobre a saúde do pet.
 * Otimizado para baixo consumo de tokens.
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
  message: z.string(),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })).optional(),
});

export type PetChatInput = z.infer<typeof PetChatInputSchema>;

const PetChatOutputSchema = z.object({
  response: z.string().describe('A resposta da IA para o tutor do pet.'),
});

export type PetChatOutput = z.infer<typeof PetChatOutputSchema>;

export async function petChat(input: PetChatInput): Promise<PetChatOutput> {
  return petChatFlow(input);
}

const petChatFlow = ai.defineFlow(
  {
    name: 'petChatFlow',
    inputSchema: PetChatInputSchema,
    outputSchema: PetChatOutputSchema,
  },
  async (input) => {
    const { petInfo, message, history = [] } = input;
    
    // Prompt de sistema conciso para economizar tokens de entrada
    const systemPrompt = `Você é o Vet AI da WS Studios. Especialista em saúde/nutrição animal.
Pet: ${petInfo.name} (${petInfo.species}, ${petInfo.breed || 'SRD'}, ${petInfo.age || '?'} anos).
Tom: Premium, profissional e direto. 
Regras: Use evidências. Sintomas graves = Veterinário físico. Responda em PT-BR.`;

    // Limitamos o histórico às últimas 6 mensagens (3 turnos) para economizar tokens
    const recentHistory = history.slice(-6);

    const response = await ai.generate({
      system: systemPrompt,
      prompt: message,
      messages: recentHistory.map(h => ({
        role: h.role,
        content: [{ text: h.content }]
      })),
      config: {
        maxOutputTokens: 400, // Limita o tamanho da resposta para economizar tokens de saída
        temperature: 0.7,
      }
    });

    return { response: response.text };
  }
);
