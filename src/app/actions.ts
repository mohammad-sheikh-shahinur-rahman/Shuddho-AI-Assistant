
"use server";

import { z } from "zod";
import { correctBanglaText, type CorrectBanglaTextInput } from "@/ai/flows/correct-bangla-text";
import { scoreQuality, type ScoreQualityInput } from "@/ai/flows/score-quality";
import mammoth from "mammoth";
// pdf-parse will be dynamically imported below.


export type CorrectTextFormState = {
  result?: {
    correctedText: string;
    explanationOfCorrections: string;
    qualityScore?: number;
    explanationOfScore?: string;
  };
  error?: string;
  message?: string;
  originalText?: string; 
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

  const correctionInput: CorrectBanglaTextInput = {
    text: textToCorrect,
  };

  try {
    // Step 1: Correct text and get explanation of corrections
    const correctionResult = await correctBanglaText(correctionInput);
    if (!correctionResult || !correctionResult.correctedText) {
        return { error: "টেক্সট শুদ্ধ করা সম্ভব হয়নি। AI থেকে সঠিক উত্তর পাওয়া যায়নি।" };
    }

    const scoringInput: ScoreQualityInput = {
      correctedText: correctionResult.correctedText,
    };

    // Step 2: Score the corrected text and get explanation of score
    const scoringResult = await scoreQuality(scoringInput);
     if (!scoringResult) {
        return { error: "টেক্সটের গুণমান স্কোর করা সম্ভব হয়নি। AI থেকে সঠিক উত্তর পাওয়া যায়নি।" };
    }


    return { 
      result: {
        correctedText: correctionResult.correctedText,
        explanationOfCorrections: correctionResult.explanationOfCorrections,
        qualityScore: scoringResult.qualityScore,
        explanationOfScore: scoringResult.explanationOfScore,
      },
      originalText: `"${source}" থেকে প্রাপ্ত লেখা`, 
      message: `"${source}" থেকে প্রাপ্ত লেখা সফলভাবে সংশোধন ও মূল্যায়ন করা হয়েছে।` 
    };
  } catch (e) {
    console.error("AI Processing Error:", e);
    const errorMessage = e instanceof Error ? e.message : "অজানা ত্রুটি";
    return { error: `AI প্রসেসিং-এ একটি সমস্যা হয়েছে: ${errorMessage} অনুগ্রহ করে আবার চেষ্টা করুন।` };
  }
}
