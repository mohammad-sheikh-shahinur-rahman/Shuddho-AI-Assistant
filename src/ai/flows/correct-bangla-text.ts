
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
    .optional(), // This field is optional
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

  যদি ব্যাখ্যা তৈরি করা খুব কঠিন বা সময়সাপেক্ষ হয়, অথবা যদি কোনো সংশোধনের প্রয়োজন না থাকে, তবে explanationOfCorrections ক্ষেত্রটি বাদ দিতে পারো, অথবা একটি খালি স্ট্রিং দিতে পারো। কিন্তু correctedText ক্ষেত্রটি সবসময় প্রদান করতে হবে।
  উদাহরণস্বরূপ, যদি কোনো ব্যাখ্যা না থাকে:
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
    // Robust check for the required correctedText property
    if (!output || typeof output.correctedText !== 'string') {
      throw new Error("AI মডেল থেকে শুদ্ধ করা টেক্সট পাওয়া যায়নি বা উত্তরটি সঠিক ফরম্যাটে নেই।");
    }
    // explanationOfCorrections is optional, so no need for a strict check on its presence here
    // The Zod schema already defines it as optional.
    return output;
  }
);
