
"use server";

import { z } from "zod";
import { correctBanglaText, type CorrectBanglaTextInput, type CorrectBanglaTextOutput } from "@/ai/flows/correct-bangla-text";
import { adjustTone as adjustToneFlow, type AdjustToneInput, type AdjustToneOutput } from "@/ai/flows/adjust-tone";

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
    tone: formData.get("tone") as 'Formal' | 'Friendly' | 'Poetic',
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

const AdjustToneSchema = z.object({
  textToAdjust: z.string().min(1, "সমন্বয় করার জন্য কোনো টেক্সট নেই।"),
  newTone: z.enum(['Formal', 'Friendly', 'Poetic']),
});

export type AdjustToneFormState = {
  result?: AdjustToneOutput;
  error?: string;
  message?: string;
};

export async function handleAdjustTone(
  prevState: AdjustToneFormState,
  formData: FormData
): Promise<AdjustToneFormState> {
  const validatedFields = AdjustToneSchema.safeParse({
    textToAdjust: formData.get("textToAdjust"),
    newTone: formData.get("newTone") as 'Formal' | 'Friendly' | 'Poetic',
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors.textToAdjust?.[0] ||
             validatedFields.error.flatten().fieldErrors.newTone?.[0] ||
             "টোন সমন্বয় ফর্ম ডেটা অবৈধ।",
    };
  }

  const input: AdjustToneInput = {
    text: validatedFields.data.textToAdjust,
    tone: validatedFields.data.newTone,
  };

  try {
    const result = await adjustToneFlow(input);
    return { result };
  } catch (e) {
    console.error("AI Tone Adjustment Error:", e);
    return { error: "টেক্সটের টোন পরিবর্তন করতে একটি সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।" };
  }
}
