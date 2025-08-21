
"use client";

import { useState, useEffect } from "react";
import {
  calculateLaytime,
  type CalculateLaytimeInput,
  type CalculateLaytimeOutput,
} from "@/ai/flows/calculate-laytime";
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
import {
  Loader2,
  AlertCircle,
  Calculator,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Save,
  Hourglass,
} from "lucide-react";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface LaytimeCalculatorProps {
  extractedData: ExtractPortOperationEventsOutput;
}

export function LaytimeCalculator({ extractedData }: LaytimeCalculatorProps) {
  const [laytimeResult, setLaytimeResult] =
    useState<CalculateLaytimeOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (extractedData?.events) {
      setIsLoading(true);
      setError(null);
      calculateLaytime({ events: extractedData.events } as CalculateLaytimeInput)
        .then((result) => {
          if (result) {
            setLaytimeResult(result);
          } else {
            throw new Error("The laytime calculation returned an empty result.");
          }
        })
        .catch((e) => {
          console.error(e);
          setError(
            e.message || "An unexpected error occurred during laytime calculation."
          );
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [extractedData]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">
          Calculating laytime based on event data...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Calculation Failed</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!laytimeResult) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">No laytime data available.</p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <CardHeader className="p-0">
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-6 w-6 text-primary" />
            <span>Laytime Calculation Summary</span>
          </CardTitle>
          <CardDescription>
            A detailed analysis of the vessel's time in port based on the
            Statement of Fact.
          </CardDescription>
        </CardHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Laytime Used</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{laytimeResult.totalLaytime}</div>
                    <p className="text-xs text-muted-foreground">Total time counted against allowable laytime.</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Allowed Laytime</CardTitle>
                    <Hourglass className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{laytimeResult.allowedLaytime}</div>
                    <p className="text-xs text-muted-foreground">As per charter party agreement (default).</p>
                </CardContent>
            </Card>
             <Card className="border-green-500/50 bg-green-500/5">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-green-700 dark:text-green-400">Time Saved (Despatch)</CardTitle>
                    <Save className="h-4 w-4 text-green-700 dark:text-green-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-700 dark:text-green-400">{laytimeResult.timeSaved}</div>
                     <p className="text-xs text-muted-foreground">Operations completed ahead of schedule.</p>
                </CardContent>
            </Card>
            <Card className="border-red-500/50 bg-red-500/5">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-red-700 dark:text-red-400">Extra Time (Demurrage)</CardTitle>
                    <AlertCircle className="h-4 w-4 text-red-700 dark:text-red-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-red-700 dark:text-red-400">{laytimeResult.demurrage}</div>
                     <p className="text-xs text-muted-foreground">Operations exceeded the allowed time.</p>
                </CardContent>
            </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Laytime Event Breakdown</CardTitle>
            <CardDescription>
              Analysis of each port event and its contribution to the total
              laytime.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead className="text-center">Counted?</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {laytimeResult.laytimeEvents.map((event, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{event.event}</TableCell>
                    <TableCell>{event.duration}</TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={event.isCounted ? "default" : "secondary"}
                        className={event.isCounted ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-500 hover:bg-gray-600"}
                      >
                        {event.isCounted ? (
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                        ) : (
                          <XCircle className="h-4 w-4 mr-1" />
                        )}
                        {event.isCounted ? "Yes" : "No"}
                      </Badge>
                    </TableCell>
                    <TableCell className="flex items-center">
                      {event.reason}{" "}
                      {event.reason && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 ml-2 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{event.reason}</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
