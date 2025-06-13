
'use server';
/**
 * @fileOverview A Bangla text summarization AI agent.
 *
 * - summarizeBanglaText - A function that handles the Bangla text summarization process.
 * - SummarizeBanglaTextInput - The input type for the summarizeBanglaText function.
 * - SummarizeBanglaTextOutput - The return type for the summarizeBanglaText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeBanglaTextInputSchema = z.object({
  text: z.string().describe('The Bangla text to summarize.'),
});
export type SummarizeBanglaTextInput = z.infer<typeof SummarizeBanglaTextInputSchema>;

const SummarizeBanglaTextOutputSchema = z.object({
  summary: z.string().describe('The summarized Bangla text.'),
});
export type SummarizeBanglaTextOutput = z.infer<typeof SummarizeBanglaTextOutputSchema>;

export async function summarizeBanglaText(input: SummarizeBanglaTextInput): Promise<SummarizeBanglaTextOutput> {
  return summarizeBanglaTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeBanglaTextPrompt',
  input: {schema: SummarizeBanglaTextInputSchema},
  output: {schema: SummarizeBanglaTextOutputSchema},
  prompt: `তুমি একজন বিশেষজ্ঞ বাংলা সম্পাদক এবং তোমার কাজ হলো প্রদত্ত বাংলা লেখাটির একটি স্পষ্ট, সংক্ষিপ্ত এবং তথ্যবহুল সারাংশ তৈরি করা। মূল লেখার প্রধান বিষয়গুলো যেন সারাংশে ফুটে ওঠে, সেদিকে লক্ষ্য রাখবে। অপ্রয়োজনীয় বিবরণ এড়িয়ে যাবে।

  প্রদত্ত লেখা:
  """
  {{{text}}}
  """

  সারাংশ তৈরি করে নিচের ফরম্যাটে আউটপুট দাও:
  {
    "summary": "সারাংশ এখানে"
  }
  `,
});

const summarizeBanglaTextFlow = ai.defineFlow(
  {
    name: 'summarizeBanglaTextFlow',
    inputSchema: SummarizeBanglaTextInputSchema,
    outputSchema: SummarizeBanglaTextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
