'use server';
/**
 * @fileOverview Fluxo de IA para chat interativo.
 * Otimizado para o Plano Gratuito (Gemini 2.5 Flash) com baixa contagem de tokens.
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
  response: z.string().describe('A resposta da IA.'),
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
    
    const ageValue = petInfo.age || 0;
    const ageSuffix = ageValue === 1 ? 'ano' : 'anos';
    const ageDisplay = ageValue < 1 ? 'menos de 1 ano' : `${ageValue} ${ageSuffix}`;
    
    const systemPrompt = `Você é o Vet AI da WS Studios. 
PACIENTE: ${petInfo.name} (${petInfo.species}, ${petInfo.breed || 'SRD'}, ${ageDisplay}).

DIRETRIZES:
1. Responda em Português Brasileiro.
2. Seja técnico, mas acolhedor.
3. Se "SAUDACAO_INICIAL_TRIGGER", responda: "Olá! Sou o Vet AI da WS Studios e é um prazer. ${petInfo.name} é um ${petInfo.species} e tem ${ageDisplay}. Sobre a raça ${petInfo.breed || 'SRD'}, é importante saber que [predisposição de saúde]... O que gostaria de saber agora?"
4. SEMPRE corrija erros de escrita.
5. Seja direto para economizar tokens.`;

    // Memória Otimizada: 8 mensagens para manter o contexto sem estourar o limite gratuito
    const recentHistory = history.slice(-8);

    const response = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      system: systemPrompt,
      prompt: message,
      messages: recentHistory.map(h => ({
        role: h.role,
        content: [{ text: h.content }]
      })),
      config: {
        maxOutputTokens: 350, // Reduzido para economia máxima
        temperature: 0.5,
      }
    });

    return { response: response.text };
  }
);
