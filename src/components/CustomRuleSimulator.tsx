"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Grid, createGrid, nextGeneration, RuleFunction } from '@/lib/automata';
import GridDisplay from './GridDisplay';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Toggle } from "@/components/ui/toggle";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CustomRuleSimulatorProps {
  initialRows?: number;
  initialCols?: number;
}

interface Rule {
  name: string;
  description: string;
  rule: RuleFunction;
}

const rules: Rule[] = [
  {
    name: "Conway's Game of Life",
    description: "A cell lives if it has 2-3 neighbors, dies otherwise. A dead cell becomes alive with exactly 3 neighbors.",
    rule: (neighbors, current) => {
      const aliveNeighbors = neighbors.filter(n => n === 1).length;
      if (current === 1) {
        return (aliveNeighbors === 2 || aliveNeighbors === 3) ? 1 : 0;
      } else {
        return aliveNeighbors === 3 ? 1 : 0;
      }
    }
  },
  {
    name: "High Life",
    description: "Similar to Conway's but cells also come alive with 6 neighbors.",
    rule: (neighbors, current) => {
      const aliveNeighbors = neighbors.filter(n => n === 1).length;
      if (current === 1) {
        return (aliveNeighbors === 2 || aliveNeighbors === 3) ? 1 : 0;
      } else {
        return (aliveNeighbors === 3 || aliveNeighbors === 6) ? 1 : 0;
      }
    }
  },
  {
    name: "Day & Night",
    description: "Cells survive with 3-6-7-8 neighbors, and are born with 3-6-7-8 neighbors.",
    rule: (neighbors, current) => {
      const aliveNeighbors = neighbors.filter(n => n === 1).length;
      const survival = [3, 4, 6, 7, 8].includes(aliveNeighbors);
      const birth = [3, 6, 7, 8].includes(aliveNeighbors);
      return current === 1 ? (survival ? 1 : 0) : (birth ? 1 : 0);
    }
  },
  {
    name: "Maze",
    description: "Cells survive with 1-2-3-4-5 neighbors, and are born with 3 neighbors.",
    rule: (neighbors, current) => {
      const aliveNeighbors = neighbors.filter(n => n === 1).length;
      if (current === 1) {
        return (aliveNeighbors >= 1 && aliveNeighbors <= 5) ? 1 : 0;
      } else {
        return aliveNeighbors === 3 ? 1 : 0;
      }
    }
  },
  {
    name: "Replicator",
    description: "Cells survive with 1-3-5-7 neighbors, and are born with 1-3-5-7 neighbors.",
    rule: (neighbors, current) => {
      const aliveNeighbors = neighbors.filter(n => n === 1).length;
      const survival = [1, 3, 5, 7].includes(aliveNeighbors);
      const birth = [1, 3, 5, 7].includes(aliveNeighbors);
      return current === 1 ? (survival ? 1 : 0) : (birth ? 1 : 0);
    }
  },
  {
    name: "Seeds",
    description: "Cells are only born with exactly 2 neighbors, and always die in the next generation.",
    rule: (neighbors, current) => {
      const aliveNeighbors = neighbors.filter(n => n === 1).length;
      return aliveNeighbors === 2 ? 1 : 0;
    }
  },
  {
    name: "Diamoeba",
    description: "Cells survive with 5-6-7-8 neighbors, and are born with 3-5-6-7-8 neighbors.",
    rule: (neighbors, current) => {
      const aliveNeighbors = neighbors.filter(n => n === 1).length;
      if (current === 1) {
        return (aliveNeighbors >= 5 && aliveNeighbors <= 8) ? 1 : 0;
      } else {
        return (aliveNeighbors >= 3 && aliveNeighbors <= 8) ? 1 : 0;
      }
    }
  },
  {
    name: "2x2",
    description: "Cells survive with 1-2-5 neighbors, and are born with 3-6 neighbors.",
    rule: (neighbors, current) => {
      const aliveNeighbors = neighbors.filter(n => n === 1).length;
      if (current === 1) {
        return ([1, 2, 5].includes(aliveNeighbors)) ? 1 : 0;
      } else {
        return ([3, 6].includes(aliveNeighbors)) ? 1 : 0;
      }
    }
  },
  {
    name: "Move",
    description: "Cells survive with 2-4-5 neighbors, and are born with 3-6-8 neighbors.",
    rule: (neighbors, current) => {
      const aliveNeighbors = neighbors.filter(n => n === 1).length;
      if (current === 1) {
        return ([2, 4, 5].includes(aliveNeighbors)) ? 1 : 0;
      } else {
        return ([3, 6, 8].includes(aliveNeighbors)) ? 1 : 0;
      }
    }
  },
  {
    name: "Serviettes",
    description: "Cells are only born with exactly 2 neighbors, and always die in the next generation.",
    rule: (neighbors, current) => {
      const aliveNeighbors = neighbors.filter(n => n === 1).length;
      return aliveNeighbors === 2 ? 1 : 0;
    }
  }
];

