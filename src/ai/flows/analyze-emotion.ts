'use server';
/**
 * @fileOverview Detects the emotion of the user from the webcam feed.
 *
 * - analyzeEmotion - A function that handles the emotion analysis process.
 * - AnalyzeEmotionInput - The input type for the analyzeEmotion function.
 * - AnalyzeEmotionOutput - The return type for the analyzeEmotion function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const AnalyzeEmotionInputSchema = z.object({
  webcamFeed: z.string().describe('The webcam feed from the user.'),
});
export type AnalyzeEmotionInput = z.infer<typeof AnalyzeEmotionInputSchema>;

const AnalyzeEmotionOutputSchema = z.object({
  emotion: z.string().describe('The detected emotion of the user.'),
});
export type AnalyzeEmotionOutput = z.infer<typeof AnalyzeEmotionOutputSchema>;

export async function analyzeEmotion(input: AnalyzeEmotionInput): Promise<AnalyzeEmotionOutput> {
  return analyzeEmotionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeEmotionPrompt',
  input: {
    schema: z.object({
      webcamFeed: z.string().describe('The webcam feed from the user.'),
    }),
  },
  output: {
    schema: z.object({
      emotion: z.string().describe('The detected emotion of the user.'),
    }),
  },
  prompt: `Analyze the user's emotion from the webcam feed. Return just the emotion.

Webcam feed: {{{webcamFeed}}}

Detected emotion:`,    
});

const analyzeEmotionFlow = ai.defineFlow<
  typeof AnalyzeEmotionInputSchema,
  typeof AnalyzeEmotionOutputSchema
>({
  name: 'analyzeEmotionFlow',
  inputSchema: AnalyzeEmotionInputSchema,
  outputSchema: AnalyzeEmotionOutputSchema,
},
async input => {
  const {output} = await prompt(input);
  return output!;
});
