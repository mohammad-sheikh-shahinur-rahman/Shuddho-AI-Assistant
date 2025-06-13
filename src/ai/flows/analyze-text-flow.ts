
'use server';
/**
 * @fileOverview A Bangla text analysis AI agent.
 *
 * - analyzeText - A function that handles the Bangla text analysis process.
 * - AnalyzeTextInput - The input type for the analyzeText function.
 * - AnalyzeTextOutput - The return type for the analyzeText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeTextInputSchema = z.object({
  text: z.string().describe('The Bangla text to analyze.'),
});
export type AnalyzeTextInput = z.infer<typeof AnalyzeTextInputSchema>;

const AnalyzeTextOutputSchema = z.object({
  wordCount: z.number().describe('The total number of words in the text.'),
  characterCount: z.number().describe('The total number of characters in the text, including spaces.'),
  sentenceCount: z.number().describe('The total number of sentences in the text.'),
  sentiment: z.enum(['positive', 'negative', 'neutral', 'mixed']).describe('The overall sentiment of the text (positive, negative, neutral, or mixed).'),
  sentimentExplanation: z.string().describe('A brief explanation for the identified sentiment (1-2 sentences).'),
});
export type AnalyzeTextOutput = z.infer<typeof AnalyzeTextOutputSchema>;

export async function analyzeText(input: AnalyzeTextInput): Promise<AnalyzeTextOutput> {
  return analyzeTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeTextPrompt',
  input: {schema: AnalyzeTextInputSchema},
  output: {schema: AnalyzeTextOutputSchema},
  prompt: `তুমি একজন বিশেষজ্ঞ টেক্সট বিশ্লেষক। তোমাকে একটি বাংলা লেখা দেওয়া হবে। তোমার কাজ হলো লেখাটি বিশ্লেষণ করে নিম্নলিখিত তথ্যগুলো দেওয়া:

১. শব্দ সংখ্যা (মোট কতগুলো শব্দ আছে)।
২. অক্ষর সংখ্যা (স্পেস সহ মোট কতগুলো অক্ষর আছে)।
৩. বাক্য সংখ্যা (মোট কতগুলো বাক্য আছে)।
৪. লেখার সামগ্রিক অনুভূতি (নিচের একটি নির্বাচন করো: "positive", "negative", "neutral", "mixed")।
৫. অনুভূতির সংক্ষিপ্ত ব্যাখ্যা (কেন এই অনুভূতি নির্বাচন করা হলো, তার এক বা দুই লাইনের ব্যাখ্যা)।

প্রদত্ত লেখা:
"""
{{{text}}}
"""

অনুগ্রহ করে নিচের JSON ফরম্যাটে আউটপুট দাও:
{
  "wordCount": <সংখ্যা>,
  "characterCount": <সংখ্যা>,
  "sentenceCount": <সংখ্যা>,
  "sentiment": "<positive/negative/neutral/mixed>",
  "sentimentExplanation": "<ব্যাখ্যা>"
}
`,
});

const analyzeTextFlow = ai.defineFlow(
  {
    name: 'analyzeTextFlow',
    inputSchema: AnalyzeTextInputSchema,
    outputSchema: AnalyzeTextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    // Robust check for all required properties
    if (!output ||
        typeof output.wordCount !== 'number' ||
        typeof output.characterCount !== 'number' ||
        typeof output.sentenceCount !== 'number' ||
        !['positive', 'negative', 'neutral', 'mixed'].includes(output.sentiment as string) || // Check enum values
        typeof output.sentimentExplanation !== 'string' || output.sentimentExplanation.trim() === ""
    ) {
        throw new Error("AI বিশ্লেষণ থেকে সম্পূর্ণ উত্তর পাওয়া যায়নি বা উত্তরটি সঠিক ফরম্যাটে নেই।");
    }
    return output;
  }
);
