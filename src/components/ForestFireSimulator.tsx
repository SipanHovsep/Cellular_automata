"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Grid, createGrid, nextGeneration, forestInitializer, forestFireRule, FIRE_STATES } from '@/lib/automata';
import GridDisplay from './GridDisplay';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ForestFireSimulatorProps {
  initialRows?: number;
  initialCols?: number;
  initialTreeDensity?: number;
  initialIgnitionProb?: number;
}

const forestCellColor = (state: number): string => {
  switch (state) {
    case FIRE_STATES.EMPTY: return 'bg-yellow-100'; // Soil/Empty
    case FIRE_STATES.TREE: return 'bg-green-600'; // Healthy Tree
    case FIRE_STATES.BURNING: return 'bg-red-600 animate-pulse'; // Burning Tree
    case FIRE_STATES.BURNT: return 'bg-gray-700'; // Burnt Tree
    default: return 'bg-white';
  }
};

const ForestFireSimulator: React.FC<ForestFireSimulatorProps> = ({
  initialRows = 50,
  initialCols = 70,
  initialTreeDensity = 0.8,
  initialIgnitionProb = 0.05, // Lower default, easier to see spread
}) => {
  const [rows, setRows] = useState(initialRows);
  const [cols, setCols] = useState(initialCols);
  const [treeDensity, setTreeDensity] = useState(initialTreeDensity);
  const [ignitionProb, setIgnitionProb] = useState(initialIgnitionProb);
  const [grid, setGrid] = useState<Grid>(() => forestInitializer(rows, cols, treeDensity));
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(200); // Slower speed for fire spread visualization
  const [generation, setGeneration] = useState(0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const ruleFunc = useCallback((neighbors: number[], currentState: number) => {
    return forestFireRule(neighbors, currentState, ignitionProb);
  }, [ignitionProb]);

  const runSimulation = useCallback(() => {
    setGrid((currentGrid) => {
        // Check if any fire exists
        const hasFire = currentGrid.flat().some(cell => cell === FIRE_STATES.BURNING);
        if (!hasFire && generation > 0) { // Stop if fire burns out (after first step)
            setIsRunning(false);
            return currentGrid;
        }
        return nextGeneration(currentGrid, ruleFunc);
    });
    setGeneration((g) => g + 1);
  }, [ruleFunc, generation]);

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
    // If starting and no fire exists, ignite the center
    if (!isRunning) {
        const hasFire = grid.flat().some(cell => cell === FIRE_STATES.BURNING);
        if (!hasFire) {
            setGrid(currentGrid => {
                const newGrid = currentGrid.map(row => [...row]);
                const centerRow = Math.floor(rows / 2);
                const centerCol = Math.floor(cols / 2);
                if (newGrid[centerRow]?.[centerCol] === FIRE_STATES.TREE) {
                    newGrid[centerRow][centerCol] = FIRE_STATES.BURNING;
                }
                // If center is not a tree, find the nearest tree to ignite (optional, simple ignition for now)
                return newGrid;
            });
        }
    }
    setIsRunning(!isRunning);
  };

  const handleReset = useCallback(() => {
    setIsRunning(false);
    setGrid(forestInitializer(rows, cols, treeDensity));
    setGeneration(0);
  }, [rows, cols, treeDensity]);

  const handleSpeedChange = (value: number[]) => {
    const newSpeed = 1010 - value[0] * 10;
    setSpeed(newSpeed);
  };

  const handleDensityChange = (value: number[]) => {
    setTreeDensity(value[0] / 100);
    // Reset grid when density changes while not running
    if (!isRunning) handleReset();
  };

  const handleIgnitionChange = (value: number[]) => {
    setIgnitionProb(value[0] / 100);
  };

  // Reset grid if parameters change while not running
  useEffect(() => {
      if (!isRunning) {
          handleReset();
      }
  }, [treeDensity, handleReset, isRunning]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Forest Fire Simulation</h3>
      <div className="flex flex-wrap items-center gap-4 p-4 border rounded-md bg-card text-card-foreground">
        <Button onClick={handleStartStop}>{isRunning ? 'Stop' : 'Start Fire'}</Button>
        <Button onClick={handleReset} variant="outline">Reset Forest</Button>

        <div className="flex items-center gap-2">
          <Label htmlFor="densitySlider" className="whitespace-nowrap">Tree Density ({Math.round(treeDensity * 100)}%):</Label>
          <Slider
            id="densitySlider"
            min={0}
            max={100}
            step={1}
            defaultValue={[treeDensity * 100]}
            onValueChange={handleDensityChange}
            className="w-[150px]"
            disabled={isRunning}
          />
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="ignitionSlider" className="whitespace-nowrap">Ignition Prob ({Math.round(ignitionProb * 100)}%):</Label>
          <Slider
            id="ignitionSlider"
            min={0}
            max={100}
            step={1}
            defaultValue={[ignitionProb * 100]}
            onValueChange={handleIgnitionChange}
            className="w-[150px]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="fireSpeedSlider" className="whitespace-nowrap">Speed:</Label>
          <Slider
            id="fireSpeedSlider"
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

      <GridDisplay grid={grid} cellSize={10} cellColor={forestCellColor} />
    </div>
  );
};

export default ForestFireSimulator;
