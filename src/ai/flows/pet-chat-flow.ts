'use server';
/**
 * @fileOverview Fluxo de chat otimizado para saudações completas e suporte premium.
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
    
    const systemPrompt = `Você é o Vet AI Elite da WS Studios, um assistente veterinário inteligente e atencioso.
    
    DADOS DO PACIENTE:
    - Nome: ${petInfo.name}
    - Espécie: ${petInfo.species}
    - Raça: ${petInfo.breed || 'SRD'}
    - Idade: ${petInfo.age || 0} anos

    DIRETRIZES:
    1. Responda sempre em Português Brasileiro (PT-BR).
    2. Se a mensagem for "SAUDACAO_INICIAL_TRIGGER", gere uma resposta seguindo exatamente esta estrutura:
       - Cumprimente o usuário e apresente-se como Vet AI da WS Studios.
       - Mencione o nome, espécie, raça e idade do(a) ${petInfo.name}.
       - Forneça uma informação importante/curiosidade sobre a raça ${petInfo.breed || 'SRD'} ou espécie ${petInfo.species} (ex: predisposição genética ou cuidado específico).
       - Pergunte se o pet apresenta algum problema de saúde ou sintoma no momento e como você pode ajudar.
    3. Para conversas normais, seja direto e profissional, limitando-se a no máximo 5 frases.
    4. Sempre recomende a consulta com um veterinário físico para diagnósticos definitivos.`;

    const response = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      system: systemPrompt,
      prompt: message,
      messages: history.slice(-10).map(h => ({ 
        role: h.role, 
        content: [{ text: h.content }] 
      })),
      config: { 
        maxOutputTokens: 600, 
        temperature: 0.4 
      }
    });

    return { response: response.text };
  }
);
