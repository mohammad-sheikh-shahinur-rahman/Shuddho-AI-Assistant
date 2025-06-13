
"use server";

import { z } from "zod";
import { correctBanglaText, type CorrectBanglaTextInput, type CorrectBanglaTextOutput } from "@/ai/flows/correct-bangla-text";
import mammoth from "mammoth";
// Static import of pdf-parse is removed. It will be dynamically imported below.

// Schema for the form data validation coming from client (for handleCorrectText)
const ClientFormSchema = z.object({
  text: z.string().optional(),
  file: z.custom<File>((val) => val instanceof File, "অনুগ্রহ করে একটি ফাইল নির্বাচন করুন।").optional(),
});


export type CorrectTextFormState = {
  result?: CorrectBanglaTextOutput;
  error?: string;
  message?: string;
  originalText?: string; // To show what was processed
};

export async function handleCorrectText(
  prevState: CorrectTextFormState,
  formData: FormData
): Promise<CorrectTextFormState> {
  const textInput = formData.get("text") as string | null;
  const fileInput = formData.get("file") as File | null;

  let textToCorrect: string | undefined = textInput?.trim() || undefined;
  let source = "টেক্সটবক্স";

  if (fileInput && fileInput.size > 0) {
    source = fileInput.name;
    try {
      const arrayBuffer = await fileInput.arrayBuffer();
      if (arrayBuffer.byteLength === 0) {
        return { error: `ফাইল (${fileInput.name}) খালি অথবা পড়া যাচ্ছে না। অনুগ্রহ করে একটি সঠিক ফাইল আপলোড করুন।` };
      }

      if (fileInput.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || fileInput.name.endsWith(".docx")) {
        const { value } = await mammoth.extractRawText({ arrayBuffer });
        textToCorrect = value;
      } else if (fileInput.type === "application/pdf" || fileInput.name.endsWith(".pdf")) {
        // Dynamically import pdf-parse
        const pdf = (await import("pdf-parse")).default;
        const data = await pdf(Buffer.from(arrayBuffer));
        textToCorrect = data.text;
      } else if (fileInput.type === "text/plain" || fileInput.name.endsWith(".txt")) {
        textToCorrect = Buffer.from(arrayBuffer).toString("utf-8");
      } else {
        return { error: "সমর্থিত নয় এমন ফাইল ফরমেট। অনুগ্রহ করে .docx, .pdf, অথবা .txt ফাইল আপলোড করুন।" };
      }
    } catch (e) {
      console.error("File Parsing Error:", e);
      const errorMessage = e instanceof Error ? e.message : "অজানা ত্রুটি";
      return { error: `ফাইল (${fileInput.name}) প্রসেস করতে সমস্যা হয়েছে: ${errorMessage} অনুগ্রহ করে আবার চেষ্টা করুন।` };
    }
  }

  if (!textToCorrect || textToCorrect.trim() === "") {
    return { error: "অনুগ্রহ করে টেক্সটবক্সে কিছু লিখুন অথবা একটি (.docx, .pdf, .txt) ফাইল আপলোড করুন।" };
  }

  const inputForAI: CorrectBanglaTextInput = {
    text: textToCorrect,
  };

  try {
    const result = await correctBanglaText(inputForAI);
    return { result, originalText: `"${source}" থেকে প্রাপ্ত লেখা`, message: `"${source}" থেকে প্রাপ্ত লেখা সফলভাবে সংশোধন করা হয়েছে।` };
  } catch (e) {
    console.error("AI Correction Error:", e);
    const errorMessage = e instanceof Error ? e.message : "অজানা ত্রুটি";
    return { error: `টেক্সট শুদ্ধ করতে একটি সমস্যা হয়েছে: ${errorMessage} অনুগ্রহ করে আবার চেষ্টা করুন।` };
  }
}
