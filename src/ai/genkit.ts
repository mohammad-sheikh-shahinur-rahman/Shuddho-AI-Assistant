
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// Augment the NodeJS.Global interface to include your custom property for the singleton
declare global {
  // eslint-disable-next-line no-var
  var __genkit_ai_instance: ReturnType<typeof genkit> | undefined;
}

let ai: ReturnType<typeof genkit>;

try {
  if (process.env.NODE_ENV === 'production') {
    // In production, initialize Genkit normally
    console.log('Initializing Genkit AI for production...');
    ai = genkit({
      plugins: [googleAI()],
      model: 'googleai/gemini-1.5-flash-latest',
    });
  } else {
    // In development, ensure the Genkit instance is created only once
    if (!global.__genkit_ai_instance) {
      console.log('Initializing Genkit AI for development...');
      global.__genkit_ai_instance = genkit({
        plugins: [googleAI()],
        model: 'googleai/gemini-1.5-flash-latest',
      });
    }
    ai = global.__genkit_ai_instance;
  }
} catch (e) {
  const errorMessage = e instanceof Error ? e.message : String(e);
  console.error(
    "CRITICAL ERROR DURING GENKIT INITIALIZATION in src/ai/genkit.ts:",
    `This often indicates an issue with your GEMINI_API_KEY (e.g., invalid, incorrect permissions, billing not enabled) or the AI service configuration. Please verify your API key and Google Cloud project settings. Original error: ${errorMessage}`,
    e // Log the original error object for more details
  );
  // Re-throwing the original error might give Next.js more context.
  throw e;
}

export { ai }; // Export the singleton instance

