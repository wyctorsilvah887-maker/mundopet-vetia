'use server';
/**
 * @fileOverview Fluxo de IA para chat interativo sobre a saúde do pet.
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
    
    const systemPrompt = `Você é o Vet AI, um assistente de elite especializado em saúde e nutrição animal da WS Studios.
Você está conversando com o tutor do pet ${petInfo.name}.
Dados do Pet:
- Espécie: ${petInfo.species}
- Raça: ${petInfo.breed || 'Não informada'}
- Idade: ${petInfo.age ? petInfo.age + ' anos' : 'Não informada'}

Diretrizes:
1. Seja profissional, empático e use um tom "Premium".
2. Forneça conselhos baseados em evidências sobre nutrição e comportamento.
3. Se o tutor descrever sintomas graves, recomende FORTEMENTE a ida a um veterinário físico.
4. Responda sempre em Português Brasileiro.`;

    const response = await ai.generate({
      system: systemPrompt,
      prompt: message,
      messages: history.map(h => ({
        role: h.role,
        content: [{ text: h.content }]
      })),
    });

    return { response: response.text };
  }
);
