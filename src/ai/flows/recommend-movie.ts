'use server';
/**
 * @fileOverview Recommends movies based on emotion, language, and genre.
 *
 * - recommendMovie - A function that handles the movie recommendation process.
 * - RecommendMovieInput - The input type for the recommendMovie function.
 * - RecommendMovieOutput - The return type for the recommendMovie function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import {getMovieRecommendations, Movie} from '@/services/movie-recommendation';

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
  ).describe('A list of recommended movies.'),
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
  prompt: `Recommend movies based on the user\'s detected emotion, selected language, and genre.\n\nThe user is feeling {{{emotion}}}.\nThe user wants a movie in {{{language}}} and of genre {{{genre}}}.\n\nRecommend movies that match these preferences.\n`,
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
    // Call the getMovieRecommendations service to get movie recommendations
    const movies: Movie[] = await getMovieRecommendations(
      input.emotion,
      input.language,
      input.genre
    );

    // Return the movie recommendations in the expected output format
    return {movies};
  }
);
