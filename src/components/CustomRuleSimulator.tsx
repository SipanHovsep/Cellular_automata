"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Grid, createGrid, nextGeneration, RuleFunction } from '@/lib/automata';
import GridDisplay from './GridDisplay';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Toggle } from "@/components/ui/toggle";

interface CustomRuleSimulatorProps {
  initialRows?: number;
  initialCols?: number;
}

const CustomRuleSimulator: React.FC<CustomRuleSimulatorProps> = ({
  initialRows = 50,
  initialCols = 70,
}) => {
  const [rows, setRows] = useState(initialRows);
  const [cols, setCols] = useState(initialCols);
  const [grid, setGrid] = useState<Grid>(() => createGrid(rows, cols, () => 0)); // Start with empty grid
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(100);
  const [generation, setGeneration] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawMode, setDrawMode] = useState<'add' | 'remove'>('add');
  const [brushSize, setBrushSize] = useState(1);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const runSimulation = useCallback(() => {
    setGrid((currentGrid) => nextGeneration(currentGrid, (neighbors, current) => {
      const aliveNeighbors = neighbors.filter(n => n === 1).length;
      if (current === 1) {
        return (aliveNeighbors === 2 || aliveNeighbors === 3) ? 1 : 0;
      } else {
        return aliveNeighbors === 3 ? 1 : 0;
      }
    }));
    setGeneration((g) => g + 1);
  }, []);

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
          <h3 className="text-lg font-bold text-purple-600 mb-4">Drawing Controls</h3>
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Toggle
                pressed={drawMode === 'add'}
                onPressedChange={(pressed) => setDrawMode(pressed ? 'add' : 'remove')}
                className="bg-purple-600 data-[state=on]:bg-purple-700"
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
