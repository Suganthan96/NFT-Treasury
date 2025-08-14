'use client';
import { cn } from '@/lib/utils';
import * as SliderPrimitive from '@radix-ui/react-slider';
import React from 'react';

interface StatSliderProps {
  value: number;
  onValueChange: (value: number) => void;
}

export function StatSlider({ value, onValueChange }: StatSliderProps) {
  return (
    <SliderPrimitive.Root
      value={[value]}
      onValueChange={(values) => onValueChange(values[0])}
      max={100}
      step={1}
      className="relative flex items-center select-none touch-none w-full h-8"
    >
      <SliderPrimitive.Track className="bg-black/50 border-2 border-accent/50 relative grow rounded-full h-4">
        <SliderPrimitive.Range 
            className="absolute bg-gradient-to-r from-pink-500 to-red-500 rounded-full h-full"
        />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb 
        className="block w-6 h-6 bg-background border-4 border-accent rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
      />
    </SliderPrimitive.Root>
  );
}
