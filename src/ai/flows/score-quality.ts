
'use server';

/**
 * @fileOverview This file contains the Genkit flow for scoring the quality of corrected Bangla text
 * and providing an explanation for that score.
 *
 * - scoreQuality - A function that takes corrected text and returns a quality score and its explanation.
 * - ScoreQualityInput - The input type for the scoreQuality function.
 * - ScoreQualityOutput - The return type for the scoreQuality function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ScoreQualityInputSchema = z.object({
  correctedText: z
    .string()
    .describe('The corrected Bangla text to be scored for quality.'),
});
export type ScoreQualityInput = z.infer<typeof ScoreQualityInputSchema>;

const ScoreQualityOutputSchema = z.object({
  qualityScore: z
    .number()
    .describe('The quality score of the corrected text, out of 100.'),
  explanationOfScore: z
    .string()
    .describe('An explanation of why the text received this quality score.'),
});
export type ScoreQualityOutput = z.infer<typeof ScoreQualityOutputSchema>;

export async function scoreQuality(input: ScoreQualityInput): Promise<ScoreQualityOutput> {
  return scoreQualityFlow(input);
}

const prompt = ai.definePrompt({
  name: 'scoreQualityPrompt',
  input: {schema: ScoreQualityInputSchema},
  output: {schema: ScoreQualityOutputSchema},
  prompt: `You are an expert in Bangla language quality assessment.

You will receive corrected Bangla text and provide a quality score out of 100, along with a brief explanation for that score.

Corrected Text: {{{correctedText}}}

Respond with the quality score and explanation for the score in the following format:
{
  "qualityScore": <score>,
  "explanationOfScore": "<explanation for the score>"
}
`,
});

const scoreQualityFlow = ai.defineFlow(
  {
    name: 'scoreQualityFlow',
    inputSchema: ScoreQualityInputSchema,
    outputSchema: ScoreQualityOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("AI মডেল থেকে কোনো বিশ্লেষণ পাওয়া যায়নি বা উত্তরটি সঠিক ফরম্যাটে নেই।");
    }
    return output;
  }
);
