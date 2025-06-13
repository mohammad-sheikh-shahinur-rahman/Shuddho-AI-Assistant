
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// Augment the NodeJS.Global interface to include your custom property for the singleton
declare global {
  // eslint-disable-next-line no-var
  var __genkit_ai_instance: ReturnType<typeof genkit> | undefined;
}

let ai: ReturnType<typeof genkit>;

try {
  const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  if (!geminiApiKey) {
    const M = 'CRITICAL GENKIT CONFIGURATION ERROR: GEMINI_API_KEY (or GOOGLE_API_KEY) is not set in the environment. The application will not be able to use AI features. Please set it in the .env file.';
    console.error(M);
    // Throwing an error here will prevent the app from starting if the key is missing,
    // making the root cause clearer than a runtime 404.
    throw new Error(M);
  }
  console.log(`Found GEMINI_API_KEY (or GOOGLE_API_KEY). Initializing GoogleAI plugin with model googleai/gemini-1.5-flash-latest...`);

  const googleAIPlugin = googleAI({ apiKey: geminiApiKey });

  const modelName = 'googleai/gemini-1.5-flash-latest'; // Consistent with error logs

  if (process.env.NODE_ENV === 'production') {
    console.log(`Initializing Genkit AI for production with ${modelName}...`);
    ai = genkit({
      plugins: [googleAIPlugin],
      model: modelName,
    });
  } else {
    if (!global.__genkit_ai_instance) {
      console.log(`Initializing Genkit AI for development with ${modelName}...`);
      global.__genkit_ai_instance = genkit({
        plugins: [googleAIPlugin],
        model: modelName,
      });
    }
    ai = global.__genkit_ai_instance;
  }
  console.log(`Genkit AI initialized successfully with model: ${modelName}.`);

} catch (e) {
  const errorMessage = e instanceof Error ? e.message : String(e);
  // Avoid duplicating the "CRITICAL GENKIT CONFIGURATION ERROR" if we threw it.
  if (!errorMessage.startsWith('CRITICAL GENKIT CONFIGURATION ERROR')) {
    const errorStack = e instanceof Error && e.stack ? e.stack : 'No stack trace available.';
    const detailedError = `CRITICAL GENKIT INIT FAILURE in src/ai/genkit.ts: ${errorMessage}. This often indicates an issue with your GEMINI_API_KEY (e.g., invalid, incorrect permissions, billing not enabled for the associated Google Cloud project) or the AI service configuration. Please verify your API key and Google Cloud project settings. Original error stack: ${errorStack}`;
    console.error(detailedError, e); // Log the detailed message and the original error object
    throw e; // Re-throw the original error
  } else {
    // If we threw the "CRITICAL GENKIT CONFIGURATION ERROR", re-throw it.
    console.error(errorMessage); // Ensure it's logged
    throw e;
  }
}

export { ai }; // Export the singleton instance
