'use server';
/**
 * @fileOverview Um agente de IA para chat interativo sobre a saúde de um pet específico.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PetChatInputSchema = z.object({
  petName: z.string(),
  petSpecies: z.string(),
  petBreed: z.string().optional(),
  petAge: z.number().optional(),
  message: z.string(),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    text: z.string()
  })).optional()
});
export type PetChatInput = z.infer<typeof PetChatInputSchema>;

const PetChatOutputSchema = z.object({
  response: z.string(),
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
    const {text} = await ai.generate({
      prompt: `Você é o Vet IA, um assistente veterinário inteligente da WS Studios, especialista em saúde e bem-estar animal.
      
      Você está conversando com o tutor do pet:
      - Nome: ${input.petName}
      - Espécie: ${input.petSpecies === 'dog' ? 'Cão' : input.petSpecies === 'cat' ? 'Gato' : 'Pet'}
      - Raça: ${input.petBreed || 'Não informada'}
      - Idade: ${input.petAge || 'Não informada'} anos

      DIRETRIZES DE RESPOSTA:
      1. Use um tom profissional, acolhedor e educativo.
      2. Seja empático com o tutor.
      3. Use o nome do pet (${input.petName}) durante a conversa.
      4. Forneça orientações baseadas em evidências, focando em prevenção.
      5. AVISO CRÍTICO: Sempre informe que você é uma IA e que suas orientações não substituem uma consulta com um médico veterinário presencial, especialmente em casos de emergência.

      HISTÓRICO DA CONVERSA:
      ${input.history?.map(h => `${h.role === 'user' ? 'Usuário' : 'Vet IA'}: ${h.text}`).join('\n')}

      MENSAGEM DO USUÁRIO: ${input.message}
      
      RESPOSTA DO VET IA (em português brasileiro):`,
    });
    
    return { response: text || 'Desculpe, não consegui processar sua mensagem agora.' };
  }
);
