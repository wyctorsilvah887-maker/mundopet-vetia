'use server';
/**
 * @fileOverview Um agente de IA para analisar descrições textuais sobre a saúde ou alimentação de pets.
 *
 * - analyzeTextualPetHealth - Uma função que analisa o texto fornecido e retorna insights.
 * - AnalyzeTextualPetHealthInput - O tipo de entrada para a função analyzeTextualPetHealth.
 * - AnalyzeTextualPetHealthOutput - O tipo de retorno para a função analyzeTextualPetHealth.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeTextualPetHealthInputSchema = z.object({
  description: z
    .string()
    .describe(
      'Uma descrição textual detalhada sobre os sintomas do pet ou detalhes da sua alimentação. Idioma esperado: Português Brasileiro.'
    ),
});
export type AnalyzeTextualPetHealthInput = z.infer<
  typeof AnalyzeTextualPetHealthInputSchema
>;

const AnalyzeTextualPetHealthOutputSchema = z.object({
  analysisSummary: z
    .string()
    .describe(
      'Um resumo da análise feita pela IA sobre a descrição fornecida. Deve estar em Português Brasileiro.'
    ),
  insights: z
    .array(z.string())
    .describe(
      'Pontos chave ou observações relevantes derivados da descrição. Deve estar em Português Brasileiro.'
    ),
  suggestions: z
    .array(z.string())
    .describe(
      'Sugestões de próximas ações ou recomendações com base na análise. Deve estar em Português Brasileiro.'
    ),
  severityLevel: z
    .enum(['Informativo', 'Monitorar', 'Atenção', 'Urgente'])
    .describe(
      'Um nível de severidade ou urgência para a situação descrita. Deve estar em Português Brasileiro.'
    ),
});
export type AnalyzeTextualPetHealthOutput = z.infer<
  typeof AnalyzeTextualPetHealthOutputSchema
>;

export async function analyzeTextualPetHealth(
  input: AnalyzeTextualPetHealthInput
): Promise<AnalyzeTextualPetHealthOutput> {
  return analyzeTextualPetHealthFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeTextualPetHealthPrompt',
  input: {schema: AnalyzeTextualPetHealthInputSchema},
  output: {schema: AnalyzeTextualPetHealthOutputSchema},
  prompt: `Você é um assistente de IA especializado em saúde e nutrição animal, fornecendo análises e insights para tutores de pets.

Analise cuidadosamente a seguinte descrição sobre os sintomas ou alimentação de um pet e forneça uma avaliação preliminar e insights relevantes.

Por favor, forneça sua resposta estritamente no formato JSON, em Português Brasileiro, seguindo o esquema de saída fornecido.

Descrição do Pet: {{{description}}}`,
});

const analyzeTextualPetHealthFlow = ai.defineFlow(
  {
    name: 'analyzeTextualPetHealthFlow',
    inputSchema: AnalyzeTextualPetHealthInputSchema,
    outputSchema: AnalyzeTextualPetHealthOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
