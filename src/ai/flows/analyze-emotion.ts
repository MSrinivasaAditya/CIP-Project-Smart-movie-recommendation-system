'use server';
/**
 * @fileOverview Detects the emotion of the user from the webcam feed.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const AnalyzeEmotionInputSchema = z.object({
  webcamFeed: z.string().describe('The webcam feed from the user as a data URI (e.g., data:image/jpeg;base64,...).'),
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
      webcamFeed: z.string().describe('The webcam feed from the user as a data URI (e.g., data:image/jpeg;base64,...).'),
    }),
  },
  output: {
    schema: z.object({
      emotion: z.string().describe('The detected emotion of the user.'),
    }),
  },
  prompt: `You are an AI that can analyze a person's emotion from an image.  Here are the emotions you can use: "Happy", "Sad", "Angry", "Neutral", "Excited", "Disgusted", "Surprised", "Fearful".
Analyze the user's emotion from the webcam feed provided as a data URI. Return the detected emotion as a single word.

It is very important that you are accurate in emotion detection.

Image Data URI: {{{webcamFeed}}}

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
  try {
    const {output} = await prompt(input);
    return output!;
  } catch (error) {
    console.error('Error in analyzeEmotionFlow:', error);
    // Re-throw the error or return a default value/error object
    throw new Error(`Emotion analysis failed: ${error}`);
  }
});
