'use server';
/**
 * @fileOverview Um agente de IA para analisar descrições textuais de alimentos para animais ou sintomas de animais.
 *
 * - analyzeFoodSymptomsText - Uma função que manipula o processo de análise de texto.
 * - AnalyzeFoodSymptomsTextInput - O tipo de entrada para a função analyzeFoodSymptomsText.
 * - AnalyzeFoodSymptomsTextOutput - O tipo de retorno para a função analyzeFoodSymptomsText.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeFoodSymptomsTextInputSchema = z.object({
  description: z
    .string()
    .describe(
      'A descrição em texto sobre ingredientes de alimentos para animais ou sintomas de animais em português brasileiro.'
    ),
});
export type AnalyzeFoodSymptomsTextInput = z.infer<
  typeof AnalyzeFoodSymptomsTextInputSchema
>;

const AnalyzeFoodSymptomsTextOutputSchema = z.object({
  analise_geral: z
    .string()
    .describe('Um resumo geral da análise fornecida em português brasileiro.'),
  problemas_potenciais: z
    .array(z.string())
    .describe('Uma lista de potenciais problemas identificados, em português brasileiro.'),
  recomendacoes: z
    .array(z.string())
    .describe('Uma lista de recomendações com base na análise, em português brasileiro.'),
});
export type AnalyzeFoodSymptomsTextOutput = z.infer<
  typeof AnalyzeFoodSymptomsTextOutputSchema
>;

export async function analyzeFoodSymptomsText(
  input: AnalyzeFoodSymptomsTextInput
): Promise<AnalyzeFoodSymptomsTextOutput> {
  return analyzeFoodSymptomsTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeFoodSymptomsTextPrompt',
  input: {schema: AnalyzeFoodSymptomsTextInputSchema},
  output: {schema: AnalyzeFoodSymptomsTextOutputSchema},
  prompt: `Você é um especialista em nutrição animal e saúde veterinária, com foco em cães e gatos. Sua tarefa é analisar a descrição fornecida de ingredientes de alimentos para animais ou sintomas de animais.

Forneça uma análise detalhada, identifique quaisquer problemas potenciais e ofereça recomendações úteis. Assegure-se de que toda a sua resposta esteja em português brasileiro e formatada como um objeto JSON válido, conforme o schema de saída.

Descrição: {{{description}}}`,
});

const analyzeFoodSymptomsTextFlow = ai.defineFlow(
  {
    name: 'analyzeFoodSymptomsTextFlow',
    inputSchema: AnalyzeFoodSymptomsTextInputSchema,
    outputSchema: AnalyzeFoodSymptomsTextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
