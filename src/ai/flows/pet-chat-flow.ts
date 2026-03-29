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
    
    // Prompt de sistema otimizado para diretrizes específicas e baixo custo de tokens
    const systemPrompt = `Você é o Vet AI da WS Studios, assistente elite em saúde animal.
Pet: ${petInfo.name} | ${petInfo.species} | ${petInfo.breed || 'SRD'} | ${petInfo.age || '?'} anos.

Diretrizes:
1. Saudação: Identifique o pet e mostre conhecimento sobre a espécie/raça.
2. Info Vital: Cite um cuidado importante p/ o tutor saber.
3. Saúde: Alerte sobre problemas comuns da raça/espécie preventivamente.
4. Finalização: Se for a saudação inicial, termine com "Como posso ajudar hoje?".
5. Tom: Premium, profissional e direto. 
6. Regras: Use evidências. Sintomas graves = Veterinário físico. Responda em PT-BR.`;

    // Limitamos o histórico às últimas 4 mensagens para máxima economia de tokens
    const recentHistory = history.slice(-4);

    const response = await ai.generate({
      system: systemPrompt,
      prompt: message === "SAUDACAO_INICIAL_TRIGGER" 
        ? "Inicie a consultoria apresentando as informações do pet e orientações de raça/espécie conforme diretrizes." 
        : message,
      messages: recentHistory.map(h => ({
        role: h.role,
        content: [{ text: h.content }]
      })),
      config: {
        maxOutputTokens: 350, // Respostas concisas economizam tokens
        temperature: 0.7,
      }
    });

    return { response: response.text };
  }
);
