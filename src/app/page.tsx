
"use client";

import { useState } from 'react';
import { SoFProcessor } from '@/components/sof-processor';
import { FloatingAiAssistant } from '@/components/floating-ai-assistant';
import { Anchor } from 'lucide-react';
import { ClientOceanBackground } from '@/components/client-ocean-background';
import type { ExtractPortOperationEventsOutput } from '@/ai/flows/extract-port-operation-events';

export default function Home() {
  const [extractedData, setExtractedData] = useState<ExtractPortOperationEventsOutput | null>(null);

  return (
    <div className="relative min-h-screen w-full">
      <ClientOceanBackground />
      <main className="relative z-10 flex flex-col items-center p-4 md:p-8">
        <header className="w-full max-w-4xl flex items-center justify-between p-4 mb-4 md:mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-md shadow-md">
              <Anchor className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-primary md:text-3xl">SOFA</h1>
          </div>
        </header>
        <div className="w-full max-w-4xl grid grid-cols-1 gap-8 flex-1">
          <div className="bg-card/80 backdrop-blur-sm p-4 md:p-6 rounded-xl shadow-lg border border-border/20">
            <SoFProcessor extractedData={extractedData} setExtractedData={setExtractedData} />
          </div>
        </div>
      </main>
      <FloatingAiAssistant extractedData={extractedData} />
    </div>
  );
}
