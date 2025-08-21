"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { extractPortOperationEvents } from "@/ai/flows/extract-port-operation-events";
import type { ExtractPortOperationEventsOutput } from "@/ai/flows/extract-port-operation-events";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Download, FileText, Clock } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";

type PortEvent = ExtractPortOperationEventsOutput["events"][0];

const FormSchema = z.object({
  sofContent: z.string().min(50, {
    message: "Statement of Fact must be at least 50 characters.",
  }),
});

export function SoFProcessor() {
  const [events, setEvents] = useState<PortEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { sofContent: "" },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsLoading(true);
    setEvents([]);
    try {
      const result = await extractPortOperationEvents(data);
      if (result && result.events) {
        setEvents(result.events);
        toast({
          title: "Extraction Successful",
          description: "Port operation events have been extracted.",
        });
      } else {
        throw new Error("Invalid response from AI.");
      }
    } catch (error) {
      const e = error as Error;
      console.error(e);
      toast({
        variant: "destructive",
        title: "Extraction Failed",
        description: e.message || "Could not extract events. Please check the content and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const downloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(events, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "sof_events.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };
  
  return (
    <div className="space-y-6 h-full flex flex-col">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <span>SoF Event Extractor</span>
          </CardTitle>
          <CardDescription>
            Paste the content of a Statement of Fact (SoF) below to extract port operation events.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="sofContent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Statement of Fact Content</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Paste SoF text here..."
                        className="resize-y min-h-[150px] lg:min-h-[200px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Extract Events
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {events.length > 0 && (
        <Card className="flex-1 flex flex-col">
          <CardHeader>
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="flex items-center gap-2"><Clock className="h-6 w-6 text-primary" /> Extracted Events</CardTitle>
                    <CardDescription>Review the events extracted from the SoF.</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={downloadJSON}>
                    <Download className="mr-2 h-4 w-4" />
                    JSON
                </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Start Time</TableHead>
                    <TableHead>End Time</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{event.event}</TableCell>
                      <TableCell><Badge variant="secondary">{event.category}</Badge></TableCell>
                      <TableCell>{event.startTime}</TableCell>
                      <TableCell>{event.endTime}</TableCell>
                      <TableCell>{event.duration}</TableCell>
                      <TableCell><Badge variant={event.status === 'Completed' ? 'default' : 'destructive'}>{event.status}</Badge></TableCell>
                      <TableCell>{event.remark}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
