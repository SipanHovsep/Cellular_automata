"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Grid, createGrid, nextGeneration, randomInitializer, conwayRule, seedsRule, highLifeRule, RuleFunction } from '@/lib/automata';
import GridDisplay from './GridDisplay';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface AutomataSimulatorProps {
  initialRows?: number;
  initialCols?: number;
  initialRule?: string;
}

const famousRules: { [key: string]: RuleFunction } = {
  'Conway': conwayRule,
  'Seeds': seedsRule,
  'HighLife': highLifeRule,
  // Add more 2D rules here if needed
};

const ruleDescriptions: { [key: string]: string } = {
  'Conway': "Conway's Game of Life is defined on a 2D grid of cells (each either 'alive' or 'dead'), which evolve in discrete steps according to these simple rules based solely on each cell's eight neighbors:\n\n" +
            "<div class='space-y-2'>" +
            "<div>• <span class='font-bold'>Underpopulation:</span> Any live cell with fewer than 2 live neighbors dies.</div>" +
            "<div>• <span class='font-bold'>Survival:</span> Any live cell with 2 or 3 live neighbors survives to the next generation.</div>" +
            "<div>• <span class='font-bold'>Overcrowding:</span> Any live cell with more than 3 live neighbors dies.</div>" +
            "<div>• <span class='font-bold'>Reproduction:</span> Any dead cell with exactly 3 live neighbors becomes alive.</div>" +
            "</div>\n\n" +
            "Despite their simplicity, these rules can produce incredibly rich and varied patterns over time.",
  'Seeds': "Seeds: A cell is born if it has exactly 2 neighbors, and dies in the next generation. Creates expanding, fractal-like patterns that never stabilize.",
  'HighLife': "HighLife: Similar to Conway's Game of Life, but cells are also born with 6 neighbors. Features a replicator pattern that can create copies of itself.",
};

const AutomataSimulator: React.FC<AutomataSimulatorProps> = ({
  initialRows = 50,
  initialCols = 70,
  initialRule = 'Conway',
}) => {
  const [rows, setRows] = useState(initialRows);
  const [cols, setCols] = useState(initialCols);
  const [grid, setGrid] = useState<Grid>(() => createGrid(rows, cols, randomInitializer(0.3)));
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(100); // Milliseconds between generations
  const [generation, setGeneration] = useState(0);
  const [selectedRule, setSelectedRule] = useState<string>(initialRule);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const ruleFunction = famousRules[selectedRule] || conwayRule;

  const runSimulation = useCallback(() => {
    setGrid((currentGrid: Grid) => nextGeneration(currentGrid, ruleFunction));
    setGeneration((g: number) => g + 1);
  }, [ruleFunction]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(runSimulation, speed);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, speed, runSimulation]);

  const handleStartStop = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = useCallback(() => {
    setIsRunning(false);
    setGrid(createGrid(rows, cols, randomInitializer(0.3)));
    setGeneration(0);
  }, [rows, cols]);

  const handleRuleChange = (value: string) => {
    setSelectedRule(value);
    // Optionally reset grid when rule changes, or let the current pattern evolve
    // handleReset();
  };

  const handleSpeedChange = (value: number[]) => {
    // Slider gives value 0-100, map to a reasonable speed range (e.g., 1000ms to 10ms)
    const newSpeed = 1010 - value[0] * 10;
    setSpeed(newSpeed);
  };

  // Ensure grid is reset if dimensions change (future feature)
  // useEffect(() => {
  //   handleReset();
  // }, [rows, cols, handleReset]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4 p-4 border rounded-md bg-card text-card-foreground">
        <Select value={selectedRule} onValueChange={handleRuleChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Rule" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(famousRules).map((ruleName) => (
              <SelectItem key={ruleName} value={ruleName}>
                {ruleName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button onClick={handleStartStop}>{isRunning ? 'Stop' : 'Start'}</Button>
        <Button onClick={handleReset} variant="outline">Reset</Button>

        <div className="flex items-center gap-2">
          <Label htmlFor="speedSlider" className="whitespace-nowrap">Speed:</Label>
          <Slider
            id="speedSlider"
            min={1}
            max={100}
            step={1}
            defaultValue={[100 - (speed - 10) / 10]} // Map speed back to slider value
            onValueChange={handleSpeedChange}
            className="w-[150px]"
            disabled={isRunning}
          />
        </div>
        <div className="text-sm text-muted-foreground">Generation: {generation}</div>
      </div>

      <div className="flex gap-8">
        <GridDisplay grid={grid} cellSize={10} />
        <div className="flex-1 p-4 border rounded-md bg-card">
          <h3 className="text-lg font-semibold mb-2 font-mono">{selectedRule} Rule</h3>
          <p className="text-muted-foreground font-mono leading-relaxed" dangerouslySetInnerHTML={{ __html: ruleDescriptions[selectedRule] }}></p>
        </div>
      </div>
    </div>
  );
};

export default AutomataSimulator;