const CustomRuleSimulator: React.FC<CustomRuleSimulatorProps> = ({
  initialRows = 50,
  initialCols = 70,
}) => {
  const [rows, setRows] = useState(initialRows);
  const [cols, setCols] = useState(initialCols);
  const [grid, setGrid] = useState<Grid>(() => createGrid(rows, cols, () => 0));
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(100);
  const [generation, setGeneration] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawMode, setDrawMode] = useState<'add' | 'remove'>('add');
  const [brushSize, setBrushSize] = useState(1);
  const [selectedRule, setSelectedRule] = useState<Rule>(rules[0]);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const runSimulation = useCallback(() => {
    setGrid((currentGrid) => nextGeneration(currentGrid, selectedRule.rule));
    setGeneration((g) => g + 1);
  }, [selectedRule]);

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
    setGrid(createGrid(rows, cols, () => 0));
    setGeneration(0);
  }, [rows, cols]);

  const handleSpeedChange = (value: number[]) => {
    const newSpeed = 1010 - value[0] * 10;
    setSpeed(newSpeed);
  };

  const handleCellClick = (row: number, col: number) => {
    if (!isRunning) {
      setGrid(currentGrid => {
        const newGrid = currentGrid.map(r => [...r]);
        if (drawMode === 'add') {
          newGrid[row][col] = 1;
        } else {
          newGrid[row][col] = 0;
        }
        return newGrid;
      });
    }
  };

  const handleBrushSizeChange = (value: number[]) => {
    setBrushSize(value[0]);
  };

  return (
    <div className="flex gap-8">
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-4 p-4 border-2 border-purple-600 rounded-md bg-card text-card-foreground mb-4">
          <Button 
            onClick={handleStartStop} 
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

        <GridDisplay 
          grid={grid} 
          cellSize={10} 
          onCellClick={handleCellClick}
          isDrawing={isDrawing}
          brushSize={brushSize}
        />
      </div>

      <div className="w-64 space-y-4">
        <div className="p-4 border-2 border-purple-600 rounded-md bg-card text-card-foreground">
          <h3 className="text-lg font-bold text-purple-600 mb-4">Rules</h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ruleSelect" className="text-purple-600">Select Rule:</Label>
              <Select
                value={selectedRule.name}
                onValueChange={(value) => {
                  const rule = rules.find(r => r.name === value);
                  if (rule) setSelectedRule(rule);
                }}
              >
                <SelectTrigger id="ruleSelect" className="border-purple-600">
                  <SelectValue placeholder="Select a rule" />
                </SelectTrigger>
                <SelectContent>
                  {rules.map((rule) => (
                    <SelectItem key={rule.name} value={rule.name}>
                      {rule.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-2">{selectedRule.description}</p>
            </div>
          </div>
        </div>

        <div className="p-4 border-2 border-purple-600 rounded-md bg-card text-card-foreground">
          <h3 className="text-lg font-bold text-purple-600 mb-4">Drawing Controls</h3>
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Toggle
                pressed={drawMode === 'add'}
                onPressedChange={(pressed) => setDrawMode(pressed ? 'add' : 'remove')}
                className="bg-purple-600 data-[state=on]:bg-purple-700 text-white"
              >
                {drawMode === 'add' ? 'Add Cells' : 'Remove Cells'}
              </Toggle>
            </div>

            <div className="space-y-2">
              <Label htmlFor="brushSize" className="text-purple-600">Brush Size: {brushSize}</Label>
              <Slider
                id="brushSize"
                min={1}
                max={5}
                step={1}
                value={[brushSize]}
                onValueChange={handleBrushSizeChange}
                className="[&_[role=slider]]:bg-purple-600"
              />
            </div>

            <div className="text-sm text-muted-foreground">
              <p>Click and drag to draw on the grid</p>
              <p>Press Space to toggle drawing mode</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomRuleSimulator;
