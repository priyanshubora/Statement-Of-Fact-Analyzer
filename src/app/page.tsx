import { SoFProcessor } from '@/components/sof-processor';
import { AiAssistant } from '@/components/ai-assistant';
import { Anchor } from 'lucide-react';
import { ClientOceanBackground } from '@/components/client-ocean-background';


export default function Home() {
  return (
    <div className="relative min-h-screen w-full bg-background">
      <ClientOceanBackground />
      <main className="relative z-10 flex flex-col p-4 md:p-8">
        <header className="w-full max-w-7xl mx-auto flex items-center justify-between p-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-md shadow-md">
              <Anchor className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-primary md:text-3xl">SOFA</h1>
          </div>
        </header>
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
          <div className="bg-card/80 backdrop-blur-sm p-2 md:p-6 rounded-lg shadow-lg border">
            <SoFProcessor />
          </div>
          <div className="bg-card/80 backdrop-blur-sm p-2 md:p-6 rounded-lg shadow-lg border">
            <AiAssistant />
          </div>
        </div>
      </main>
    </div>
  );
}
