
"use server";

import { z } from "zod";
import { correctBanglaText, type CorrectBanglaTextInput } from "@/ai/flows/correct-bangla-text";
import { scoreQuality, type ScoreQualityInput } from "@/ai/flows/score-quality";
import { summarizeBanglaText, type SummarizeBanglaTextInput } from "@/ai/flows/summarize-bangla-text";
import { languageExpertChat, type LanguageExpertChatInput, type LanguageExpertChatOutput } from "@/ai/flows/language-expert-chat";
import mammoth from "mammoth";


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
      console.error("File Parsing Error (Correction):", e);
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
    const correctionResult = await correctBanglaText(correctionInput);
    if (!correctionResult || !correctionResult.correctedText) {
        return { error: "টেক্সট শুদ্ধ করা সম্ভব হয়নি। AI থেকে সঠিক উত্তর পাওয়া যায়নি।" };
    }

    const scoringInput: ScoreQualityInput = {
      correctedText: correctionResult.correctedText,
    };

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
    console.error("AI Processing Error (Correction):", e);
    const errorMessage = e instanceof Error ? e.message : "অজানা ত্রুটি";
    return { error: `AI প্রসেসিং-এ একটি সমস্যা হয়েছে: ${errorMessage} অনুগ্রহ করে আবার চেষ্টা করুন।` };
  }
}


export type SummarizeTextFormState = {
  result?: {
    summary: string;
  };
  error?: string;
  message?: string;
  originalText?: string;
};

export async function handleSummarizeText(
  prevState: SummarizeTextFormState,
  formData: FormData
): Promise<SummarizeTextFormState> {
  const textInput = formData.get("text") as string | null;
  const fileInput = formData.get("file") as File | null;

  let textToSummarize: string | undefined = textInput?.trim() || undefined;
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
        textToSummarize = value;
      } else if (fileInput.type === "application/pdf" || fileInput.name.endsWith(".pdf")) {
        const pdf = (await import("pdf-parse")).default;
        const data = await pdf(Buffer.from(arrayBuffer));
        textToSummarize = data.text;
      } else if (fileInput.type === "text/plain" || fileInput.name.endsWith(".txt")) {
        textToSummarize = Buffer.from(arrayBuffer).toString("utf-8");
      } else {
        return { error: "সমর্থিত নয় এমন ফাইল ফরমেট। অনুগ্রহ করে .docx, .pdf, অথবা .txt ফাইল আপলোড করুন।" };
      }
    } catch (e) {
      console.error("File Parsing Error (Summarization):", e);
      const errorMessage = e instanceof Error ? e.message : "অজানা ত্রুটি";
      return { error: `ফাইল (${fileInput.name}) প্রসেস করতে সমস্যা হয়েছে: ${errorMessage} অনুগ্রহ করে আবার চেষ্টা করুন।` };
    }
  }

  if (!textToSummarize || textToSummarize.trim() === "") {
    return { error: "অনুগ্রহ করে টেক্সটবক্সে কিছু লিখুন অথবা একটি (.docx, .pdf, .txt) ফাইল আপলোড করুন।" };
  }

  const summarizationInput: SummarizeBanglaTextInput = {
    text: textToSummarize,
  };

  try {
    const summarizationResult = await summarizeBanglaText(summarizationInput);
    if (!summarizationResult || !summarizationResult.summary) {
        return { error: "লেখাটির সারাংশ তৈরি করা সম্ভব হয়নি। AI থেকে সঠিক উত্তর পাওয়া যায়নি।" };
    }

    return {
      result: {
        summary: summarizationResult.summary,
      },
      originalText: `"${source}" থেকে প্রাপ্ত লেখার সারাংশ`,
      message: `"${source}" থেকে প্রাপ্ত লেখা সফলভাবে সারাংশ করা হয়েছে।`,
    };
  } catch (e) {
    console.error("AI Processing Error (Summarization):", e);
    const errorMessage = e instanceof Error ? e.message : "অজানা ত্রুটি";
    return { error: `AI প্রসেসিং-এ একটি সমস্যা হয়েছে: ${errorMessage} অনুগ্রহ করে আবার চেষ্টা করুন।` };
  }
}

export type ChatMessage = {
  id: string;
  role: "user" | "model" | "system";
  content: string;
};

export type LanguageExpertChatState = {
  messages: ChatMessage[];
  error?: string;
};

export async function sendMessageToLanguageExpert(
  currentState: LanguageExpertChatState,
  formData: FormData
): Promise<LanguageExpertChatState> {
  const userInput = formData.get("message") as string;
  if (!userInput || userInput.trim() === "") {
    return { ...currentState, error: "অনুগ্রহ করে আপনার প্রশ্ন লিখুন।" };
  }

  const userMessage: ChatMessage = {
    id: crypto.randomUUID(),
    role: "user",
    content: userInput,
  };

  const currentMessagesWithUser = [...currentState.messages, userMessage];

  // Prepare history for the AI flow
  const historyForAI: {user?: string; model?: string}[] = [];
  let lastRole: 'user' | 'model' | null = null;
  let currentUserMessage: string | undefined = undefined;

  // Reconstruct history as pairs of user/model messages for the prompt
   currentMessagesWithUser.filter(msg => msg.role === 'user' || msg.role === 'model').forEach(msg => {
    if (msg.role === 'user') {
      currentUserMessage = msg.content;
    } else if (msg.role === 'model' && currentUserMessage) {
      historyForAI.push({ user: currentUserMessage, model: msg.content });
      currentUserMessage = undefined; // Reset for next pair
    } else if (msg.role === 'model' && !currentUserMessage) {
        // This case (model message without a preceding user message in current history segment)
        // might occur if history starts with a model message, or if there's an unpaired model message.
        // Depending on the desired logic, you might prepend an empty user message or handle differently.
        // For now, we'll assume a model message follows a user message or is a standalone initial greeting.
        // If it's a greeting/initial model message without prior user input, it might be added differently
        // or assumed by the system prompt. Let's push it if it's the very first.
        if (historyForAI.length === 0 && currentMessagesWithUser.indexOf(msg) === 0) {
             historyForAI.push({ model: msg.content });
        }
    }
  });


  const chatInput: LanguageExpertChatInput = {
    message: userInput,
    history: historyForAI.length > 0 ? historyForAI.slice(0, -1) : [], // Send history *before* current user message
  };

  try {
    const aiResponse = await languageExpertChat(chatInput);
    if (!aiResponse || !aiResponse.response) {
      return {
        ...currentState,
        messages: currentMessagesWithUser, // Keep user message
        error: "AI থেকে উত্তর পাওয়া যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।",
      };
    }

    const modelMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "model",
      content: aiResponse.response,
    };

    return {
      messages: [...currentMessagesWithUser, modelMessage],
      error: undefined,
    };
  } catch (e) {
    console.error("Language Expert Chat Error:", e);
    const errorMessage = e instanceof Error ? e.message : "অজানা ত্রুটি";
    return {
      ...currentState,
      messages: currentMessagesWithUser, // Keep user message
      error: `AI চ্যাট প্রসেসিং-এ একটি সমস্যা হয়েছে: ${errorMessage}`,
    };
  }
}
