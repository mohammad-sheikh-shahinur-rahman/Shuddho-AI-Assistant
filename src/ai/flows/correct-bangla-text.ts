
'use server';

/**
 * @fileOverview A Bangla text correction AI agent.
 *
 * - correctBanglaText - A function that handles the Bangla text correction process.
 * - CorrectBanglaTextInput - The input type for the correctBanglaText function.
 * - CorrectBanglaTextOutput - The return type for the correctBanglaText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CorrectBanglaTextInputSchema = z.object({
  text: z.string().describe('The Bangla text to correct.'),
});
export type CorrectBanglaTextInput = z.infer<typeof CorrectBanglaTextInputSchema>;

const CorrectBanglaTextOutputSchema = z.object({
  correctedText: z.string().describe('The corrected Bangla text.'),
  explanation: z.string().describe('The explanation of the corrections made.'),
  qualityScore: z.number().describe('The quality score of the corrected text (out of 100).'),
});
export type CorrectBanglaTextOutput = z.infer<typeof CorrectBanglaTextOutputSchema>;

export async function correctBanglaText(input: CorrectBanglaTextInput): Promise<CorrectBanglaTextOutput> {
  return correctBanglaTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'correctBanglaTextPrompt',
  input: {schema: CorrectBanglaTextInputSchema},
  output: {schema: CorrectBanglaTextOutputSchema},
  prompt: `তুমি একজন বাংলা ভাষা বিশেষজ্ঞ। নিচের লেখাটি ব্যাকরণ ও বানান ঠিক করে লেখো এবং ব্যাখ্যা দাও।
  লেখা:
  """
  {{{text}}}
  """
  আউটপুট:
  {
  "correctedText": "শুদ্ধ বাংলা লেখা",
  "explanation": "ব্যাখ্যা",
  "qualityScore": 100
  }
  `,
});

const correctBanglaTextFlow = ai.defineFlow(
  {
    name: 'correctBanglaTextFlow',
    inputSchema: CorrectBanglaTextInputSchema,
    outputSchema: CorrectBanglaTextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
