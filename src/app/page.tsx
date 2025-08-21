
"use client";

import { useState } from 'react';
import { SoFProcessor } from '@/components/sof-processor';
import { FloatingAiAssistant } from '@/components/floating-ai-assistant';
import { Anchor } from 'lucide-react';
import { ClientOceanBackground } from '@/components/client-ocean-background';
import type { ExtractPortOperationEventsOutput } from '@/ai/flows/extract-port-operation-events';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LaytimeCalculator } from '@/components/laytime-calculator';
import { Card } from '@/components/ui/card';

export default function Home() {
  const [extractedData, setExtractedData] = useState<ExtractPortOperationEventsOutput | null>(null);
  const [activeTab, setActiveTab] = useState("processor");

  const handleDataExtracted = (data: ExtractPortOperationEventsOutput) => {
    setExtractedData(data);
    setActiveTab("calculator");
  }

  return (
    <div className="relative min-h-screen w-full">
      <ClientOceanBackground />
      <main className="relative z-10 flex flex-col items-center p-4 md:p-8">
        <header className="w-full max-w-6xl flex items-center justify-between p-4 mb-4 md:mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-md shadow-md">
              <Anchor className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-primary md:text-3xl">SOFA</h1>
          </div>
        </header>
        <div className="w-full max-w-6xl grid grid-cols-1 gap-8 flex-1">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
              <TabsTrigger value="processor">SoF Processor</TabsTrigger>
              <TabsTrigger value="calculator" disabled={!extractedData}>Laytime Analytics</TabsTrigger>
            </TabsList>
            <TabsContent value="processor">
                <Card className="bg-card/80 backdrop-blur-sm p-4 md:p-6 rounded-xl shadow-lg border border-border/20">
                    <SoFProcessor 
                        extractedData={extractedData} 
                        setExtractedData={handleDataExtracted} 
                    />
                </Card>
            </TabsContent>
            <TabsContent value="calculator">
                <Card className="bg-card/80 backdrop-blur-sm p-4 md:p-6 rounded-xl shadow-lg border border-border/20">
                    {extractedData && <LaytimeCalculator extractedData={extractedData} />}
                </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <FloatingAiAssistant extractedData={extractedData} />
    </div>
  );
}
