'use server';
/**
 * @fileOverview An AI agent for analyzing images of animal food labels or symptoms.
 *
 * - analyzeImageFoodSymptoms - A function that handles the image analysis process.
 * - AnalyzeImageFoodSymptomsInput - The input type for the analyzeImageFoodSymptoms function.
 * - AnalyzeImageFoodSymptomsOutput - The return type for the analyzeImageFoodSymptoms function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeImageFoodSymptomsInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "Uma imagem de rótulo de ração ou sintoma de animal, como uma URI de dados que deve incluir um tipo MIME e usar codificação Base64. Formato esperado: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  description: z
    .string()
    .optional()
    .describe(
      'Uma descrição adicional ou contexto sobre a imagem, como o tipo de animal ou o que está sendo observado na imagem.'
    ),
});
export type AnalyzeImageFoodSymptomsInput = z.infer<
  typeof AnalyzeImageFoodSymptomsInputSchema
>;

const AnalyzeImageFoodSymptomsOutputSchema = z.object({
  analysis: z.string().describe(
    'A análise detalhada da imagem, incluindo informações relevantes, possíveis diagnósticos (se aplicável para sintomas) ou detalhes do rótulo da ração, sempre em português brasileiro.'
  ),
});
export type AnalyzeImageFoodSymptomsOutput = z.infer<
  typeof AnalyzeImageFoodSymptomsOutputSchema
>;

export async function analyzeImageFoodSymptoms(
  input: AnalyzeImageFoodSymptomsInput
): Promise<AnalyzeImageFoodSymptomsOutput> {
  return analyzeImageFoodSymptomsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeImageFoodSymptomsPrompt',
  input: {schema: AnalyzeImageFoodSymptomsInputSchema},
  output: {schema: AnalyzeImageFoodSymptomsOutputSchema},
  prompt: `Você é um especialista em saúde animal e nutrição. Sua tarefa é analisar imagens fornecidas e fornecer informações detalhadas em português brasileiro.

Se a imagem for de um rótulo de ração, analise os ingredientes, informações nutricionais, recomendações de uso e quaisquer avisos. Destaque pontos importantes para o proprietário do animal.

Se a imagem for de um sintoma de animal, descreva o que você observa e forneça possíveis causas ou recomendações gerais (não um diagnóstico veterinário definitivo, mas informações úteis para o proprietário). Informe que um veterinário deve ser consultado para um diagnóstico preciso.

Use a seguinte descrição adicional, se fornecida, para contexto:

Descrição: {{{description}}}
Imagem: {{media url=imageDataUri}}`,
});

const analyzeImageFoodSymptomsFlow = ai.defineFlow(
  {
    name: 'analyzeImageFoodSymptomsFlow',
    inputSchema: AnalyzeImageFoodSymptomsInputSchema,
    outputSchema: AnalyzeImageFoodSymptomsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
