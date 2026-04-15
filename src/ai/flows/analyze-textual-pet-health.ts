'use server';
/**
 * @fileOverview Analisador textual de saúde pet otimizado para economia de tokens.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeTextualPetHealthInputSchema = z.object({
  description: z
    .string()
    .describe(
      'Descrição dos sintomas ou alimentação do pet em Português Brasileiro.'
    ),
});
export type AnalyzeTextualPetHealthInput = z.infer<
  typeof AnalyzeTextualPetHealthInputSchema
>;

const AnalyzeTextualPetHealthOutputSchema = z.object({
  analysisSummary: z.string(),
  insights: z.array(z.string()),
  suggestions: z.array(z.string()),
  severityLevel: z.enum(['Informativo', 'Monitorar', 'Atenção', 'Urgente']),
});
export type AnalyzeTextualPetHealthOutput = z.infer<
  typeof AnalyzeTextualPetHealthOutputSchema
>;

const prompt = ai.definePrompt({
  name: 'analyzeTextualPetHealthPrompt',
  input: {schema: AnalyzeTextualPetHealthInputSchema},
  output: {schema: AnalyzeTextualPetHealthOutputSchema},
  model: 'googleai/gemini-1.5-flash',
  config: {
    maxOutputTokens: 500,
  },
  prompt: `Analise a descrição de saúde do pet abaixo e retorne um JSON com resumo, insights e sugestões.
Idioma: Português Brasileiro.

Descrição: {{{description}}}`,
});

const analyzeTextualPetHealthFlow = ai.defineFlow(
  {
    name: 'analyzeTextualPetHealthFlow',
    inputSchema: AnalyzeTextualPetHealthInputSchema,
    outputSchema: AnalyzeTextualPetHealthOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) throw new Error('Falha na resposta da IA');
    return output;
  }
);

export async function analyzeTextualPetHealth(
  input: AnalyzeTextualPetHealthInput
): Promise<AnalyzeTextualPetHealthOutput> {
  return analyzeTextualPetHealthFlow(input);
}
