
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
  explanationOfCorrections: z
    .string()
    .describe('A detailed explanation of the corrections made to the text.')
    .optional(), // Made optional
});
export type CorrectBanglaTextOutput = z.infer<typeof CorrectBanglaTextOutputSchema>;

export async function correctBanglaText(input: CorrectBanglaTextInput): Promise<CorrectBanglaTextOutput> {
  return correctBanglaTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'correctBanglaTextPrompt',
  input: {schema: CorrectBanglaTextInputSchema},
  output: {schema: CorrectBanglaTextOutputSchema},
  prompt: `তুমি একজন বাংলা ভাষা বিশেষজ্ঞ। নিচের লেখাটি ব্যাকরণ ও বানান ঠিক করে লেখো এবং কোন কোন পরিবর্তন করা হয়েছে তার বিস্তারিত ব্যাখ্যা দাও। যদি ব্যাখ্যা দেওয়া সম্ভব না হয়, তবে শুধুমাত্র শুদ্ধ লেখাটি দাও।
  লেখা:
  """
  {{{text}}}
  """
  আউটপুট এর গঠন হবে নিম্নরূপ (যদি ব্যাখ্যা দেওয়া সম্ভব হয়, তবে explanationOfCorrections অন্তর্ভুক্ত করবে, অন্যথায় এটি বাদ দেবে):
  {
  "correctedText": "শুদ্ধ বাংলা লেখা",
  "explanationOfCorrections": "কোন কোন জায়গায় কি কি পরিবর্তন করা হয়েছে তার বিস্তারিত ব্যাখ্যা।"
  }

  যদি ব্যাখ্যা তৈরি করা খুব কঠিন বা সময়সাপেক্ষ হয়, তবে শুধুমাত্র "correctedText" অংশটি দাও:
  {
  "correctedText": "শুদ্ধ বাংলা লেখা"
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
