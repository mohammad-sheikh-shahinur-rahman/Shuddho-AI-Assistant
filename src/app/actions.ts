"use server";

import { z } from "zod";
import { correctBanglaText, type CorrectBanglaTextInput, type CorrectBanglaTextOutput } from "@/ai/flows/correct-bangla-text";

const CorrectTextSchema = z.object({
  text: z.string().min(1, "অনুগ্রহ করে কিছু টেক্সট লিখুন।"),
  tone: z.enum(['Formal', 'Friendly', 'Poetic']),
});

export type CorrectTextFormState = {
  result?: CorrectBanglaTextOutput;
  error?: string;
  message?: string;
};

export async function handleCorrectText(
  prevState: CorrectTextFormState,
  formData: FormData
): Promise<CorrectTextFormState> {
  const validatedFields = CorrectTextSchema.safeParse({
    text: formData.get("text"),
    tone: formData.get("tone"),
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors.text?.[0] || 
             validatedFields.error.flatten().fieldErrors.tone?.[0] ||
             "ফর্ম ডেটা অবৈধ।",
    };
  }

  const input: CorrectBanglaTextInput = {
    text: validatedFields.data.text,
    tone: validatedFields.data.tone,
  };

  try {
    const result = await correctBanglaText(input);
    return { result };
  } catch (e) {
    console.error("AI Correction Error:", e);
    return { error: "টেক্সট শুদ্ধ করতে একটি সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।" };
  }
}
