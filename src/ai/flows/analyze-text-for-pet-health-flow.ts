'use server';
/**
 * @fileOverview Um fluxo Genkit para analisar descrições textuais de sintomas de animais de estimação ou ingredientes de alimentos para pets.
 *
 * - analyzeTextForPetHealth - Uma função que processa a análise textual.
 * - AnalyzeTextForPetHealthInput - O tipo de entrada para a função analyzeTextForPetHealth.
 * - AnalyzeTextForPetHealthOutput - O tipo de retorno para a função analyzeTextForPetHealth.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzeTextForPetHealthInputSchema = z.object({
  text: z.string().describe('A descrição dos sintomas do animal de estimação ou dos ingredientes do alimento para análise.'),
});
export type AnalyzeTextForPetHealthInput = z.infer<typeof AnalyzeTextForPetHealthInputSchema>;

const AnalyzeTextForPetHealthOutputSchema = z.object({
  assessment: z.string().describe('A avaliação detalhada da descrição fornecida, focando em possíveis causas ou impactos na saúde do pet.'),
  suggestions: z.string().describe('Sugestões e recomendações com base na avaliação, incluindo próximos passos, cuidados ou alterações na dieta.'),
});
export type AnalyzeTextForPetHealthOutput = z.infer<typeof AnalyzeTextForPetHealthOutputSchema>;

export async function analyzeTextForPetHealth(input: AnalyzeTextForPetHealthInput): Promise<AnalyzeTextForPetHealthOutput> {
  return analyzeTextForPetHealthFlow(input);
}

const analyzeTextPrompt = ai.definePrompt({
  name: 'analyzeTextPrompt',
  input: { schema: AnalyzeTextForPetHealthInputSchema },
  output: { schema: AnalyzeTextForPetHealthOutputSchema },
  prompt: `Você é um especialista em saúde e nutrição animal. Seu objetivo é analisar cuidadosamente a descrição fornecida de sintomas de um animal de estimação ou de ingredientes de um alimento para pets.

Com base na sua análise, forneça uma avaliação detalhada e sugestões claras para o tutor do pet.

A resposta deve ser exclusivamente em português do Brasil e seguir o formato JSON especificado.

Descrição para análise:
{{{text}}}`, // Using Handlebars to insert the text input
});

const analyzeTextForPetHealthFlow = ai.defineFlow(
  {
    name: 'analyzeTextForPetHealthFlow',
    inputSchema: AnalyzeTextForPetHealthInputSchema,
    outputSchema: AnalyzeTextForPetHealthOutputSchema,
  },
  async (input) => {
    const { output } = await analyzeTextPrompt(input);
    if (!output) {
      throw new Error('No output received from the AI model.');
    }
    return output;
  }
);
