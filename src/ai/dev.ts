import { config } from 'dotenv';
config();

import '@/ai/flows/correct-bangla-text.ts';
import '@/ai/flows/score-quality.ts';
import '@/ai/flows/explain-corrections.ts';
import '@/ai/flows/adjust-tone.ts';