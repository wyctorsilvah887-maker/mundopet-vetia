'use server';
/**
 * @fileOverview Um agente de IA para chat interativo sobre a saúde de um pet específico.
 *
 * - petChat - Função que gerencia a conversa com a IA.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PetChatInputSchema = z.object({
  petName: z.string(),
  petSpecies: z.string(),
  petBreed: z.string().optional(),
  petAge: z.number().optional(),
  userMessage: z.string(),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    text: z.string()
  })).optional(),
  photoDataUri: z.string().optional().describe("URI de dados base64 da foto anexa.")
});
export type PetChatInput = z.infer<typeof PetChatInputSchema>;

const PetChatOutputSchema = z.object({
  response: z.string(),
});
export type PetChatOutput = z.infer<typeof PetChatOutputSchema>;

const petChatPrompt = ai.definePrompt({
  name: 'petChatPrompt',
  input: { schema: PetChatInputSchema },
  output: { schema: PetChatOutputSchema },
  config: {
    temperature: 0.3,
  },
  system: `Você é a Vet IA, uma assistente extremamente concisa e amigável da WS Studios.

DIRETRIZES DE RESPOSTA:
1. Use emojis para facilitar a leitura rápida 🐾.
2. Use negrito apenas para informações vitais.
3. Use tópicos curtos e diretos.
4. Seja sempre muito breve.
5. Lembre o usuário sobre o limite diário de mensagens quando apropriado.
6. REGRA VITAL DE SEGURANÇA: Se o usuário mencionar QUALQUER sintoma, dor, comportamento estranho ou mal-estar no animal, você DEVE obrigatoriamente incluir a seguinte frase em destaque: "**É indispensável procurar um médico veterinário presencialmente, pois isso é fundamental para a segurança e saúde do seu pet.**"`,
  prompt: `Pet: {{petName}} ({{petSpecies}}, {{#if petBreed}}{{petBreed}}{{else}}SRD{{/if}}{{#if petAge}}, {{petAge}} anos{{/if}}).

Histórico:
{{#each history}}
{{role}}: {{{text}}}
{{/each}}

Mensagem atual: {{{userMessage}}}
{{#if photoDataUri}}Foto anexa: {{media url=photoDataUri}}{{/if}}`,
});

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
    const { output } = await petChatPrompt(input);
    return output || { response: 'Desculpe, não consegui processar sua mensagem agora. 🐾' };
  }
);
