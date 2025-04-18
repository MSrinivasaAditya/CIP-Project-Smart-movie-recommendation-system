'use server';
/**
 * @fileOverview Recommends movies based on emotion, language, and genre using Gemini.
 *
 * - recommendMovie - A function that handles the movie recommendation process.
 * - RecommendMovieInput - The input type for the recommendMovie function.
 * - RecommendMovieOutput - The return type for the recommendMovie function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const RecommendMovieInputSchema = z.object({
  emotion: z.string().describe('The detected emotion of the user.'),
  language: z.string().describe('The selected language for the movie.'),
  genre: z.string().describe('The selected genre of the movie.'),
});
export type RecommendMovieInput = z.infer<typeof RecommendMovieInputSchema>;

const RecommendMovieOutputSchema = z.object({
  movies: z.array(
    z.object({
      title: z.string().describe('The title of the movie.'),
      genre: z.string().describe('The genre of the movie.'),
    })
  ).describe('A list of recommended movies.,'),
});
export type RecommendMovieOutput = z.infer<typeof RecommendMovieOutputSchema>;

export async function recommendMovie(input: RecommendMovieInput): Promise<RecommendMovieOutput> {
  return recommendMovieFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendMoviePrompt',
  input: {
    schema: z.object({
      emotion: z.string().describe('The detected emotion of the user.'),
      language: z.string().describe('The selected language for the movie.'),
      genre: z.string().describe('The selected genre of the movie.'),
    }),
  },
  output: {
    schema: z.object({
      movies: z.array(
        z.object({
          title: z.string().describe('The title of the movie.'),
          genre: z.string().describe('The genre of the movie.'),
        })
      ).describe('A list of recommended movies.'),
    }),
  },
  prompt: `You are a movie expert. Recommend three movies based on the user's detected emotion, selected language, and genre.
The output must be a JSON array of objects. Each object must have a "title" and a "genre" field.

User Emotion: {{{emotion}}}
Movie Language: {{{language}}}
Movie Genre: {{{genre}}}

JSON:`,
});

const recommendMovieFlow = ai.defineFlow<
  typeof RecommendMovieInputSchema,
  typeof RecommendMovieOutputSchema
>(
  {
    name: 'recommendMovieFlow',
    inputSchema: RecommendMovieInputSchema,
    outputSchema: RecommendMovieOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
