"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Grid, createGrid, nextGeneration } from '@/lib/automata';
import GridDisplay from './GridDisplay';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Toggle } from "@/components/ui/toggle";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ForestFireSimulatorProps {
  initialRows?: number;
  initialCols?: number;
}

// Cell states:
// 0: Empty
// 1: Tree
// 2: Burning Tree
// 3: Rock (barrier)
// 4: Water (barrier)
// 5: Young Tree (slower to burn)
// 6: Old Tree (faster to burn)

const ForestFireSimulator: React.FC<ForestFireSimulatorProps> = ({
  initialRows = 80,
  initialCols = 120,
}) => {
  const [rows, setRows] = useState(initialRows);
  const [cols, setCols] = useState(initialCols);
  const [grid, setGrid] = useState<Grid>(() => createGrid(rows, cols, () => 0));
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(100);
  const [generation, setGeneration] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawMode, setDrawMode] = useState<'tree' | 'rock' | 'water' | 'young' | 'old'>('tree');
  const [brushSize, setBrushSize] = useState(1);
  const [windDirection, setWindDirection] = useState<'north' | 'south' | 'east' | 'west' | 'none'>('none');
  const [windIntensity, setWindIntensity] = useState(0);
  const [fireSpreadProbability, setFireSpreadProbability] = useState(0.5);
  const [rainProbability, setRainProbability] = useState(0.1);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const runSimulation = useCallback(() => {
    setGrid((currentGrid) => {
      const newGrid = currentGrid.map(row => [...row]);
      
      // Apply wind effects
      const windSpreadBonus = windIntensity * 0.1;
      
      // Apply rain effects
      const rainExtinguishes = Math.random() < rainProbability;

      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          if (currentGrid[i][j] === 2) { // Burning tree
            if (rainExtinguishes) {
              newGrid[i][j] = 0; // Extinguish fire
              continue;
            }

            // Check neighbors with wind influence
            for (let di = -1; di <= 1; di++) {
              for (let dj = -1; dj <= 1; dj++) {
                if (di === 0 && dj === 0) continue;
                
                const ni = i + di;
                const nj = j + dj;
                
                if (ni >= 0 && ni < rows && nj >= 0 && nj < cols) {
                  // Apply wind direction bonus
                  let spreadChance = fireSpreadProbability;
                  if (windDirection !== 'none') {
                    if (
                      (windDirection === 'north' && di === -1) ||
                      (windDirection === 'south' && di === 1) ||
                      (windDirection === 'east' && dj === 1) ||
                      (windDirection === 'west' && dj === -1)
                    ) {
                      spreadChance += windSpreadBonus;
                    } else {
                      spreadChance -= windSpreadBonus;
                    }
                  }

                  if (Math.random() < spreadChance) {
                    const neighbor = currentGrid[ni][nj];
                    if (neighbor === 1) { // Regular tree
                      newGrid[ni][nj] = 2;
                    } else if (neighbor === 5) { // Young tree
                      if (Math.random() < spreadChance * 0.7) { // 30% less likely to burn
                        newGrid[ni][nj] = 2;
                      }
                    } else if (neighbor === 6) { // Old tree
                      if (Math.random() < spreadChance * 1.3) { // 30% more likely to burn
                        newGrid[ni][nj] = 2;
                      }
                    }
                  }
                }
              }
            }
            newGrid[i][j] = 0; // Tree burns out
          }
        }
      }
      return newGrid;
    });
    setGeneration((g) => g + 1);
  }, [rows, cols, windDirection, windIntensity, fireSpreadProbability, rainProbability]);

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
        if (drawMode === 'tree') {
          newGrid[row][col] = 1;
        } else if (drawMode === 'rock') {
          newGrid[row][col] = 3;
        } else if (drawMode === 'water') {
          newGrid[row][col] = 4;
        } else if (drawMode === 'young') {
          newGrid[row][col] = 5;
        } else if (drawMode === 'old') {
          newGrid[row][col] = 6;
        }
        return newGrid;
      });
    }
  };

  const handleBrushSizeChange = (value: number[]) => {
    setBrushSize(value[0]);
  };

  const getCellColor = (cell: number) => {
    switch (cell) {
      case 0: return 'bg-gray-100'; // Empty
      case 1: return 'bg-green-600'; // Regular Tree
      case 2: return 'bg-red-600 animate-pulse'; // Burning Tree
      case 3: return 'bg-gray-500'; // Rock
      case 4: return 'bg-blue-400'; // Water
      case 5: return 'bg-green-400'; // Young Tree (brighter green)
      case 6: return 'bg-amber-800'; // Old Tree (brown)
      default: return 'bg-gray-100';
    }
  };

  return (
    <div className="flex gap-8 h-full">
      <div className="flex-1 flex flex-col">
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

        <div className="flex-1 border-2 border-purple-600 rounded-md bg-card text-card-foreground p-4 flex items-center justify-center">
          <GridDisplay 
            grid={grid} 
            cellSize={9}
            onCellClick={handleCellClick}
            isDrawing={isDrawing}
            brushSize={brushSize}
            getCellColor={getCellColor}
          />
        </div>
      </div>

      <div className="w-64 space-y-4">
        <div className="p-4 border-2 border-purple-600 rounded-md bg-card text-card-foreground">
          <h3 className="text-lg font-bold text-purple-600 mb-4">Drawing Controls</h3>
          
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label className="text-purple-600">Draw Mode:</Label>
              <Select
                value={drawMode}
                onValueChange={(value: 'tree' | 'rock' | 'water' | 'young' | 'old') => setDrawMode(value)}
              >
                <SelectTrigger className="border-purple-600">
                  <SelectValue placeholder="Select drawing mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tree">Tree</SelectItem>
                  <SelectItem value="rock">Rock</SelectItem>
                  <SelectItem value="water">Water</SelectItem>
                  <SelectItem value="young">Young Tree</SelectItem>
                  <SelectItem value="old">Old Tree</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-purple-600">Brush Size</Label>
              <Slider
                value={[brushSize]}
                onValueChange={handleBrushSizeChange}
                min={1}
                max={5}
                step={1}
                className="w-full"
              />
              <div className="text-sm text-purple-600 text-center">{brushSize}</div>
            </div>
          </div>
        </div>

        <div className="p-4 border-2 border-purple-600 rounded-md bg-card text-card-foreground">
          <h3 className="text-lg font-bold text-purple-600 mb-4">Environment Controls</h3>
          
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label className="text-purple-600">Wind Direction</Label>
              <Select
                value={windDirection}
                onValueChange={(value: 'north' | 'south' | 'east' | 'west' | 'none') => setWindDirection(value)}
              >
                <SelectTrigger className="border-purple-600">
                  <SelectValue placeholder="Select wind direction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Wind</SelectItem>
                  <SelectItem value="north">North</SelectItem>
                  <SelectItem value="south">South</SelectItem>
                  <SelectItem value="east">East</SelectItem>
                  <SelectItem value="west">West</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-purple-600">Wind Intensity</Label>
              <Slider
                value={[windIntensity]}
                onValueChange={(value) => setWindIntensity(value[0])}
                min={0}
                max={10}
                step={1}
                className="w-full"
              />
              <div className="text-sm text-purple-600 text-center">{windIntensity}</div>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-purple-600">Fire Spread Probability</Label>
              <Slider
                value={[fireSpreadProbability * 100]}
                onValueChange={(value) => setFireSpreadProbability(value[0] / 100)}
                min={0}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="text-sm text-purple-600 text-center">{Math.round(fireSpreadProbability * 100)}%</div>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-purple-600">Rain Probability</Label>
              <Slider
                value={[rainProbability * 100]}
                onValueChange={(value) => setRainProbability(value[0] / 100)}
                min={0}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="text-sm text-purple-600 text-center">{Math.round(rainProbability * 100)}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForestFireSimulator;
