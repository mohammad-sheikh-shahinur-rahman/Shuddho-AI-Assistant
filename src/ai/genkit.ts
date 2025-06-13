
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// Augment the NodeJS.Global interface to include your custom property for the singleton
declare global {
  // eslint-disable-next-line no-var
  var __genkit_ai_instance: ReturnType<typeof genkit> | undefined;
}

let ai: ReturnType<typeof genkit>;

if (process.env.NODE_ENV === 'production') {
  // In production, initialize Genkit normally
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

export { ai }; // Export the singleton instance
