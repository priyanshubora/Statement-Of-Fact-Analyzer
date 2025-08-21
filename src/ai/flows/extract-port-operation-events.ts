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
      event: z.string().describe('A concise title for the port operation event (e.g., "Pilot Onboard", "Cargo Discharging").'),
      category: z.string().describe("The general category of the event (e.g., 'Arrival', 'Cargo Operations', 'Departure', 'Delays')."),
      startTime: z.string().describe('The start time of the event in YYYY-MM-DD HH:MM format.'),
      endTime: z.string().describe('The end time of the event in YYYY-MM-DD HH:MM format.'),
      duration: z.string().describe('The calculated duration of the event (e.g., "2h 30m").'),
      status: z.string().describe("The status of the event (e.g., 'Completed', 'In Progress', 'Delayed')."),
      remark: z.string().optional().describe('Any additional notes, comments or details about the event from the SoF.')
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
  prompt: `You are an AI assistant specializing in maritime logistics and data extraction from Statements of Fact (SoFs).

Your task is to meticulously analyze the content of the SoF provided and extract all port operation events. You must structure the output accurately into a JSON format.

Pay close attention to details. Identify each distinct event, its category (like 'Arrival', 'Cargo Operations', 'Bunkering', 'Delays', 'Departure'), its precise start and end times (in YYYY-MM-DD HH:MM format), calculate the duration, determine its status, and include any relevant remarks.

SoF Content:
\`\`\`
{{sofContent}}
\`\`\`

Extract all events and return them in the specified JSON format. Ensure every event mentioned in the document is captured.`,
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
