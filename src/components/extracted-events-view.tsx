
"use client"

import type { ExtractPortOperationEventsOutput } from "@/ai/flows/extract-port-operation-events";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, ListTree } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { useMemo } from "react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface ExtractedEventsViewProps {
  extractedData: ExtractPortOperationEventsOutput;
}

export function ExtractedEventsView({ extractedData }: ExtractedEventsViewProps) {
  
  const downloadJSON = () => {
    if (!extractedData) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(extractedData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${extractedData.vesselName.replace(/\s+/g, '_')}_sof_events.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };
  
  const groupedEvents = useMemo(() => {
    if (!extractedData) return {};
    return extractedData.events.reduce((acc, event) => {
      const category = event.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(event);
      return acc;
    }, {} as Record<string, typeof extractedData.events>);
  }, [extractedData]);

  if (!extractedData || extractedData.events.length === 0) {
    return (
      <Card className="neumorphic-flat border-none">
        <CardHeader>
          <CardTitle>No Events Found</CardTitle>
          <CardDescription>Could not find any events in the provided document.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
        <CardHeader className="p-0">
          <div className="flex justify-between items-start">
              <div>
                  <CardTitle className="flex items-center gap-2"><ListTree className="h-6 w-6 text-primary" /> Raw Extracted Events</CardTitle>
                  <CardDescription className="pt-2">
                    The complete list of events and remarks extracted from the Statement of Fact.
                  </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={downloadJSON} className="neumorphic-btn">
                  <Download className="mr-2 h-4 w-4" />
                  Download JSON
              </Button>
          </div>
        </CardHeader>
        <Card className="neumorphic-flat border-none">
          <CardContent className="p-0">
            <Accordion type="multiple" defaultValue={Object.keys(groupedEvents)} className="w-full">
              {Object.entries(groupedEvents).map(([category, events]) => (
                <AccordionItem value={category} key={category} className="border-b-0">
                  <AccordionTrigger className="text-lg font-semibold text-primary/90 hover:no-underline border-b px-6 py-4">
                    <div className="flex items-center gap-2">
                        <span>{category}</span>
                        <div className="neumorphic-flat text-xs px-2.5 py-0.5 rounded-full">{events.length}</div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-0">
                    <div className="overflow-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-none">
                                <TableHead>Event</TableHead>
                                <TableHead>Start Time</TableHead>
                                <TableHead>End Time</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Remarks</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {events.map((event, index) => (
                                <TableRow key={index} className="border-none">
                                    <TableCell className="font-medium">{event.event}</TableCell>
                                    <TableCell>{event.startTime}</TableCell>
                                    <TableCell>{event.endTime}</TableCell>
                                    <TableCell>{event.duration}</TableCell>
                                    <TableCell><div className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", event.status === 'Completed' ? 'neumorphic-flat bg-green-500/20 text-green-700' : 'neumorphic-flat bg-red-500/20 text-red-700')}>{event.status}</div></TableCell>
                                    <TableCell>{event.remark}</TableCell>
                                </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
    </div>
  )
}
