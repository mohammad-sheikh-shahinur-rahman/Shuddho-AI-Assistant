
'use server';
/**
 * @fileOverview A text translation AI agent.
 *
 * - translateText - A function that handles the text translation process.
 * - TranslateTextInput - The input type for the translateText function.
 * - TranslateTextOutput - The return type for the translateText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const langCodeToName = (code: 'bn' | 'en'): string => {
  if (code === 'bn') return 'Bengali';
  if (code === 'en') return 'English';
  // This case should ideally not be reached if input validation is done properly.
  // However, as a fallback, return the code itself or handle as an error.
  return code;
};

const TranslateTextInputSchema = z.object({
  text: z.string().min(1, { message: "Text to translate cannot be empty." }).describe('The text to translate.'),
  sourceLanguage: z.enum(['bn', 'en'], { errorMap: () => ({ message: "Please select a valid source language." }) }).describe('The source language code (bn for Bengali, en for English).'),
  targetLanguage: z.enum(['bn', 'en'], { errorMap: () => ({ message: "Please select a valid target language." }) }).describe('The target language code (bn for Bengali, en for English).'),
}).refine(data => data.sourceLanguage !== data.targetLanguage, {
  message: "Source and target languages must be different.",
  path: ["targetLanguage"], // Or apply to a general form error
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
  input: {schema: z.object({ // Internal schema for the prompt variables
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

    const {output} = await prompt({
        text: input.text,
        sourceLanguageName,
        targetLanguageName,
    });
    if (!output) {
        // This case might indicate an issue with the LLM response or prompt execution
        return { translatedText: "Translation failed: No output from AI model." };
    }
    return output; // output is already of type TranslateTextOutputSchema
  }
);
