'use server';
/**
 * @fileOverview Fluxo de chat otimizado para saudações completas e suporte premium.
 * Corrigido para garantir que a conversa comece com mensagem do usuário (requisito Gemini)
 * e para fornecer saudações ricas em detalhes conforme solicitado.
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

const petChatFlow = ai.defineFlow(
  {
    name: 'petChatFlow',
    inputSchema: PetChatInputSchema,
    outputSchema: PetChatOutputSchema,
  },
  async (input) => {
    const { petInfo, message, history = [] } = input;
    
    const systemPrompt = `Você é o Vet AI Elite da WS Studios, um assistente veterinário inteligente e atencioso.
    
    DADOS DO PACIENTE:
    - Nome: ${petInfo.name}
    - Espécie: ${petInfo.species}
    - Raça: ${petInfo.breed || 'SRD'}
    - Idade: ${petInfo.age || 0} anos

    DIRETRIZES:
    1. Responda sempre em Português Brasileiro (PT-BR).
    2. Se a mensagem for "SAUDACAO_INICIAL_TRIGGER", gere uma resposta seguindo exatamente esta estrutura:
       - Cumprimente o usuário calorosamente e apresente-se como Vet AI da WS Studios.
       - Mencione explicitamente o nome, espécie, raça e idade do(a) ${petInfo.name} na apresentação.
       - Forneça uma informação importante, curiosidade ou cuidado preventivo sobre a raça ${petInfo.breed || 'SRD'} ou espécie ${petInfo.species}.
       - Pergunte se o pet apresenta algum problema de saúde, sintoma ou dúvida nutricional no momento e como você pode ajudar.
    3. Para conversas normais, seja direto, profissional e empático.
    4. Sempre recomende a consulta com um veterinário físico para diagnósticos definitivos.
    5. Limite suas respostas a no máximo 6 frases para clareza e economia.`;

    // Converte o histórico para o formato Genkit/Gemini
    const chatMessages = history.map(h => ({ 
      role: h.role === 'model' ? 'model' as const : 'user' as const, 
      content: [{ text: h.content }] 
    }));

    // Requisito Gemini: A conversa deve sempre começar com uma mensagem do usuário no histórico.
    const firstUserIndex = chatMessages.findIndex(m => m.role === 'user');
    const filteredHistory = firstUserIndex === -1 ? [] : chatMessages.slice(firstUserIndex);

    const response = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      system: systemPrompt,
      prompt: message,
      messages: filteredHistory,
      config: { 
        maxOutputTokens: 800, 
        temperature: 0.5 
      }
    });

    return { response: response.text || "Desculpe, tive um problema temporário. Por favor, tente novamente em instantes." };
  }
);

export async function petChat(input: z.infer<typeof PetChatInputSchema>) {
  return petChatFlow(input);
}
