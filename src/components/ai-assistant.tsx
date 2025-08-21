"use client";

import { useState, useRef, useEffect } from "react";
import { guideNewUsers } from "@/ai/flows/guide-new-users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function AiAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I'm the SOFA assistant. How can I help you get started?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaViewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaViewportRef.current) {
        scrollAreaViewportRef.current.scrollTo({
            top: scrollAreaViewportRef.current.scrollHeight,
            behavior: "smooth"
        });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    try {
      const result = await guideNewUsers({ query: currentInput });
      if (result && result.response) {
        const assistantMessage: Message = { role: "assistant", content: result.response };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error("Invalid response from AI assistant.");
      }
    } catch (error) {
      console.error(error);
      const errorMessage: Message = { role: "assistant", content: "Sorry, I encountered an error. Please try again." };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="h-full flex flex-col bg-transparent border-0 shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-6 w-6 text-primary" />
          <span>AI Assistant</span>
        </CardTitle>
        <CardDescription>
          Ask me anything about how to use the SOFA platform.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
        <ScrollArea className="flex-1 pr-4 -mr-4">
            <div className="space-y-4" ref={scrollAreaViewportRef}>
                {messages.map((message, index) => (
                <div key={index} className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                    {message.role === 'assistant' && (
                    <Avatar className="h-8 w-8 border border-primary/50">
                        <AvatarFallback className="bg-primary text-primary-foreground"><Bot size={20}/></AvatarFallback>
                    </Avatar>
                    )}
                    <div className={`rounded-lg px-4 py-2 max-w-[80%] whitespace-pre-wrap ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    <p className="text-sm">{message.content}</p>
                    </div>
                    {message.role === 'user' && (
                    <Avatar className="h-8 w-8">
                        <AvatarFallback><User size={20}/></AvatarFallback>
                    </Avatar>
                    )}
                </div>
                ))}
                {isLoading && (
                    <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8 border border-primary/50">
                            <AvatarFallback className="bg-primary text-primary-foreground"><Bot size={20}/></AvatarFallback>
                        </Avatar>
                        <div className="rounded-lg px-4 py-2 bg-muted flex items-center justify-center">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        </div>
                    </div>
                )}
            </div>
        </ScrollArea>
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g., How do I extract events?"
            disabled={isLoading}
            autoComplete="off"
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="bg-accent hover:bg-accent/90">
            <Send className="h-4 w-4 text-accent-foreground" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
