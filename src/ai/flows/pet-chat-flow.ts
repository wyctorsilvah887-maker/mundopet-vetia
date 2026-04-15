'use server';
/**
 * @fileOverview Fluxo de chat com memória de prontuário e detecção de melhora.
 * O Vet AI monitora consultas pendentes e sugere o fechamento quando o pet melhora.
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
  pendingConsultations: z.array(z.object({
    id: z.string(),
    reason: z.string(),
    createdAt: z.string(),
  })).optional().describe('Lista de consultas ou sintomas ainda não resolvidos no prontuário.'),
  message: z.string(),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })).optional(),
});

const PetChatOutputSchema = z.object({
  response: z.string().describe('Resposta textual da IA para o usuário.'),
  recommendConsultation: z.boolean().describe('Verdadeiro se for necessária uma nova consulta profissional ou urgência detectada.'),
  resolvedConsultationId: z.string().optional().describe('O ID da consulta pendente que deve ser marcada como concluída porque o pet melhorou ou o sintoma passou.'),
});

const petChatFlow = ai.defineFlow(
  {
    name: 'petChatFlow',
    inputSchema: PetChatInputSchema,
    outputSchema: PetChatOutputSchema,
  },
  async (input) => {
    const { petInfo, message, history = [], pendingConsultations = [] } = input;
    
    let pendingContext = "";
    if (pendingConsultations.length > 0) {
      pendingContext = "\nCONSULTAS/SINTOMAS PENDENTES NO PRONTUÁRIO:\n" + 
        pendingConsultations.map(c => `- ID: ${c.id}, Motivo: ${c.reason}`).join('\n');
    }

    const systemPrompt = `Você é o Vet AI Elite, assistente veterinário inteligente da WS Studios.
    
    DADOS DO PACIENTE ATUAL:
    - Nome: ${petInfo.name}
    - Espécie: ${petInfo.species}
    - Raça: ${petInfo.breed || 'SRD'}
    - Idade: ${petInfo.age || 0} anos
    ${pendingContext}

    SUAS DIRETRIZES:
    1. MONITORAMENTO DE MELHORA: Se o usuário relatar que o pet "está melhor", "curou", "parou de ter o sintoma" ou algo similar sobre um item na lista de PENDENTES, identifique o ID correspondente e defina 'resolvedConsultationId' com esse ID.
    2. RECOMENDAÇÃO DE CONSULTA: Defina 'recommendConsultation' como TRUE apenas se detectar sintomas graves (sangramento, apatia severa, convulsão) ou necessidade de exame físico.
    3. SAUDAÇÃO: Se a mensagem for "SAUDACAO_INICIAL_TRIGGER", apresente-se amigavelmente mencionando o nome do pet. Se houver algo PENDENTE, pergunte brevemente como está a evolução.
    4. Limite suas respostas a no máximo 5 frases curtas e objetivas.
    5. Idioma: Português Brasileiro (PT-BR).`;

    const chatMessages = (history || []).map(h => ({ 
      role: h.role === 'model' ? 'model' as const : 'user' as const, 
      content: [{ text: h.content }] 
    }));

    const firstUserIndex = chatMessages.findIndex(m => m.role === 'user');
    const filteredHistory = firstUserIndex === -1 ? [] : chatMessages.slice(firstUserIndex);

    try {
      const { output } = await ai.generate({
        model: 'googleai/gemini-1.5-flash',
        system: systemPrompt,
        prompt: message,
        messages: filteredHistory,
        output: { schema: PetChatOutputSchema },
        config: { 
          maxOutputTokens: 1000, 
          temperature: 0.3 
        }
      });

      return output || { 
        response: "Desculpe, tive um erro na análise técnica da resposta.",
        recommendConsultation: false
      };
    } catch (error) {
      return {
        response: "Ocorreu uma instabilidade na conexão com os modelos de IA. Por favor, tente novamente em instantes.",
        recommendConsultation: false
      };
    }
  }
);

export async function petChat(input: z.infer<typeof PetChatInputSchema>) {
  return petChatFlow(input);
}
