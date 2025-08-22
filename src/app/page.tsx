"use client";

import { useState } from 'react';
import { SoFProcessor } from '@/components/sof-processor';
import { FloatingAiAssistant } from '@/components/floating-ai-assistant';
import { Anchor, ArrowLeft } from 'lucide-react';
import { ClientOceanBackground } from '@/components/client-ocean-background';
import type { ExtractPortOperationEventsOutput } from '@/ai/flows/extract-port-operation-events';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LaytimeCalculator } from '@/components/laytime-calculator';
import { ThemeToggle } from '@/components/theme-toggle';
import { AnalyticsDashboard } from '@/components/analytics-dashboard';
import { Button } from '@/components/ui/button';
import { ExtractedEventsView } from '@/components/extracted-events-view';

export default function Home() {
  const [extractedData, setExtractedData] = useState<ExtractPortOperationEventsOutput | null>(null);

  const handleDataExtracted = (data: ExtractPortOperationEventsOutput) => {
    setExtractedData(data);
  }
  
  const handleReset = () => {
    setExtractedData(null);
  }

  return (
    <div className="relative min-h-screen w-full">
      <ClientOceanBackground />
      <main className="relative z-10 flex flex-col items-center p-4 md:p-8">
        <header className="w-full max-w-6xl flex items-center justify-between p-4 mb-4 md:mb-8">
          <div className="flex items-center gap-3">
            <div className="neumorphic-flat p-3 rounded-full">
              <Anchor className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground/80 md:text-3xl">SOFA</h1>
          </div>
           <div className="flex items-center gap-4">
              <ThemeToggle />
          </div>
        </header>

        <div className="w-full max-w-6xl grid grid-cols-1 gap-8 flex-1">
            {!extractedData ? (
                <div className="neumorphic-flat p-4 md:p-6 rounded-xl">
                    <SoFProcessor 
                        onDataExtracted={handleDataExtracted} 
                    />
                </div>
            ) : (
                <div className="space-y-6">
                     <div className="flex items-center justify-between">
                        <div className='space-y-1'>
                            <h2 className="text-2xl font-bold tracking-tight">Vessel: {extractedData.vesselName}</h2>
                            <p className="text-muted-foreground">
                                Analysis dashboard for the processed Statement of Fact.
                            </p>
                        </div>
                        <Button variant="outline" onClick={handleReset} className="neumorphic-btn">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Process New SoF
                        </Button>
                    </div>

                    <Tabs defaultValue="events" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto neumorphic-inset p-1 rounded-full">
                            <TabsTrigger value="events" className="rounded-full">Extracted Events</TabsTrigger>
                            <TabsTrigger value="laytime" className="rounded-full">Laytime Analytics</TabsTrigger>
                            <TabsTrigger value="timeline" className="rounded-full">Event Timeline</TabsTrigger>
                        </TabsList>
                        <TabsContent value="events" className="mt-6">
                             <div className="neumorphic-flat p-4 md:p-6 rounded-xl">
                                <ExtractedEventsView extractedData={extractedData} />
                            </div>
                        </TabsContent>
                        <TabsContent value="laytime" className="mt-6">
                            <div className="neumorphic-flat p-4 md:p-6 rounded-xl">
                                <LaytimeCalculator laytimeResult={extractedData.laytimeCalculation} />
                            </div>
                        </TabsContent>
                        <TabsContent value="timeline" className="mt-6">
                             <div className="neumorphic-flat p-4 md:p-6 rounded-xl">
                                <AnalyticsDashboard extractedData={extractedData} />
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            )}
        </div>
      </main>
      <FloatingAiAssistant extractedData={extractedData} />
    </div>
  );
}
