"use client";

import { useState, useMemo, useCallback } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { extractPortOperationEvents } from "@/ai/flows/extract-port-operation-events";
import type { ExtractPortOperationEventsOutput } from "@/ai/flows/extract-port-operation-events";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Download, FileText, Clock, Ship, UploadCloud, File as FileIcon, X } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";

type ExtractedData = ExtractPortOperationEventsOutput;

const FormSchema = z.object({
  sofFile: z.instanceof(File).refine(file => file.size > 0, "Please upload a file."),
});

export function SoFProcessor() {
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  const { setValue, watch } = form;
  const watchedFile = watch("sofFile");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setValue("sofFile", acceptedFiles[0], { shouldValidate: true });
    }
  }, [setValue]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
  });

  const fileToDataURI = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsLoading(true);
    setExtractedData(null);
    try {
      const dataUri = await fileToDataURI(data.sofFile);
      const result = await extractPortOperationEvents({ sofDataUri: dataUri });
      if (result && result.events && result.vesselName) {
        setExtractedData(result);
        toast({
          title: "Extraction Successful",
          description: `Extracted ${result.events.length} events for vessel ${result.vesselName}.`,
        });
      } else {
        throw new Error("Invalid response from AI. Missing events or vessel name.");
      }
    } catch (error) {
      const e = error as Error;
      console.error(e);
      toast({
        variant: "destructive",
        title: "Extraction Failed",
        description: e.message || "Could not extract events. Please check the file and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

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

  return (
    <div className="space-y-6 h-full flex flex-col">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <span>SoF Event Extractor</span>
          </CardTitle>
          <CardDescription>
            Upload a Statement of Fact (SoF) file to extract port operation events.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="sofFile"
                render={() => (
                  <FormItem>
                    <FormLabel>Statement of Fact File</FormLabel>
                    <FormControl>
                        <div {...getRootProps()} className={cn("relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/75 transition-colors", isDragActive && "border-primary")}>
                            <input {...getInputProps()} />
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                                {isDragActive ? (
                                    <p className="font-semibold text-primary">Drop the file here...</p>
                                ) : (
                                    <>
                                        <p className="mb-1 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                        <p className="text-xs text-muted-foreground">Any document or text file</p>
                                    </>
                                )}
                            </div>
                        </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchedFile && (
                <div className="flex items-center justify-between p-2 mt-2 text-sm rounded-md border bg-card">
                  <div className="flex items-center gap-2">
                    <FileIcon className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">{watchedFile.name}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setValue("sofFile", new File([], ""), { shouldValidate: true })}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <Button type="submit" disabled={isLoading || !watchedFile} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Extract Events
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {extractedData && extractedData.events.length > 0 && (
        <Card className="flex-1 flex flex-col">
          <CardHeader>
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="flex items-center gap-2"><Clock className="h-6 w-6 text-primary" /> Extracted Events</CardTitle>
                    <CardDescription className="flex items-center gap-2 pt-2">
                      <Ship className="h-4 w-4 text-muted-foreground" /> 
                      <span>Vessel: <strong>{extractedData.vesselName}</strong></span>
                    </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={downloadJSON}>
                    <Download className="mr-2 h-4 w-4" />
                    JSON
                </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <ScrollArea className="h-full pr-4">
              <Accordion type="multiple" defaultValue={Object.keys(groupedEvents)} className="w-full">
                {Object.entries(groupedEvents).map(([category, events]) => (
                  <AccordionItem value={category} key={category}>
                    <AccordionTrigger className="text-lg font-semibold text-primary/90 hover:no-underline">
                      {category} ({events.length})
                    </AccordionTrigger>
                    <AccordionContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
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
                            <TableRow key={index}>
                              <TableCell className="font-medium">{event.event}</TableCell>
                              <TableCell>{event.startTime}</TableCell>
                              <TableCell>{event.endTime}</TableCell>
                              <TableCell>{event.duration}</TableCell>
                              <TableCell><Badge variant={event.status === 'Completed' ? 'default' : 'destructive'}>{event.status}</Badge></TableCell>
                              <TableCell>{event.remark}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
