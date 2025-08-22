'use server';
/**
 * @fileOverview This file defines a Genkit flow for extracting port operation events from Statements of Fact (SoFs).
 * It also calculates laytime and summarizes the events in a single operation.
 *
 * - extractPortOperationEvents - A function that takes the content of an SoF and returns structured data, laytime calculations, and a summary.
 * - ExtractPortOperationEventsInput - The input type for the extractPortOperationEvents function.
 * - ExtractPortOperationEventsOutput - The return type for the extractPortOperationEvents function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractPortOperationEventsInputSchema = z.object({
  sofContent: z.string().describe("The text content of the Statement of Fact file."),
});
export type ExtractPortOperationEventsInput = z.infer<typeof ExtractPortOperationEventsInputSchema>;

const LaytimeCalculationSchema = z.object({
  totalLaytime: z.string().describe('The total calculated laytime in a human-readable format (e.g., "2 days, 4 hours, 30 minutes").'),
  allowedLaytime: z.string().describe('The standard allowed laytime based on contract (default or specified).'),
  timeSaved: z.string().describe('Time saved if operations finished before allowed laytime expired.'),
  demurrage: z.string().describe('Extra time taken beyond the allowed laytime.'),
  laytimeEvents: z.array(z.object({
    event: z.string(),
    duration: z.string(),
    isCounted: z.boolean().describe('Whether this event duration counts towards the total laytime.'),
    reason: z.string().optional().describe('Reason why the event is or is not counted towards laytime.'),
  })).describe('A breakdown of each event and whether it contributed to the laytime.'),
});
export type LaytimeCalculation = z.infer<typeof LaytimeCalculationSchema>;

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
  laytimeCalculation: LaytimeCalculationSchema.describe('The detailed laytime calculation results.'),
  eventsSummary: z.string().describe('A concise, bulleted summary of the key insights from the port events.'),
});
export type ExtractPortOperationEventsOutput = z.infer<typeof ExtractPortOperationEventsOutputSchema>;

export async function extractPortOperationEvents(input: ExtractPortOperationEventsInput): Promise<ExtractPortOperationEventsOutput> {
  return extractPortOperationEventsFlow(input);
}

const extractPortOperationEventsPrompt = ai.definePrompt({
  name: 'extractPortOperationEventsPrompt',
  input: {schema: ExtractPortOperationEventsInputSchema},
  output: {schema: ExtractPortOperationEventsOutputSchema},
  prompt: `You are an AI assistant specializing in maritime logistics, data extraction, and analysis from Statements of Fact (SoFs).

Your task is to perform three steps in one operation:
1.  **Extract Data**: Meticulously analyze the text content of the SoF provided. Extract the vessel name and all port operation events. Capture critical events like 'Arrival at Anchorage', 'NOR Tendered', 'Pilot on Board', 'Arrival at Berth', 'Commencement/Completion of Cargo Operations', and any interruptions with reasons. For each event, determine its category, times, duration, status, and remarks.
2.  **Calculate Laytime**: Based on the extracted events, perform a laytime calculation. Assume a standard allowed laytime of "3 days". Determine which events count towards laytime (e.g., cargo operations) and which do not (e.g., weather delays). Calculate total laytime used, time saved (despatch), and extra time (demurrage). Provide a breakdown for each event.
3.  **Summarize Key Insights**: Provide a concise, bulleted summary of the key insights. Focus on total time in port, cargo operation duration, and any significant delays.

SoF Content:
{{{sofContent}}}

Return all three parts—the extracted events, the laytime calculation, and the summary—in the specified JSON format.`,
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
