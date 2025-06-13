
'use server';
/**
 * @fileOverview A Language Expert AI Chatbot flow.
 *
 * - languageExpertChat - A function to handle chat interactions with the language expert.
 * - LanguageExpertChatInput - The input type for the languageExpertChat function.
 * - LanguageExpertChatOutput - The return type for the languageExpertChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LanguageExpertChatInputSchema = z.object({
  message: z.string().describe('The user message to the language expert chatbot.'),
  history: z.array(z.object({
    user: z.string().optional().describe("User's previous message in the conversation."),
    model: z.string().optional().describe("Chatbot's previous response in the conversation.")
  })).optional().describe("The conversation history.")
});
export type LanguageExpertChatInput = z.infer<typeof LanguageExpertChatInputSchema>;

const LanguageExpertChatOutputSchema = z.object({
  response: z.string().describe('The language expert chatbot response.'),
});
export type LanguageExpertChatOutput = z.infer<typeof LanguageExpertChatOutputSchema>;

export async function languageExpertChat(input: LanguageExpertChatInput): Promise<LanguageExpertChatOutput> {
  return languageExpertChatFlow(input);
}

const systemPrompt = `তুমি একজন অত্যন্ত জ্ঞানী এবং বন্ধুত্বপূর্ণ বাংলা ভাষা বিশেষজ্ঞ, তোমার নাম "ভাষাবিদ"। তোমার প্রধান কাজ হলো ব্যবহারকারীদের বাংলা ভাষা সংক্রান্ত যেকোনো প্রশ্নে সাহায্য করা। তুমি ব্যাকরণ, বানান, শব্দার্থ, বাক্য গঠন, প্রবাদ-প্রবচন, অনুবাদ, এবং সাহিত্য সম্পর্কিত বিষয়ে বিশদ এবং সঠিক তথ্য দিতে পারো। ব্যবহারকারীর সাথে নম্রভাবে এবং উৎসাহব্যঞ্জক ভাষায় কথা বলবে। যদি কোনো প্রশ্ন তোমার দক্ষতার বাইরে হয়, সেটিও নম্রভাবে জানাবে। তোমার উত্তরে জটিল পরিভাষা এড়িয়ে সহজবোধ্য বাংলা ব্যবহার করবে।`;

const prompt = ai.definePrompt({
  name: 'languageExpertChatPrompt',
  input: {schema: LanguageExpertChatInputSchema},
  output: {schema: LanguageExpertChatOutputSchema},
  system: systemPrompt,
  prompt: `{{#if history}}পূর্ববর্তী কথোপকথন:
{{#each history}}
{{#if user}}ব্যবহারকারী: {{{user}}}{{/if}}
{{#if model}}ভাষাবিদ: {{{model}}}{{/if}}
{{/each}}

{{/if}}
ব্যবহারকারী: {{{message}}}
ভাষাবিদ:`,
});

const languageExpertChatFlow = ai.defineFlow(
  {
    name: 'languageExpertChatFlow',
    inputSchema: LanguageExpertChatInputSchema,
    outputSchema: LanguageExpertChatOutputSchema,
  },
  async (input) => {
    const llmResponse = await prompt(input);
    const output = llmResponse.output;
    // Robust check for the response property
    if (!output || typeof output.response !== 'string' || output.response.trim() === "") {
        return {response: "দুঃখিত, আমি এই মুহূর্তে উত্তর দিতে পারছি না। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।"}
    }
    return {response: output.response};
  }
);
