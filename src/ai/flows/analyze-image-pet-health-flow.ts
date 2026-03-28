'use server';
/**
 * @fileOverview Um agente de IA para análise de imagem de saúde animal.
 *
 * - analyzeImagePetHealth - Uma função que gerencia o processo de análise de imagem.
 * - AnalyzeImagePetHealthInput - O tipo de entrada para a função analyzeImagePetHealth.
 * - AnalyzeImagePetHealthOutput - O tipo de retorno para a função analyzeImagePetHealth.
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
  prompt: `Você é uma inteligência artificial especialista em saúde e nutrição animal. Seu objetivo é analisar a imagem fornecida juntamente com a descrição e fornecer um relatório detalhado em português brasileiro.

A imagem pode ser:
1. Um rótulo de ração para análise de ingredientes e informações nutricionais.
2. Um item alimentar desconhecido para identificação e avaliação de toxicidade ou adequação para pets.
3. Uma imagem de um sintoma visual do pet (ex: pele, olhos, feridas, fezes) para análise e possíveis sugestões.

Com base na imagem e na descrição, forneça uma análise, identificação e sugestões, se aplicável, no formato JSON especificado.

Descrição adicional fornecida pelo usuário:
{{{description}}}

Imagem para análise:
{{media url=image}}`,
  model: 'googleai/gemini-1.5-flash',
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
