'use server';
/**
 * @fileOverview Um agente de IA para analisar imagens relacionadas à saúde de pets, como rótulos de ração, alimentos ou sintomas visíveis.
 *
 * - analyzeImageForPetHealth - Uma função que gerencia o processo de análise de imagem.
 * - AnalyzeImageForPetHealthInput - O tipo de entrada para a função analyzeImageForPetHealth.
 * - AnalyzeImageForPetHealthOutput - O tipo de retorno para a função analyzeImageForPetHealth.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeImageForPetHealthInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "Uma foto de um rótulo de ração, alimento ou sintoma visível em um pet, como um URI de dados que deve incluir um tipo MIME e usar codificação Base64. Formato esperado: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  additionalContext: z
    .string()
    .optional()
    .describe('Qualquer contexto adicional que o usuário queira fornecer sobre a imagem ou o pet.'),
});
export type AnalyzeImageForPetHealthInput = z.infer<
  typeof AnalyzeImageForPetHealthInputSchema
>;

const AnalyzeImageForPetHealthOutputSchema = z.object({
  interpretation: z
    .string()
    .describe(
      'A interpretação da IA sobre a imagem, explicando o que foi identificado e suas implicações para a saúde do pet, em português do Brasil.'
    ),
  recommendations: z
    .string()
    .describe(
      'Recomendações e conselhos práticos baseados na interpretação da imagem, em português do Brasil. Para sintomas, sempre inclua a recomendação de procurar um veterinário.'
    ),
});
export type AnalyzeImageForPetHealthOutput = z.infer<
  typeof AnalyzeImageForPetHealthOutputSchema
>;

export async function analyzeImageForPetHealth(
  input: AnalyzeImageForPetHealthInput
): Promise<AnalyzeImageForPetHealthOutput> {
  return analyzeImageForPetHealthFlow(input);
}

const analyzeImagePrompt = ai.definePrompt({
  name: 'analyzeImageForPetHealthPrompt',
  input: {schema: AnalyzeImageForPetHealthInputSchema},
  output: {schema: AnalyzeImageForPetHealthOutputSchema},
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
    ],
  },
  prompt: `Você é um especialista em nutrição e saúde animal, focado em pets. Sua tarefa é analisar a imagem fornecida, juntamente com qualquer contexto adicional, e oferecer uma interpretação e recomendações claras em português do Brasil.

Baseie sua análise principalmente na imagem, mas considere o contexto adicional para uma resposta mais completa.

Se a imagem for um rótulo de ração, analise os ingredientes e os valores nutricionais, destacando pontos positivos e negativos para a saúde do pet. Forneça uma análise detalhada dos componentes principais.
Se for um alimento, identifique-o e diga se é seguro ou benéfico para o pet, com base nas suas características visíveis. Descreva os potenciais riscos ou benefícios.
Se for um sintoma visível no animal (como uma lesão, erupção, inchaço, etc.), descreva o que você observa e possíveis implicações para a saúde, sempre alertando para a necessidade de consulta veterinária como a principal recomendação.

É crucial que todas as suas respostas, tanto a interpretação quanto as recomendações, sejam fornecidas em português do Brasil.

Contexto Adicional: {{{additionalContext}}}
Foto: {{media url=photoDataUri}}`,
});

const analyzeImageForPetHealthFlow = ai.defineFlow(
  {
    name: 'analyzeImageForPetHealthFlow',
    inputSchema: AnalyzeImageForPetHealthInputSchema,
    outputSchema: AnalyzeImageForPetHealthOutputSchema,
  },
  async input => {
    const {output} = await analyzeImagePrompt(input);
    return output!;
  }
);
