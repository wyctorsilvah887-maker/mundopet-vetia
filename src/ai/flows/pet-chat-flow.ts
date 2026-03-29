'use server';
/**
 * @fileOverview Fluxo de chat ultra-otimizado para economia de tokens.
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

const PetChatOutputSchema = z.object({
  response: z.string(),
});

export async function petChat(input: z.infer<typeof PetChatInputSchema>) {
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
    const systemPrompt = `Vet AI da WS Studios. PACIENTE: ${petInfo.name} (${petInfo.species}, ${petInfo.breed || 'SRD'}).
    
    DIRETRIZES:
    1. Responda em PT-BR de forma curta (máximo 3 frases).
    2. Se "SAUDACAO_INICIAL_TRIGGER", diga: "Olá! Sou o Vet AI da WS Studios e é um prazer. ${petInfo.name} é um ${petInfo.species} e tem ${petInfo.age || 0} anos. Sobre a raça ${petInfo.breed || 'SRD'}, cuidado com [problema comum]. O que gostaria de saber?"
    3. Corrija escrita do usuário.`;

    const response = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      system: systemPrompt,
      prompt: message,
      messages: history.slice(-6).map(h => ({ role: h.role, content: [{ text: h.content }] })),
      config: { maxOutputTokens: 250, temperature: 0.3 }
    });

    return { response: response.text };
  }
);
