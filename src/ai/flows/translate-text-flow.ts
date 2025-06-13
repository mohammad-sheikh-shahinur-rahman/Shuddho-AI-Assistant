
'use server';
/**
 * @fileOverview A text translation AI agent.
 *
 * - translateText - A function that handles the text translation process.
 * - TranslateTextInput - The input type for the translateText function.
 * - TranslateTextOutput - The return type for the translateText functionूं
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const langCodeToName = (code: 'bn' | 'en'): string => {
  if (code === 'bn') return 'Bengali';
  if (code === 'en') return 'English';
  return code;
};

const TranslateTextInputSchema = z.object({
  text: z.string().min(1, { message: "Text to translate cannot be empty." }).describe('The text to translate.'),
  sourceLanguage: z.enum(['bn', 'en'], { errorMap: () => ({ message: "Please select a valid source language." }) }).describe('The source language code (bn for Bengali, en for English).'),
  targetLanguage: z.enum(['bn', 'en'], { errorMap: () => ({ message: "Please select a valid target language." }) }).describe('The target language code (bn for Bengali, en for English).'),
}).refine(data => data.sourceLanguage !== data.targetLanguage, {
  message: "Source and target languages must be different.",
  path: ["targetLanguage"],
});
export type TranslateTextInput = z.infer<typeof TranslateTextInputSchema>;

const TranslateTextOutputSchema = z.object({
  translatedText: z.string().describe('The translated text.'),
});
export type TranslateTextOutput = z.infer<typeof TranslateTextOutputSchema>;

export async function translateText(input: TranslateTextInput): Promise<TranslateTextOutput> {
  return translateTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'translateTextPrompt',
  input: {schema: z.object({
    text: z.string(),
    sourceLanguageName: z.string(),
    targetLanguageName: z.string(),
  })},
  output: {schema: TranslateTextOutputSchema},
  prompt: `You are an expert multilingual translator.
Translate the following text from {{sourceLanguageName}} to {{targetLanguageName}}.
Ensure the translation is accurate, natural-sounding, and preserves the original meaning and tone as much as possible.

Original Text ({{sourceLanguageName}}):
"""
{{{text}}}
"""

Respond with only the translated text in {{targetLanguageName}} in the specified JSON output format.
`,
});

const translateTextFlow = ai.defineFlow(
  {
    name: 'translateTextFlow',
    inputSchema: TranslateTextInputSchema,
    outputSchema: TranslateTextOutputSchema,
  },
  async (input) => {
    const sourceLanguageName = langCodeToName(input.sourceLanguage);
    const targetLanguageName = langCodeToName(input.targetLanguage);
    const actionName = "translateTextFlow";

    try {
      const {output} = await prompt({
          text: input.text,
          sourceLanguageName,
          targetLanguageName,
      });

      // Robust check for the required translatedText property
      if (!output || typeof output.translatedText !== 'string' || output.translatedText.trim() === "") {
          const specificError = "অনুবাদ প্রক্রিয়াকরণ পরবর্তী সমস্যা: AI মডেল থেকে অনুবাদিত টেক্সট পাওয়া যায়নি বা উত্তরটি অসম্পূর্ণ।";
          console.warn(`${actionName}: ${specificError} Input: ${JSON.stringify(input)}. Output: ${JSON.stringify(output)}`);
          throw new Error(specificError);
      }
      return output;
    } catch (flowError) {
        // Log the error within the flow for more specific context
        console.error(`Error within ${actionName} for input ${JSON.stringify(input)}:`, flowError instanceof Error ? `${flowError.message} ${flowError.stack}` : flowError);
        // Re-throw the error so the calling server action can handle it and present a user-friendly message.
        // The server action's catch block will also log this.
        throw flowError;
    }
  }
);

