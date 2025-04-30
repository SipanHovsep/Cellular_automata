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
    setGrid((currentGrid) => nextGeneration(currentGrid, ruleFunction));
    setGeneration((g) => g + 1);
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

      <GridDisplay grid={grid} cellSize={10} />
    </div>
  );
};

export default AutomataSimulator;
