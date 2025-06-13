
"use server";

import { z } from "zod";
import { correctBanglaText, type CorrectBanglaTextInput } from "@/ai/flows/correct-bangla-text";
import { scoreQuality, type ScoreQualityInput } from "@/ai/flows/score-quality";
import { summarizeBanglaText, type SummarizeBanglaTextInput } from "@/ai/flows/summarize-bangla-text";
import { languageExpertChat, type LanguageExpertChatInput, type LanguageExpertChatOutput } from "@/ai/flows/language-expert-chat";
import { translateText, type TranslateTextInput } from "@/ai/flows/translate-text-flow";
import { analyzeText, type AnalyzeTextInput, type AnalyzeTextOutput } from "@/ai/flows/analyze-text-flow";


export type CorrectTextFormState = {
  result?: {
    correctedText: string;
    explanationOfCorrections?: string;
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
      console.log(`File (Correction: ${fileInput.name}) ArrayBuffer byteLength: ${arrayBuffer.byteLength}`);
      if (arrayBuffer.byteLength === 0) {
        return { error: `ফাইল (${fileInput.name}) খালি অথবা পড়া যাচ্ছে না। অনুগ্রহ করে একটি সঠিক ফাইল আপলোড করুন।` };
      }

      if (fileInput.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || fileInput.name.endsWith(".docx")) {
        try {
          const mammothModule = await import("mammoth");
          const nodeBuffer = Buffer.from(arrayBuffer);
          const { value } = await mammothModule.extractRawText({ buffer: nodeBuffer });
          textToCorrect = value;
          if (!textToCorrect || textToCorrect.trim() === "") {
            return { error: `DOCX ফাইল (${fileInput.name}) থেকে কোনো টেক্সট এক্সট্র্যাক্ট করা যায়নি। ফাইলটি পরীক্ষা করুন।` };
          }
        } catch (docxError) {
          console.error(`DOCX Parsing Error (Correction: ${fileInput.name}):`, docxError);
          const errorMessage = docxError instanceof Error ? docxError.message : "অজানা DOCX প্রসেসিং ত্রুটি";
          return { error: `DOCX ফাইল (${fileInput.name}) প্রসেস করতে সমস্যা হয়েছে: ${errorMessage}। সার্ভার লগ দেখুন।` };
        }
      } else if (fileInput.type === "application/pdf" || fileInput.name.endsWith(".pdf")) {
        const pdf = (await import("pdf-parse")).default;
        const data = await pdf(Buffer.from(arrayBuffer));
        textToCorrect = data.text;
      } else if (fileInput.type === "text/plain" || fileInput.name.endsWith(".txt")) {
        textToCorrect = Buffer.from(arrayBuffer).toString("utf-8");
      } else {
        return { error: "সমর্থিত নয় এমন ফাইল ফরমেট। অনুগ্রহ করে .docx, .pdf, অথবা .txt ফাইল আপলোড করুন।" };
      }

      if (!textToCorrect || textToCorrect.trim() === "") {
        return { error: `ফাইল (${fileInput.name}) থেকে কোনো টেক্সট পাওয়া যায়নি অথবা ফাইলটি খালি।` };
      }
    } catch (e) {
      console.error(`File Processing Error (Correction: ${fileInput.name}):`, e);
      const errorStack = e instanceof Error && e.stack ? e.stack : 'No stack trace available.';
      const errorMessage = e instanceof Error ? e.message : "অজানা ত্রুটি";
      return { error: `ফাইল (${fileInput.name}) প্রসেস করতে সমস্যা হয়েছে: ${errorMessage} অনুগ্রহ করে আবার চেষ্টা করুন। সার্ভার লগ দেখুন। \nStack: ${errorStack}` };
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
    if (!correctionResult || typeof correctionResult.correctedText !== 'string') {
        console.error("Invalid correctionResult from AI flow in handleCorrectText:", JSON.stringify(correctionResult));
        return { error: "টেক্সট শুদ্ধ করা সম্ভব হয়নি। AI থেকে একটি ত্রুটিপূর্ণ বা অসম্পূর্ণ উত্তর পাওয়া গেছে (correction)। বিস্তারিত জানতে সার্ভার লগ দেখুন।" };
    }

    const scoringInput: ScoreQualityInput = {
      correctedText: correctionResult.correctedText,
    };

    const scoringResult = await scoreQuality(scoringInput);
     if (!scoringResult || typeof scoringResult.qualityScore !== 'number' || typeof scoringResult.explanationOfScore !== 'string') {
        console.error("Invalid scoringResult from AI flow in handleCorrectText:", JSON.stringify(scoringResult));
        return { error: "টেক্সটের গুণমান স্কোর করা সম্ভব হয়নি। AI থেকে একটি ত্রুটিপূর্ণ বা অসম্পূর্ণ উত্তর পাওয়া গেছে (scoring)। বিস্তারিত জানতে সার্ভার লগ দেখুন।" };
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
    console.error(`AI Processing Error (handleCorrectText, source: ${source}):`, e);
    const errorStack = e instanceof Error && e.stack ? e.stack : 'No stack trace available.';
    const errorMessage = e instanceof Error ? e.message : "অজানা ত্রুটি";
    return { error: `AI প্রসেসিং-এ একটি সমস্যা হয়েছে (${source}). অনুগ্রহ করে আবার চেষ্টা করুন বা বিস্তারিত জানতে সার্ভার লগ দেখুন। ত্রুটি: ${errorMessage} \nStack: ${errorStack}` };
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
      console.log(`File (Summarization: ${fileInput.name}) ArrayBuffer byteLength: ${arrayBuffer.byteLength}`);
      if (arrayBuffer.byteLength === 0) {
        return { error: `ফাইল (${fileInput.name}) খালি অথবা পড়া যাচ্ছে না। অনুগ্রহ করে একটি সঠিক ফাইল আপলোড করুন।` };
      }

      if (fileInput.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || fileInput.name.endsWith(".docx")) {
        try {
          const mammothModule = await import("mammoth");
          const nodeBuffer = Buffer.from(arrayBuffer);
          const { value } = await mammothModule.extractRawText({ buffer: nodeBuffer });
          textToSummarize = value;
          if (!textToSummarize || textToSummarize.trim() === "") {
            return { error: `DOCX ফাইল (${fileInput.name}) থেকে কোনো টেক্সট এক্সট্র্যাক্ট করা যায়নি। ফাইলটি পরীক্ষা করুন।` };
          }
        } catch (docxError) {
          console.error(`DOCX Parsing Error (Summarization: ${fileInput.name}):`, docxError);
          const errorMessage = docxError instanceof Error ? docxError.message : "অজানা DOCX প্রসেসিং ত্রুটি";
          return { error: `DOCX ফাইল (${fileInput.name}) প্রসেস করতে সমস্যা হয়েছে: ${errorMessage}। সার্ভার লগ দেখুন।` };
        }
      } else if (fileInput.type === "application/pdf" || fileInput.name.endsWith(".pdf")) {
        const pdf = (await import("pdf-parse")).default;
        const data = await pdf(Buffer.from(arrayBuffer));
        textToSummarize = data.text;
      } else if (fileInput.type === "text/plain" || fileInput.name.endsWith(".txt")) {
        textToSummarize = Buffer.from(arrayBuffer).toString("utf-8");
      } else {
        return { error: "সমর্থিত নয় এমন ফাইল ফরমেট। অনুগ্রহ করে .docx, .pdf, অথবা .txt ফাইল আপলোড করুন।" };
      }
      if (!textToSummarize || textToSummarize.trim() === "") {
        return { error: `ফাইল (${fileInput.name}) থেকে কোনো টেক্সট পাওয়া যায়নি অথবা ফাইলটি খালি।` };
      }
    } catch (e) {
      console.error(`File Processing Error (Summarization: ${fileInput.name}):`, e);
      const errorStack = e instanceof Error && e.stack ? e.stack : 'No stack trace available.';
      const errorMessage = e instanceof Error ? e.message : "অজানা ত্রুটি";
      return { error: `ফাইল (${fileInput.name}) প্রসেস করতে সমস্যা হয়েছে: ${errorMessage} অনুগ্রহ করে আবার চেষ্টা করুন। সার্ভার লগ দেখুন। \nStack: ${errorStack}` };
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
    if (!summarizationResult || !summarizationResult.summary || summarizationResult.summary.trim() === "") {
        console.error("Invalid summarizationResult from AI flow in handleSummarizeText:", JSON.stringify(summarizationResult));
        return { error: "লেখাটির সারাংশ তৈরি করা সম্ভব হয়নি। AI থেকে একটি ত্রুটিপূর্ণ বা অসম্পূর্ণ উত্তর পাওয়া গেছে। বিস্তারিত জানতে সার্ভার লগ দেখুন।" };
    }

    return {
      result: {
        summary: summarizationResult.summary,
      },
      originalText: `"${source}" থেকে প্রাপ্ত লেখার সারাংশ`,
      message: `"${source}" থেকে প্রাপ্ত লেখা সফলভাবে সারাংশ করা হয়েছে।`,
    };
  } catch (e) {
    console.error(`AI Processing Error (handleSummarizeText, source: ${source}):`, e);
    const errorStack = e instanceof Error && e.stack ? e.stack : 'No stack trace available.';
    const errorMessage = e instanceof Error ? e.message : "অজানা ত্রুটি";
    return { error: `AI প্রসেসিং-এ একটি সমস্যা হয়েছে (${source}). অনুগ্রহ করে আবার চেষ্টা করুন বা বিস্তারিত জানতে সার্ভার লগ দেখুন। ত্রুটি: ${errorMessage} \nStack: ${errorStack}` };
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
  const historyForAI: {user?: string; model?: string}[] = [];

   currentMessagesWithUser.filter(msg => msg.role === 'user' || msg.role === 'model').forEach((msg, index, arr) => {
    if (msg.role === 'user') {
      // User messages are added to history only if they have a subsequent model response
      // The current user message (last in array if it's a user message) is handled by `chatInput.message`
    } else if (msg.role === 'model') {
        if (index > 0 && arr[index-1].role === 'user') {
            historyForAI.push({ user: arr[index-1].content, model: msg.content });
        }
    }
  });


  const chatInput: LanguageExpertChatInput = {
    message: userInput,
    history: historyForAI,
  };

  try {
    const aiResponse = await languageExpertChat(chatInput);
    if (!aiResponse || !aiResponse.response || aiResponse.response.trim() === "") {
      console.error("Invalid aiResponse from languageExpertChat flow in sendMessageToLanguageExpert:", JSON.stringify(aiResponse));
      return {
        ...currentState,
        messages: currentMessagesWithUser,
        error: "AI থেকে উত্তর পাওয়া যায়নি বা উত্তরটি অসম্পূর্ণ। অনুগ্রহ করে আবার চেষ্টা করুন বা বিস্তারিত জানতে সার্ভার লগ দেখুন।",
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
    console.error("AI Processing Error (sendMessageToLanguageExpert):", e);
    const errorStack = e instanceof Error && e.stack ? e.stack : 'No stack trace available.';
    const errorMessage = e instanceof Error ? e.message : "অজানা ত্রুটি";
    return {
      ...currentState,
      messages: currentMessagesWithUser,
      error: `AI চ্যাট প্রসেসিং-এ একটি সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন বা বিস্তারিত জানতে সার্ভার লগ দেখুন। ত্রুটি: ${errorMessage} \nStack: ${errorStack}`,
    };
  }
}

export type TranslateTextFormState = {
  result?: {
    translatedText: string;
  };
  error?: string;
  message?: string;
  originalTextSnippet?: string;
  sourceLang?: 'bn' | 'en';
  targetLang?: 'bn' | 'en';
};

export async function handleTranslateText(
  prevState: TranslateTextFormState,
  formData: FormData
): Promise<TranslateTextFormState> {
  const textInput = formData.get("text") as string | null;
  const sourceLanguage = formData.get("sourceLanguage") as 'bn' | 'en' | null;
  const targetLanguage = formData.get("targetLanguage") as 'bn' | 'en' | null;

  if (!textInput || textInput.trim() === "") {
    return { error: "অনুবাদ করার জন্য অনুগ্রহ করে কিছু টেক্সট লিখুন।" };
  }
  if (!sourceLanguage) {
    return { error: "অনুগ্রহ করে মূল ভাষা নির্বাচন করুন।" };
  }
  if (!targetLanguage) {
    return { error: "অনুগ্রহ করে লক্ষ্য ভাষা নির্বাচন করুন।" };
  }
  if (sourceLanguage === targetLanguage) {
    return { error: "মূল এবং লক্ষ্য ভাষা একই হতে পারবে না।" };
  }

  const translationInput: TranslateTextInput = {
    text: textInput,
    sourceLanguage: sourceLanguage,
    targetLanguage: targetLanguage,
  };

  try {
    const translationResult = await translateText(translationInput);
    if (!translationResult || !translationResult.translatedText || translationResult.translatedText.trim() === "") {
        console.error("Invalid translationResult from AI flow in handleTranslateText:", JSON.stringify(translationResult));
        return { error: "টেক্সট অনুবাদ করা সম্ভব হয়নি। AI থেকে একটি ত্রুটিপূর্ণ বা অসম্পূর্ণ উত্তর পাওয়া গেছে। বিস্তারিত জানতে সার্ভার লগ দেখুন।" };
    }

    const langToName = (lang: 'bn' | 'en') => lang === 'bn' ? 'বাংলা' : 'ইংরেজি';

    return {
      result: {
        translatedText: translationResult.translatedText,
      },
      originalTextSnippet: `"${textInput.substring(0, 70)}${textInput.length > 70 ? '...' : ''}" (${langToName(sourceLanguage)} থেকে ${langToName(targetLanguage)})`,
      message: `টেক্সট সফলভাবে অনুবাদ করা হয়েছে।`,
      sourceLang: sourceLanguage,
      targetLang: targetLanguage,
    };
  } catch (e) {
    console.error("AI Processing Error (handleTranslateText):", e);
    const errorStack = e instanceof Error && e.stack ? e.stack : 'No stack trace available.';
    const errorMessage = e instanceof Error ? e.message : "অজানা ত্রুটি";
    return { error: `AI অনুবাদ প্রসেসিং-এ একটি সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন বা বিস্তারিত জানতে সার্ভার লগ দেখুন। ত্রুটি: ${errorMessage} \nStack: ${errorStack}` };
  }
}


export type AnalyzeTextFormState = {
  result?: AnalyzeTextOutput;
  error?: string;
  message?: string;
  originalTextSource?: string; 
};

export async function handleAnalyzeText(
  prevState: AnalyzeTextFormState,
  formData: FormData
): Promise<AnalyzeTextFormState> {
  const textInput = formData.get("text") as string | null;
  const fileInput = formData.get("file") as File | null;

  let textToAnalyze: string | undefined = textInput?.trim() || undefined;
  let source = "টেক্সটবক্স";

  if (fileInput && fileInput.size > 0) {
    source = fileInput.name;
    try {
      const arrayBuffer = await fileInput.arrayBuffer();
      console.log(`File (Analysis: ${fileInput.name}) ArrayBuffer byteLength: ${arrayBuffer.byteLength}`);
      if (arrayBuffer.byteLength === 0) {
        return { error: `ফাইল (${fileInput.name}) খালি অথবা পড়া যাচ্ছে না। অনুগ্রহ করে একটি সঠিক ফাইল আপলোড করুন।` };
      }

      if (fileInput.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || fileInput.name.endsWith(".docx")) {
        try {
          const mammothModule = await import("mammoth");
          const nodeBuffer = Buffer.from(arrayBuffer);
          const { value } = await mammothModule.extractRawText({ buffer: nodeBuffer });
          textToAnalyze = value;
          if (!textToAnalyze || textToAnalyze.trim() === "") {
            return { error: `DOCX ফাইল (${fileInput.name}) থেকে কোনো টেক্সট এক্সট্র্যাক্ট করা যায়নি। ফাইলটি পরীক্ষা করুন।` };
          }
        } catch (docxError) {
          console.error(`DOCX Parsing Error (Analysis: ${fileInput.name}):`, docxError);
          const errorMessage = docxError instanceof Error ? docxError.message : "অজানা DOCX প্রসেসিং ত্রুটি";
          return { error: `DOCX ফাইল (${fileInput.name}) প্রসেস করতে সমস্যা হয়েছে: ${errorMessage}। সার্ভার লগ দেখুন।` };
        }
      } else if (fileInput.type === "application/pdf" || fileInput.name.endsWith(".pdf")) {
        const pdf = (await import("pdf-parse")).default;
        const data = await pdf(Buffer.from(arrayBuffer));
        textToAnalyze = data.text;
      } else if (fileInput.type === "text/plain" || fileInput.name.endsWith(".txt")) {
        textToAnalyze = Buffer.from(arrayBuffer).toString("utf-8");
      } else {
        return { error: "সমর্থিত নয় এমন ফাইল ফরমেট। অনুগ্রহ করে .docx, .pdf, অথবা .txt ফাইল আপলোড করুন।" };
      }
      if (!textToAnalyze || textToAnalyze.trim() === "") {
        return { error: `ফাইল (${fileInput.name}) থেকে কোনো টেক্সট পাওয়া যায়নি অথবা ফাইলটি খালি।` };
      }
    } catch (e) {
      console.error(`File Processing Error (Analysis: ${fileInput.name}):`, e);
      const errorStack = e instanceof Error && e.stack ? e.stack : 'No stack trace available.';
      const errorMessage = e instanceof Error ? e.message : "অজানা ত্রুটি";
      return { error: `ফাইল (${fileInput.name}) প্রসেস করতে সমস্যা হয়েছে: ${errorMessage} অনুগ্রহ করে আবার চেষ্টা করুন। সার্ভার লগ দেখুন। \nStack: ${errorStack}` };
    }
  }

  if (!textToAnalyze || textToAnalyze.trim() === "") {
    return { error: "অনুগ্রহ করে টেক্সটবক্সে কিছু লিখুন অথবা একটি (.docx, .pdf, .txt) ফাইল আপলোড করুন।" };
  }

  const analysisInput: AnalyzeTextInput = {
    text: textToAnalyze,
  };

  try {
    const analysisResult = await analyzeText(analysisInput);
    if (!analysisResult || 
        typeof analysisResult.wordCount !== 'number' ||
        typeof analysisResult.characterCount !== 'number' ||
        typeof analysisResult.sentenceCount !== 'number' ||
        !['positive', 'negative', 'neutral', 'mixed'].includes(analysisResult.sentiment) ||
        typeof analysisResult.sentimentExplanation !== 'string' || analysisResult.sentimentExplanation.trim() === ""
    ) {
        console.error("Invalid analysisResult from AI flow in handleAnalyzeText:", JSON.stringify(analysisResult));
        return { error: "টেক্সট বিশ্লেষণ করা সম্ভব হয়নি। AI থেকে একটি ত্রুটিপূর্ণ বা অসম্পূর্ণ উত্তর পাওয়া গেছে। বিস্তারিত জানতে সার্ভার লগ দেখুন।" };
    }

    return {
      result: analysisResult,
      originalTextSource: `"${source}" থেকে প্রাপ্ত লেখার বিশ্লেষণ`,
      message: `"${source}" থেকে প্রাপ্ত লেখা সফলভাবে বিশ্লেষণ করা হয়েছে।`,
    };
  } catch (e) {
    console.error(`AI Processing Error (handleAnalyzeText, source: ${source}):`, e);
    const errorStack = e instanceof Error && e.stack ? e.stack : 'No stack trace available.';
    const errorMessage = e instanceof Error ? e.message : "অজানা ত্রুটি";
    return { error: `AI প্রসেসিং-এ একটি সমস্যা হয়েছে (${source}). অনুগ্রহ করে আবার চেষ্টা করুন বা বিস্তারিত জানতে সার্ভার লগ দেখুন। ত্রুটি: ${errorMessage} \nStack: ${errorStack}` };
  }
}

