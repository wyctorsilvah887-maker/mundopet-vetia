'use server';
/**
 * @fileOverview Fluxo de IA para chat interativo sobre a saúde do pet.
 * Otimizado para alta retenção de memória e baixo consumo de tokens.
 *
 * - petChat - Função principal que processa a conversa com contexto.
 * - PetChatInput - Dados do pet, mensagem atual e histórico.
 * - PetChatOutput - Resposta textual da IA.
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
    
    // Tratamento de idade para anos ou meses
    const ageValue = petInfo.age || 0;
    const ageSuffix = ageValue === 1 ? 'ano' : 'anos';
    const ageDisplay = ageValue < 1 ? 'menos de 1 ano' : `${ageValue} ${ageSuffix}`;
    
    const systemPrompt = `Você é o Vet AI da WS Studios, uma inteligência de elite em saúde animal.
DADOS DO PACIENTE: Nome: ${petInfo.name}, Espécie: ${petInfo.species}, Raça: ${petInfo.breed || 'SRD'}, Idade: ${ageDisplay}.

MEMÓRIA E CONTEXTO:
Você tem acesso ao histórico de conversas anterior. Use-o para não repetir perguntas e para manter a continuidade do tratamento ou orientações.

PROTOCOLO DE SAUDAÇÃO (TRIGGER INICIAL):
Se o usuário enviar exatamente "SAUDACAO_INICIAL_TRIGGER", responda RIGOROSAMENTE assim:
"Olá! Sou o Vet AI da WS Studios e é um prazer. ${petInfo.name} é um ${petInfo.species} e tem ${ageDisplay}. Sobre a raça ${petInfo.breed || 'SRD'}, é importante saber que [descrever brevemente característica de saúde ou curiosidade da raça]... O que gostaria de saber agora?"

DIRETRIZES DE OPERAÇÃO:
1. Idioma: Português Brasileiro formal e técnico, porém acolhedor.
2. Integridade: Finalize sempre seus pensamentos. Nunca deixe frases incompletas.
3. Precisão: Se o histórico indicar um problema recorrente, mencione-o.
4. Segurança: Casos graves exigem recomendação imediata de veterinário presencial.
5. Ortografia: Revise mentalmente para garantir 0 erros de escrita.`;

    // "Memória muito boa": Mantemos as últimas 10 mensagens (aprox. 5 turnos completos)
    const recentHistory = history.slice(-10);

    const response = await ai.generate({
      system: systemPrompt,
      prompt: message,
      messages: recentHistory.map(h => ({
        role: h.role,
        content: [{ text: h.content }]
      })),
      config: {
        maxOutputTokens: 450, // Reduzido de 800 para 450 para maior economia de tokens
        temperature: 0.4, // Reduzido levemente para respostas mais diretas
      }
    });

    return { response: response.text };
  }
);
