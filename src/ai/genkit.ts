
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
  const errorStack = e instanceof Error && e.stack ? e.stack : 'No stack trace available.';
  const detailedError = `CRITICAL GENKIT INIT FAILURE in src/ai/genkit.ts: ${errorMessage}. This often indicates an issue with your GEMINI_API_KEY (e.g., invalid, incorrect permissions, billing not enabled for the associated Google Cloud project) or the AI service configuration. Please verify your API key and Google Cloud project settings. Original error stack: ${errorStack}`;
  
  console.error(detailedError, e); // Log the detailed message and the original error object

  // Throw a new error with the detailed message. This might give Next.js more specific error text to display.
  throw new Error(detailedError); 
}

export { ai }; // Export the singleton instance
