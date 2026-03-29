'use server';
/**
 * @fileOverview Fluxo de IA para chat interativo sobre a saúde do pet.
 * Otimizado para baixo consumo de tokens e resposta completa sem truncamento.
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
    
    // Prompt de sistema otimizado para seguir o roteiro solicitado sem erros de escrita
    const systemPrompt = `Você é o Vet AI da WS Studios, um assistente de elite em saúde animal.
Dados do Pet: Nome: ${petInfo.name}, Espécie: ${petInfo.species}, Raça: ${petInfo.breed || 'SRD'}, Idade: ${petAgeStr} anos.

INSTRUÇÃO DE SAUDAÇÃO (TRIGGER):
Se o usuário enviar "SAUDACAO_INICIAL_TRIGGER", você DEVE responder seguindo EXATAMENTE este padrão:
"Olá! Sou o Vet AI da WS Studios e é um prazer. ${petInfo.name} é um ${petInfo.species}, tem ${petAgeStr} anos. Essa raça [especificar problema comum ou característica de saúde]... O que gostaria de saber agora?"

Regras de Ouro:
1. Idioma: Português Brasileiro impecável.
2. Integridade: NUNCA pare de escrever no meio de uma frase. Finalize sempre seu raciocínio.
3. Estilo: Profissional e direto.
4. Segurança: Recomende veterinários para casos graves.
5. Economia: Seja conciso para economizar tokens, mas NUNCA sacrifique a conclusão da frase.`;

    const recentHistory = history.slice(-4); // Reduzido para economizar tokens

    const response = await ai.generate({
      system: systemPrompt,
      prompt: message,
      messages: recentHistory.map(h => ({
        role: h.role,
        content: [{ text: h.content }]
      })),
      config: {
        maxOutputTokens: 1024, // Aumentado levemente para garantir conclusão de frases complexas
        temperature: 0.6, // Reduzido para mais consistência
      }
    });

    return { response: response.text };
  }
);
