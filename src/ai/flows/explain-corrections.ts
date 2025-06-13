'use server';

/**
 * @fileOverview An AI agent that explains the corrections made to Bangla text.
 *
 * - explainCorrections - A function that handles the explanation of corrections.
 * - ExplainCorrectionsInput - The input type for the explainCorrections function.
 * - ExplainCorrectionsOutput - The return type for the explainCorrections function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainCorrectionsInputSchema = z.object({
  originalText: z
    .string()
    .describe('The original Bangla text that needs correction.'),
  correctedText: z.string().describe('The corrected Bangla text.'),
});
export type ExplainCorrectionsInput = z.infer<typeof ExplainCorrectionsInputSchema>;

const ExplainCorrectionsOutputSchema = z.object({
  explanation: z
    .string()
    .describe('The explanation of the corrections made to the text.'),
  qualityScore: z
    .number()
    .describe('A score between 0 and 100 indicating the quality of the corrected text.'),
});
export type ExplainCorrectionsOutput = z.infer<typeof ExplainCorrectionsOutputSchema>;

export async function explainCorrections(
  input: ExplainCorrectionsInput
): Promise<ExplainCorrectionsOutput> {
  return explainCorrectionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainCorrectionsPrompt',
  input: {schema: ExplainCorrectionsInputSchema},
  output: {schema: ExplainCorrectionsOutputSchema},
  prompt: `You are an expert in Bangla language and grammar. You are provided with an original text and a corrected text. Your task is to explain the corrections made in the corrected text compared to the original text, and provide a quality score (out of 100) for the corrected text.

Original Text:
"""
{{{originalText}}}
"""

Corrected Text:
"""
{{{correctedText}}}
"""

Explanation:
1. Explanation of corrections
2. Quality Score (0-100)`,
});

const explainCorrectionsFlow = ai.defineFlow(
  {
    name: 'explainCorrectionsFlow',
    inputSchema: ExplainCorrectionsInputSchema,
    outputSchema: ExplainCorrectionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
