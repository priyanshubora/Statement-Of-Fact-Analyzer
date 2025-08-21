'use server';
/**
 * @fileOverview This file defines a Genkit flow for calculating laytime from a series of port operation events.
 *
 * - calculateLaytime - A function that takes a list of events and returns the calculated laytime details.
 * - CalculateLaytimeInput - The input type for the calculateLaytime function.
 * - CalculateLaytimeOutput - The return type for the calculateLaytime function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PortEventSchema = z.object({
  event: z.string().describe('The description of the port operation event.'),
  startTime: z.string().describe('The start time of the event.'),
  endTime: z.string().describe('The end time of the event.'),
});

export const CalculateLaytimeInputSchema = z.object({
  events: z.array(PortEventSchema).describe('An array of port operation events extracted from the SoF.'),
});
export type CalculateLaytimeInput = z.infer<typeof CalculateLaytimeInputSchema>;

export const CalculateLaytimeOutputSchema = z.object({
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
export type CalculateLaytimeOutput = z.infer<typeof CalculateLaytimeOutputSchema>;


export async function calculateLaytime(input: CalculateLaytimeInput): Promise<CalculateLaytimeOutput> {
  return calculateLaytimeFlow(input);
}

const calculateLaytimePrompt = ai.definePrompt({
  name: 'calculateLaytimePrompt',
  input: {schema: CalculateLaytimeInputSchema},
  output: {schema: CalculateLaytimeOutputSchema},
  prompt: `You are an expert in maritime laytime calculation. Your task is to calculate the total laytime based on a list of port operation events from a Statement of Fact (SoF).

You need to determine which events should be counted towards laytime.
- Standard operations like 'Berthing', 'Loading', 'Discharging' are typically counted.
- Delays caused by the vessel or charterer are counted.
- Delays caused by the port, weather, or equipment failure are typically not counted (interruptions).
- Weekends and holidays may or may not be counted depending on the charter party agreement (assume they are not counted unless specified otherwise in the event list).

Based on the following events, calculate the laytime and provide a breakdown. Assume a standard allowed laytime of "3 days".

Events:
{{#each events}}
- Event: {{event}}, Start: {{startTime}}, End: {{endTime}}
{{/each}}

Return the calculated information in the specified JSON format. The totalLaytime should be a summary string. For each event in laytimeEvents, calculate its duration and determine if it is counted towards laytime, providing a brief reason.`,
});


const calculateLaytimeFlow = ai.defineFlow(
  {
    name: 'calculateLaytimeFlow',
    inputSchema: CalculateLaytimeInputSchema,
    outputSchema: CalculateLaytimeOutputSchema,
  },
  async (input) => {
    const {output} = await calculateLaytimePrompt(input);
    return output!;
  }
);
