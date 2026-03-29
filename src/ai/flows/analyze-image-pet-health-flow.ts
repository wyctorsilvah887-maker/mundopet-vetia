'use server';
/**
 * @fileOverview Um agente de IA para análise de imagem de saúde animal.
 * Otimizado para o plano gratuito (Gemini 2.5 Flash).
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeImagePetHealthInputSchema = z.object({
  image: z
    .string()
    .describe(
      "Uma imagem relacionada à saúde do pet (rótulo de ração, alimento, sintoma), como uma data URI que deve incluir um tipo MIME e usar codificação Base64. Formato esperado: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  description: z
    .string()
    .describe(
      'Uma descrição adicional sobre a imagem, como o tipo de alimento, sintomas observados ou contexto.'
    ),
});
export type AnalyzeImagePetHealthInput = z.infer<
  typeof AnalyzeImagePetHealthInputSchema
>;

const AnalyzeImagePetHealthOutputSchema = z.object({
  analysis: z
    .string()
    .describe(
      'Análise detalhada da imagem fornecida, incluindo informações relevantes e possíveis implicações para a saúde do pet.'
    ),
  identification: z
    .string()
    .describe(
      'Identificação do item alimentar, tipo de rótulo ou descrição do sintoma visual, se aplicável.'
    ),
  suggestions: z
    .string()
    .describe(
      'Sugestões ou recomendações baseadas na análise da imagem, como próximos passos, cuidados ou alertas.'
    ),
});
export type AnalyzeImagePetHealthOutput = z.infer<
  typeof AnalyzeImagePetHealthOutputSchema
>;

export async function analyzeImagePetHealth(
  input: AnalyzeImagePetHealthInput
): Promise<AnalyzeImagePetHealthOutput> {
  return analyzeImagePetHealthFlow(input);
}

const analyzeImagePetHealthPrompt = ai.definePrompt({
  name: 'analyzeImagePetHealthPrompt',
  input: {schema: AnalyzeImagePetHealthInputSchema},
  output: {schema: AnalyzeImagePetHealthOutputSchema},
  config: {
    maxOutputTokens: 500,
    temperature: 0.3,
  },
  prompt: `Você é uma inteligência artificial especialista em saúde e nutrição animal da WS Studios. Analise a imagem e a descrição.
  
Descrição do usuário: {{{description}}}

Imagem para análise:
{{media url=image}}

Forneça um laudo técnico, direto e preciso em Português Brasileiro.`,
  model: 'googleai/gemini-2.5-flash',
});

const analyzeImagePetHealthFlow = ai.defineFlow(
  {
    name: 'analyzeImagePetHealthFlow',
    inputSchema: AnalyzeImagePetHealthInputSchema,
    outputSchema: AnalyzeImagePetHealthOutputSchema,
  },
  async (input) => {
    const {output} = await analyzeImagePetHealthPrompt(input);
    return output!;
  }
);
