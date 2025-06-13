'use server';

/**
 * @fileOverview Adjusts the tone of a given text using GenAI. Specifically, this flow modifies
 * the text to match a selected tone (Formal, Friendly, or Poetic).
 *
 * - adjustTone - A function that handles the tone adjustment process.
 * - AdjustToneInput - The input type for the adjustTone function, including the text and desired tone.
 * - AdjustToneOutput - The return type for the adjustTone function, providing the adjusted text.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdjustToneInputSchema = z.object({
  text: z.string().describe('The text to adjust the tone of.'),
  tone: z
    .enum(['Formal', 'Friendly', 'Poetic'])
    .describe('The desired tone for the text.'),
});
export type AdjustToneInput = z.infer<typeof AdjustToneInputSchema>;

const AdjustToneOutputSchema = z.object({
  adjustedText: z.string().describe('The text adjusted to the specified tone.'),
});
export type AdjustToneOutput = z.infer<typeof AdjustToneOutputSchema>;

export async function adjustTone(input: AdjustToneInput): Promise<AdjustToneOutput> {
  return adjustToneFlow(input);
}

const prompt = ai.definePrompt({
  name: 'adjustTonePrompt',
  input: {schema: AdjustToneInputSchema},
  output: {schema: AdjustToneOutputSchema},
  prompt: `You are a skilled writer, adept at adjusting the tone of text.

  Please adjust the following text to be in a {{{tone}}} tone:

  {{{text}}}

  Return only the adjusted text. Do not include any other explanation or commentary.
  `,
});

const adjustToneFlow = ai.defineFlow(
  {
    name: 'adjustToneFlow',
    inputSchema: AdjustToneInputSchema,
    outputSchema: AdjustToneOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
