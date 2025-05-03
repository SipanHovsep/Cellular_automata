"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Grid, createGrid, nextGeneration, crystalSeedInitializer, simpleCrystalRule, CRYSTAL_STATES } from '@/lib/automata';
import GridDisplay from './GridDisplay';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface CrystalGrowthSimulatorProps {
  initialRows?: number;
  initialCols?: number;
  initialThreshold?: number;
}

const crystalCellColor = (state: number): string => {
  switch (state) {
    case CRYSTAL_STATES.EMPTY: return 'bg-gray-100'; // Empty space
    case CRYSTAL_STATES.CRYSTAL: return 'bg-blue-500'; // Crystal
    default: return 'bg-white';
  }
};

const CrystalGrowthSimulator: React.FC<CrystalGrowthSimulatorProps> = ({
  initialRows = 51, // Odd size for center seed
  initialCols = 71,
  initialThreshold = 3,
}) => {
  const [rows, setRows] = useState(initialRows);
  const [cols, setCols] = useState(initialCols);
  const [threshold, setThreshold] = useState(initialThreshold);
  const [grid, setGrid] = useState<Grid>(() => crystalSeedInitializer(rows, cols));
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(150); // Moderate speed for growth
  const [generation, setGeneration] = useState(0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const ruleFunc = useCallback((neighbors: number[], currentState: number) => {
    return simpleCrystalRule(neighbors, currentState, threshold);
  }, [threshold]);

  const runSimulation = useCallback(() => {
    setGrid((currentGrid) => {
        const newGrid = nextGeneration(currentGrid, ruleFunc);
        // Optional: Stop if grid doesn't change anymore (fully grown or stable)
        // This requires comparing newGrid with currentGrid, which can be expensive.
        // For simplicity, we'll let it run.
        return newGrid;
    });
    setGeneration((g) => g + 1);
  }, [ruleFunc]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(runSimulation, speed);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, speed, runSimulation]);

  const handleStartStop = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = useCallback(() => {
    setIsRunning(false);
    setGrid(crystalSeedInitializer(rows, cols));
    setGeneration(0);
  }, [rows, cols]);

  const handleSpeedChange = (value: number[]) => {
    const newSpeed = 1010 - value[0] * 10;
    setSpeed(newSpeed);
  };

  const handleThresholdChange = (value: number[]) => {
    setThreshold(value[0]);
    // Reset grid when threshold changes while not running
    if (!isRunning) handleReset();
  };

  // Reset grid if parameters change while not running
  useEffect(() => {
      if (!isRunning) {
          handleReset();
      }
  }, [threshold, handleReset, isRunning]);


  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Simple Crystal Growth</h3>
      <div className="flex flex-wrap items-center gap-4 p-4 border rounded-md bg-card text-card-foreground">
        <Button onClick={handleStartStop}>{isRunning ? 'Stop' : 'Start Growth'}</Button>
        <Button onClick={handleReset} variant="outline">Reset Seed</Button>

        <div className="flex items-center gap-2">
          <Label htmlFor="thresholdSlider" className="whitespace-nowrap">Neighbor Threshold ({threshold}):</Label>
          <Slider
            id="thresholdSlider"
            min={1}
            max={8}
            step={1}
            defaultValue={[threshold]}
            onValueChange={handleThresholdChange}
            className="w-[150px]"
            disabled={isRunning}
          />
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="crystalSpeedSlider" className="whitespace-nowrap">Speed:</Label>
          <Slider
            id="crystalSpeedSlider"
            min={1}
            max={100}
            step={1}
            defaultValue={[100 - (speed - 10) / 10]}
            onValueChange={handleSpeedChange}
            className="w-[150px]"
            disabled={isRunning}
          />
        </div>
        <div className="text-sm text-muted-foreground">Generation: {generation}</div>
      </div>

      <GridDisplay grid={grid} cellSize={10} cellColor={crystalCellColor} />
    </div>
  );
};

export default CrystalGrowthSimulator;
