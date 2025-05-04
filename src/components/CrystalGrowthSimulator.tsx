"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Grid, createGrid } from '@/lib/automata';
import GridDisplay from './GridDisplay';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CrystalGrowthSimulatorProps {
  initialRows?: number;
  initialCols?: number;
}

// Cell states:
// 0: Empty (solution)
// 1: Crystal seed
// 2: Growing crystal (cubic)
// 3: Growing crystal (hexagonal)
// 4: Growing crystal (dendritic)
// 5: Impurity
// 6: Defect

const CrystalGrowthSimulator: React.FC<CrystalGrowthSimulatorProps> = ({
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
  const [drawMode, setDrawMode] = useState<'seed' | 'impurity' | 'cubic' | 'hexagonal' | 'dendritic'>('seed');
  const [brushSize, setBrushSize] = useState(1);
  const [temperature, setTemperature] = useState(25); // Celsius
  const [concentration, setConcentration] = useState(0.5); // Solution concentration
  const [flowRate, setFlowRate] = useState(0.1); // Solution flow rate
  const [impurityLevel, setImpurityLevel] = useState(0.1); // Impurity concentration

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleSpeedChange = (value: number[]) => {
    setSpeed(100 - (value[0] - 1) * 10);
  };

  const runSimulation = useCallback(() => {
    setGrid((currentGrid) => {
      const newGrid = currentGrid.map(row => [...row]);
      
      // Calculate growth parameters based on conditions
      const growthRate = Math.max(0.1, Math.min(1, (temperature - 10) / 30)); // Growth rate increases with temperature
      const anisotropy = Math.max(0.1, Math.min(1, concentration)); // Higher concentration = more anisotropic growth
      const defectProbability = impurityLevel * 0.1; // Higher impurities = more defects
      
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          // Handle seed cells (1) and growing crystals (2-4)
          if (currentGrid[i][j] >= 1 && currentGrid[i][j] <= 4) {
            // Check neighbors for growth
            for (let di = -1; di <= 1; di++) {
              for (let dj = -1; dj <= 1; dj++) {
                if (di === 0 && dj === 0) continue;
                
                const ni = i + di;
                const nj = j + dj;
                
                if (ni >= 0 && ni < rows && nj >= 0 && nj < cols) {
                  if (currentGrid[ni][nj] === 0) { // Empty solution
                    // Calculate growth probability based on direction and conditions
                    let growthChance = growthRate;
                    
                    // Apply anisotropy based on crystal type
                    if (currentGrid[i][j] === 1 || currentGrid[i][j] === 2) { // Seed or Cubic
                      growthChance *= 0.8; // Slower growth
                    } else if (currentGrid[i][j] === 3) { // Hexagonal
                      if (Math.abs(di) === Math.abs(dj)) growthChance *= 1.2; // Faster diagonal growth
                    } else if (currentGrid[i][j] === 4) { // Dendritic
                      if (di === 0 || dj === 0) growthChance *= 1.3; // Faster cardinal growth
                    }
                    
                    // Apply flow effects
                    if (flowRate > 0) {
                      const flowDirection = Math.atan2(di, dj);
                      growthChance *= (1 + flowRate * Math.cos(flowDirection));
                    }
                    
                    // Apply concentration effects
                    growthChance *= concentration;
                    
                    if (Math.random() < growthChance) {
                      // Check for defect formation
                      if (Math.random() < defectProbability) {
                        newGrid[ni][nj] = 6; // Defect
                      } else {
                        // If it's a seed cell, convert it to the appropriate crystal type
                        if (currentGrid[i][j] === 1) {
                          newGrid[ni][nj] = 2; // Start as cubic
                        } else {
                          newGrid[ni][nj] = currentGrid[i][j]; // Continue crystal growth
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      return newGrid;
    });
    setGeneration((g) => g + 1);
  }, [rows, cols, temperature, concentration, flowRate, impurityLevel]);

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

  const handleCellClick = (row: number, col: number) => {
    if (!isRunning) {
      setGrid(currentGrid => {
        const newGrid = currentGrid.map(r => [...r]);
        const halfSize = Math.floor(brushSize / 2);
        
        for (let i = -halfSize; i <= halfSize; i++) {
          for (let j = -halfSize; j <= halfSize; j++) {
            const newRow = row + i;
            const newCol = col + j;
            
            if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
              if (drawMode === 'seed') {
                newGrid[newRow][newCol] = 1;
              } else if (drawMode === 'impurity') {
                newGrid[newRow][newCol] = 5;
              } else if (drawMode === 'cubic') {
                newGrid[newRow][newCol] = 2;
              } else if (drawMode === 'hexagonal') {
                newGrid[newRow][newCol] = 3;
              } else if (drawMode === 'dendritic') {
                newGrid[newRow][newCol] = 4;
              }
            }
          }
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
      case 0: return 'bg-blue-100'; // Solution
      case 1: return 'bg-purple-600'; // Seed
      case 2: return 'bg-amber-500'; // Cubic crystal
      case 3: return 'bg-emerald-500'; // Hexagonal crystal
      case 4: return 'bg-rose-500'; // Dendritic crystal
      case 5: return 'bg-gray-400'; // Impurity
      case 6: return 'bg-gray-800'; // Defect
      default: return 'bg-blue-100';
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
            <Label htmlFor="speedSlider" className="whitespace-nowrap text-purple-600 font-bold text-lg">Speed:</Label>
            <Slider
              id="speedSlider"
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
            cellColor={getCellColor}
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
                onValueChange={(value: 'seed' | 'impurity' | 'cubic' | 'hexagonal' | 'dendritic') => setDrawMode(value)}
              >
                <SelectTrigger className="border-purple-600">
                  <SelectValue placeholder="Select drawing mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="seed">Seed</SelectItem>
                  <SelectItem value="impurity">Impurity</SelectItem>
                  <SelectItem value="cubic">Cubic Crystal</SelectItem>
                  <SelectItem value="hexagonal">Hexagonal Crystal</SelectItem>
                  <SelectItem value="dendritic">Dendritic Crystal</SelectItem>
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
          <h3 className="text-lg font-bold text-purple-600 mb-4">Growth Conditions</h3>
          
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label className="text-purple-600">Temperature (°C)</Label>
              <Slider
                value={[temperature]}
                onValueChange={(value) => setTemperature(value[0])}
                min={10}
                max={40}
                step={1}
                className="w-full"
              />
              <div className="text-sm text-purple-600 text-center">{temperature}°C</div>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-purple-600">Solution Concentration</Label>
              <Slider
                value={[concentration * 100]}
                onValueChange={(value) => setConcentration(value[0] / 100)}
                min={0}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="text-sm text-purple-600 text-center">{Math.round(concentration * 100)}%</div>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-purple-600">Flow Rate</Label>
              <Slider
                value={[flowRate * 100]}
                onValueChange={(value) => setFlowRate(value[0] / 100)}
                min={0}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="text-sm text-purple-600 text-center">{Math.round(flowRate * 100)}%</div>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-purple-600">Impurity Level</Label>
              <Slider
                value={[impurityLevel * 100]}
                onValueChange={(value) => setImpurityLevel(value[0] / 100)}
                min={0}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="text-sm text-purple-600 text-center">{Math.round(impurityLevel * 100)}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrystalGrowthSimulator;
