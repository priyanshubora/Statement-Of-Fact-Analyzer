import { Ship } from 'lucide-react';
import { cn } from '@/lib/utils';

export function OceanBackground({ className }: { className?: string }) {
  return (
    <div className={cn("absolute inset-0 -z-10 overflow-hidden", className)}>
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-primary/20 to-transparent" />
      <Ship className="absolute bottom-8 left-1/2 -translate-x-1/2 w-32 h-32 text-primary/10 animate-ship-bob" />
    </div>
  );
}
