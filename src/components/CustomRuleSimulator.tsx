"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Grid, createGrid, nextGeneration, randomInitializer, parseBSRule, RuleFunction } from '@/lib/automata';
import GridDisplay from './GridDisplay';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from 'lucide-react';

interface CustomRuleSimulatorProps {
  initialRows?: number;
  initialCols?: number;
  initialRuleString?: string;
}

const CustomRuleSimulator: React.FC<CustomRuleSimulatorProps> = ({
  initialRows = 50,
  initialCols = 70,
  initialRuleString = 'B3/S23', // Default to Conway's Game of Life
}) => {
  const [rows, setRows] = useState(initialRows);
  const [cols, setCols] = useState(initialCols);
  const [grid, setGrid] = useState<Grid>(() => createGrid(rows, cols, randomInitializer(0.3)));
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(100); // Milliseconds between generations
  const [generation, setGeneration] = useState(0);
  const [ruleString, setRuleString] = useState<string>(initialRuleString);
  const [ruleFunction, setRuleFunction] = useState<RuleFunction | null>(() => {
      try {
          return parseBSRule(initialRuleString);
      } catch {
          return null;
      }
  });
  const [ruleError, setRuleError] = useState<string | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Attempt to parse the rule string whenever it changes
  useEffect(() => {
    try {
      const parsedRule = parseBSRule(ruleString);
      setRuleFunction(() => parsedRule); // Use functional update for state derived from props/other state
      setRuleError(null);
    } catch (error: any) {
      setRuleFunction(null);
      setRuleError(error.message || "Invalid rule format.");
      setIsRunning(false); // Stop simulation if rule becomes invalid
    }
  }, [ruleString]);

  const runSimulation = useCallback(() => {
    if (!ruleFunction) return; // Don't run if the rule is invalid
    setGrid((currentGrid) => nextGeneration(currentGrid, ruleFunction));
    setGeneration((g) => g + 1);
  }, [ruleFunction]);

  useEffect(() => {
    if (isRunning && ruleFunction) {
      intervalRef.current = setInterval(runSimulation, speed);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Cleanup interval on component unmount or when isRunning/speed/runSimulation changes
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, speed, runSimulation, ruleFunction]);

  const handleStartStop = () => {
    if (ruleFunction) { // Only allow starting if the rule is valid
        setIsRunning(!isRunning);
    }
  };

  const handleReset = useCallback(() => {
    setIsRunning(false);
    setGrid(createGrid(rows, cols, randomInitializer(0.3)));
    setGeneration(0);
  }, [rows, cols]);

  const handleRuleStringChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRuleString(event.target.value);
  };

  const handleSpeedChange = (value: number[]) => {
    const newSpeed = 1010 - value[0] * 10;
    setSpeed(newSpeed);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4 p-4 border-2 border-purple-600 rounded-md bg-card text-card-foreground">
        <Button 
          onClick={handleStartStop} 
          disabled={!ruleFunction || !!ruleError} 
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-2 text-lg shadow-lg hover:shadow-xl transition-all"
        >
          {isRunning ? 'Stop' : 'Start'}
        </Button>
        
        <Button 
          onClick={handleReset} 
          variant="outline" 
          className="border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white font-bold px-6 py-2 text-lg shadow-lg hover:shadow-xl transition-all"
        >
          Reset
        </Button>

        <div className="flex items-center gap-2">
          <Label htmlFor="customSpeedSlider" className="whitespace-nowrap text-purple-600 font-bold text-lg">Speed:</Label>
          <Slider
            id="customSpeedSlider"
            min={1}
            max={100}
            step={1}
            defaultValue={[100 - (speed - 10) / 10]}
            onValueChange={handleSpeedChange}
            className="w-[150px] [&_[role=slider]]:bg-purple-600 [&_[role=slider]]:shadow-lg [&_[role=slider]]:hover:shadow-xl"
            disabled={isRunning}
          />
        </div>
        <div className="text-lg font-bold text-purple-600">Generation: {generation}</div>
      </div>

      {ruleError && (
        <Alert variant="destructive" className="border-2 border-red-500">
          <Terminal className="h-4 w-4" />
          <AlertTitle className="font-bold">Invalid Rule</AlertTitle>
          <AlertDescription>
            {ruleError}
          </AlertDescription>
        </Alert>
      )}

      <GridDisplay grid={grid} cellSize={10} />
    </div>
  );
};

export default CustomRuleSimulator;
