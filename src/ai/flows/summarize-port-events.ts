
'use server';
/**
 * @fileOverview This file defines a Genkit flow for summarizing port operation events.
 *
 * - summarizePortEvents - A function that takes a list of events and returns a high-level summary.
 * - SummarizePortEventsInput - The input type for the summarizePortEvents function.
 * - SummarizePortEventsOutput - The return type for the summarizePortEvents function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PortEventSchema = z.object({
  event: z.string(),
  category: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  duration: z.string(),
  status: z.string(),
  remark: z.string().optional(),
});

const SummarizePortEventsInputSchema = z.object({
  events: z.array(PortEventSchema).describe('An array of port operation events extracted from the SoF.'),
});
export type SummarizePortEventsInput = z.infer<typeof SummarizePortEventsInputSchema>;

const SummarizePortEventsOutputSchema = z.object({
  summary: z.string().describe('A concise, bulleted summary of the key insights from the port events.'),
});
export type SummarizePortEventsOutput = z.infer<typeof SummarizePortEventsOutputSchema>;


export async function summarizePortEvents(input: SummarizePortEventsInput): Promise<SummarizePortEventsOutput> {
  return summarizePortEventsFlow(input);
}

const summarizePortEventsPrompt = ai.definePrompt({
  name: 'summarizePortEventsPrompt',
  input: {schema: SummarizePortEventsInputSchema},
  output: {schema: SummarizePortEventsOutputSchema},
  prompt: `You are a maritime logistics analyst. Based on the following structured list of port operation events, provide a concise, high-level summary of key insights.

Focus on:
- Total time spent in port.
- Duration of cargo operations.
- Any significant delays or interruptions and their causes.
- Comparison of actual time versus typical or expected times (you can infer this based on common knowledge if not specified).

Present your summary as a bulleted list.

Events:
{{#each events}}
- Event: {{event}} ({{category}})
  - Start: {{startTime}}
  - End: {{endTime}}
  - Duration: {{duration}}
  - Status: {{status}}
  {{#if remark}}- Remark: {{remark}}{{/if}}
{{/each}}

Return the summary in the specified JSON format.`,
});


const summarizePortEventsFlow = ai.defineFlow(
  {
    name: 'summarizePortEventsFlow',
    inputSchema: SummarizePortEventsInputSchema,
    outputSchema: SummarizePortEventsOutputSchema,
  },
  async (input) => {
    const {output} = await summarizePortEventsPrompt(input);
    return output!;
  }
);
