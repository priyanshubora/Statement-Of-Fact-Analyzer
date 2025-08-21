'use server';
/**
 * @fileOverview This file defines a Genkit flow for extracting port operation events from Statements of Fact (SoFs).
 *
 * - extractPortOperationEvents - A function that takes the content of an SoF and returns structured data.
 * - ExtractPortOperationEventsInput - The input type for the extractPortOperationEvents function.
 * - ExtractPortOperationEventsOutput - The return type for the extractPortOperationEvents function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractPortOperationEventsInputSchema = z.object({
  sofContent: z.string().describe('The content of the Statement of Fact file.'),
});
export type ExtractPortOperationEventsInput = z.infer<typeof ExtractPortOperationEventsInputSchema>;

const ExtractPortOperationEventsOutputSchema = z.object({
  events: z.array(
    z.object({
      event: z.string().describe('The description of the port operation event.'),
      startTime: z.string().describe('The start time of the event.'),
      endTime: z.string().describe('The end time of the event.'),
    })
  ).describe('An array of port operation events with their start and end times.'),
});
export type ExtractPortOperationEventsOutput = z.infer<typeof ExtractPortOperationEventsOutputSchema>;

export async function extractPortOperationEvents(input: ExtractPortOperationEventsInput): Promise<ExtractPortOperationEventsOutput> {
  return extractPortOperationEventsFlow(input);
}

const extractPortOperationEventsPrompt = ai.definePrompt({
  name: 'extractPortOperationEventsPrompt',
  input: {schema: ExtractPortOperationEventsInputSchema},
  output: {schema: ExtractPortOperationEventsOutputSchema},
  prompt: `You are an AI assistant specializing in extracting port operation events from Statements of Fact (SoFs).

  Your task is to analyze the content of the SoF and identify all port operation events, their start times, and their end times.
  The SoF can have different formats and templates, so you need to be adaptable and identify the relevant information accurately.

  Here is the content of the SoF:
  {{sofContent}}

  Return the extracted information in the following JSON format:
  {{outputSchema}}`,
});

const extractPortOperationEventsFlow = ai.defineFlow(
  {
    name: 'extractPortOperationEventsFlow',
    inputSchema: ExtractPortOperationEventsInputSchema,
    outputSchema: ExtractPortOperationEventsOutputSchema,
  },
  async input => {
    const {output} = await extractPortOperationEventsPrompt(input);
    return output!;
  }
);
