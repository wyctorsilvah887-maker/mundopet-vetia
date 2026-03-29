'use server';
/**
 * @fileOverview Fluxo de IA para chat interativo sobre a saúde do pet.
 * Otimizado para baixo consumo de tokens e contexto específico de raça.
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
    
    const petAgeStr = petInfo.age === 0 ? "menos de 1" : petInfo.age;
    
    // Prompt de sistema refinado para ser extremamente direto e evitar truncamento
    const systemPrompt = `Você é o Vet AI da WS Studios, um assistente de elite em saúde animal.
Dados do Pet: Nome: ${petInfo.name}, Espécie: ${petInfo.species}, Raça: ${petInfo.breed || 'SRD'}, Idade: ${petAgeStr} anos.

IMPORTANTE: Se a mensagem do usuário for "SAUDACAO_INICIAL_TRIGGER", você DEVE responder EXATAMENTE neste modelo, preenchendo o problema de saúde comum:
"Olá! Sou o Vet AI da WS Studios e é um prazer. ${petInfo.name} é um ${petInfo.species}, tem ${petAgeStr} anos. Essa raça costuma ter [problema de saúde comum da raça]. O que gostaria de saber agora?"

Instruções:
1. Idioma: Português Brasileiro (PT-BR).
2. Estilo: Profissional, empático e direto.
3. Segurança: Em casos graves, recomende sempre um veterinário.
4. Integridade: NUNCA corte a frase no meio. Finalize sempre o pensamento.`;

    const recentHistory = history.slice(-6);

    const response = await ai.generate({
      system: systemPrompt,
      prompt: message,
      messages: recentHistory.map(h => ({
        role: h.role,
        content: [{ text: h.content }]
      })),
      config: {
        maxOutputTokens: 800,
        temperature: 0.7,
      }
    });

    return { response: response.text };
  }
);
