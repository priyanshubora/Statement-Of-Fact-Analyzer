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
  sofDataUri: z.string().describe("The content of the Statement of Fact file as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type ExtractPortOperationEventsInput = z.infer<typeof ExtractPortOperationEventsInputSchema>;

const ExtractPortOperationEventsOutputSchema = z.object({
  vesselName: z.string().describe("The name of the vessel mentioned in the SoF."),
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

Your task is to meticulously analyze the content of the SoF provided and extract the vessel name and all port operation events. You must structure the output accurately into a JSON format.

First, identify the vessel name from the document.

Then, identify each distinct event and its details. Pay close attention to the following critical event types if they are present:
- **Arrival at Anchorage**: The exact moment the ship arrives at the designated waiting area.
- **Notice of Readiness (NOR) Tendered**: The exact date and time the ship's captain declares readiness for cargo operations.
- **Pilot on Board**: The time a local port pilot boards to guide the vessel.
- **Arrival at Berth**: The exact time the ship is securely moored at the dock.
- **Commencement of Cargo Operations**: The time loading or unloading begins.
- **Interruption of Operations**: Any stoppage in work. For each interruption, you must capture the reason (e.g., "rain delay," "equipment failure," "strike"), and its start and end times.
- **Completion of Cargo Operations**: The time loading or unloading is finished.
- **Departure from Berth**: The time the ship leaves the dock.

For each event, determine its category (e.g., 'Arrival', 'Cargo Operations', 'Delays', 'Departure'), its precise start and end times (in YYYY-MM-DD HH:MM format), calculate the duration, determine its status, and include any relevant remarks.

SoF Content:
{{media url=sofDataUri}}

Extract the vessel name and all events, returning them in the specified JSON format. If a specific event type from the list above is not mentioned in the document, do not include it. Ensure every event that is mentioned is captured.`,
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
