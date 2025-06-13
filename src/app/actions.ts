
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
        const nodeBuffer = Buffer.from(arrayBuffer);
        const { value } = await mammoth.extractRawText({ buffer: nodeBuffer });
        textToCorrect = value;
      } else if (fileInput.type === "application/pdf" || fileInput.name.endsWith(".pdf")) {
        const pdf = (await import("pdf-parse")).default;
        const data = await pdf(Buffer.from(arrayBuffer)); // pdf-parse expects Buffer
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
        const nodeBuffer = Buffer.from(arrayBuffer);
        const { value } = await mammoth.extractRawText({ buffer: nodeBuffer });
        textToSummarize = value;
      } else if (fileInput.type === "application/pdf" || fileInput.name.endsWith(".pdf")) {
        const pdf = (await import("pdf-parse")).default;
        const data = await pdf(Buffer.from(arrayBuffer)); // pdf-parse expects Buffer
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
  // let lastRole: 'user' | 'model' | null = null; // Not used currently
  // let currentUserMessageForHistory: string | undefined = undefined; // Renamed for clarity

  // Reconstruct history as pairs of user/model messages for the prompt
   currentMessagesWithUser.filter(msg => msg.role === 'user' || msg.role === 'model').forEach((msg, index, arr) => {
    if (msg.role === 'user') {
      // Look ahead for the next model message if this is not the last message
      if (index + 1 < arr.length && arr[index+1].role === 'model') {
         //This is a user message that has a corresponding model response later in the array
      } else if (index === arr.length -1 ) {
         // This is the current user message, which doesn't have a model response yet.
         // It will be passed as the main 'message' to the AI, not as history.
      }
    } else if (msg.role === 'model') {
        // Find the preceding user message for this model message
        if (index > 0 && arr[index-1].role === 'user') {
            historyForAI.push({ user: arr[index-1].content, model: msg.content });
        } else if (index === 0) { // Model message is the first in the list (e.g. initial greeting)
            // This scenario implies the model initiated or there's no preceding user message in the current filtered list.
            // Depending on how history is structured, we might push only the model part.
            // For now, Genkit's history format typically pairs them.
            // If it's an initial greeting from a system message, it's usually not part of 'history' in this way.
            // Given our current use, a model message without a preceding user message in `historyForAI` would be unusual.
        }
    }
  });


  const chatInput: LanguageExpertChatInput = {
    message: userInput, // The current user's message
    history: historyForAI, // The reconstructed history of past user/model pairs
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
