
"use client";

import { useState } from 'react';
import { SoFProcessor } from '@/components/sof-processor';
import { FloatingAiAssistant } from '@/components/floating-ai-assistant';
import { Anchor, ArrowLeft, LogOut } from 'lucide-react';
import { ClientOceanBackground } from '@/components/client-ocean-background';
import type { ExtractPortOperationEventsOutput } from '@/ai/flows/extract-port-operation-events';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LaytimeCalculator } from '@/components/laytime-calculator';
import { ThemeToggle } from '@/components/theme-toggle';
import { AnalyticsDashboard } from '@/components/analytics-dashboard';
import { Button } from '@/components/ui/button';
import { ExtractedEventsView } from '@/components/extracted-events-view';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/components/auth-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


export default function Home() {
  const [extractedData, setExtractedData] = useState<ExtractPortOperationEventsOutput | null>(null);
  const { user, signOut } = useAuth();

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
            <div className="bg-primary p-2 rounded-md shadow-md">
              <Anchor className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-primary md:text-3xl">SOFA</h1>
          </div>
           <div className="flex items-center gap-4">
              <ThemeToggle />
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className='h-8 w-8'>
                         <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                     </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">My Account</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
          </div>
        </header>

        <div className="w-full max-w-6xl grid grid-cols-1 gap-8 flex-1">
            {!extractedData ? (
                <Card className="bg-card/80 backdrop-blur-sm p-4 md:p-6 rounded-xl shadow-lg border border-border/20">
                    <SoFProcessor 
                        onDataExtracted={handleDataExtracted} 
                    />
                </Card>
            ) : (
                <div className="space-y-6">
                     <div className="flex items-center justify-between">
                        <div className='space-y-1'>
                            <h2 className="text-2xl font-bold tracking-tight">Vessel: {extractedData.vesselName}</h2>
                            <p className="text-muted-foreground">
                                Analysis dashboard for the processed Statement of Fact.
                            </p>
                        </div>
                        <Button variant="outline" onClick={handleReset}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Process New SoF
                        </Button>
                    </div>

                    <Tabs defaultValue="events" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto">
                            <TabsTrigger value="events">Extracted Events</TabsTrigger>
                            <TabsTrigger value="laytime">Laytime Analytics</TabsTrigger>
                            <TabsTrigger value="timeline">Event Timeline</TabsTrigger>
                        </TabsList>
                        <TabsContent value="events">
                            <Card className="bg-card/80 backdrop-blur-sm p-4 md:p-6 rounded-xl shadow-lg border border-border/20">
                                <ExtractedEventsView extractedData={extractedData} />
                            </Card>
                        </TabsContent>
                        <TabsContent value="laytime">
                            <Card className="bg-card/80 backdrop-blur-sm p-4 md:p-6 rounded-xl shadow-lg border border-border/20">
                                <LaytimeCalculator extractedData={extractedData} />
                            </Card>
                        </TabsContent>
                        <TabsContent value="timeline">
                            <Card className="bg-card/80 backdrop-blur-sm p-4 md:p-6 rounded-xl shadow-lg border border-border/20">
                                <AnalyticsDashboard extractedData={extractedData} />
                            </Card>
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
