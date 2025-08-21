
"use client";

import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import * as mammoth from "mammoth";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { extractPortOperationEvents } from "@/ai/flows/extract-port-operation-events";
import type { ExtractPortOperationEventsOutput } from "@/ai/flows/extract-port-operation-events";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, FileText, UploadCloud, File as FileIcon, X } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";

const FormSchema = z.object({
  sofFile: z.instanceof(File).refine(file => file.size > 0, "Please upload a file."),
});

interface SoFProcessorProps {
  onDataExtracted: (data: ExtractPortOperationEventsOutput) => void;
}

export function SoFProcessor({ onDataExtracted }: SoFProcessorProps) {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });
  
  const { setValue, watch, formState: { isSubmitting }, reset } = form;
  const watchedFile = watch("sofFile");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setValue("sofFile", acceptedFiles[0], { shouldValidate: true });
    }
  }, [setValue]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: {
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        'application/pdf': ['.pdf'],
        'text/plain': ['.txt'],
    }
  });

  const fileToText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        reader.onload = (event) => {
          const arrayBuffer = event.target?.result as ArrayBuffer;
          mammoth.extractRawText({ arrayBuffer })
            .then(result => resolve(result.value))
            .catch(reject);
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
      } else {
         reader.onload = () => resolve(reader.result as string);
         reader.onerror = reject;
         reader.readAsText(file);
      }
    });
  };

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      const textContent = await fileToText(data.sofFile);
      const result = await extractPortOperationEvents({ sofContent: textContent });
      if (result && result.events && result.vesselName) {
        onDataExtracted(result);
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
    }
  }

  const handleClear = () => {
    reset({ sofFile: undefined });
  };

  return (
    <>
      <CardHeader className="p-0">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          <span>SoF Event Extractor</span>
        </CardTitle>
        <CardDescription>
          Upload a Statement of Fact (SoF) file (.docx, .pdf, or .txt) to begin.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 mt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="sofFile"
              render={() => (
                <FormItem>
                  <FormControl>
                      <div {...getRootProps()} className={cn("relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted/20 hover:bg-muted/40 transition-colors", isDragActive && "border-primary bg-primary/10")}>
                          <input {...getInputProps()} />
                          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                              <UploadCloud className="w-10 h-10 mb-4 text-muted-foreground" />
                              {isDragActive ? (
                                  <p className="font-semibold text-primary">Drop the file here...</p>
                              ) : (
                                  <>
                                      <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                      <p className="text-xs text-muted-foreground">Supports DOCX, PDF, or TXT files</p>
                                  </>
                              )}
                          </div>
                      </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchedFile && watchedFile.size > 0 ? (
              <div className="flex items-center justify-between p-2 mt-2 text-sm rounded-md border bg-card">
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileIcon className="h-5 w-5 text-muted-foreground shrink-0" />
                  <span className="font-medium truncate">{watchedFile.name}</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0"
                  onClick={handleClear}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : null}

            <Button type="submit" disabled={isSubmitting || !watchedFile} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Extracting Events...' : 'Process Statement of Fact'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </>
  )
}
