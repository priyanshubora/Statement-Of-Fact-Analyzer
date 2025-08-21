"use client";

import dynamic from 'next/dynamic';

const OceanBackground = dynamic(() => import('@/components/ocean-background').then(mod => mod.OceanBackground), {
  ssr: false,
});

export function ClientOceanBackground() {
  return <OceanBackground />;
}
