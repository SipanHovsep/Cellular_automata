"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { OneDGrid, createOneDGrid, nextOneDGeneration, getElementaryRule, singleCellInitializer, ElementaryRuleFunction } from '@/lib/automata';
import GridDisplay from './GridDisplay'; // Assuming GridDisplay can handle 1D history (multiple rows)
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ElementaryAutomataSimulatorProps {
  initialGenerations?: number;
  initialRuleNumber?: number;
}

const famousElementaryRules: { [key: string]: number } = {
  'Rule 30': 30,
  'Rule 90': 90,
  'Rule 110': 110,
  'Rule 184 (Traffic)': 184,
};

const ruleDescriptions: { [key: string]: string } = {
  'Rule 30': "<div class='space-y-2'>" +
             "<div class='font-bold text-[#57068c]'>Class:</div> III (Chaotic)" +
             "<div class='font-bold text-[#57068c]'>Features:</div>" +
             "<div>• Produces chaotic, random-looking patterns from simple starting points.</div>" +
             "<div>• Each cell's next state depends on itself and its two neighbors, following a specific rule (encoded as number 30).</div>" +
             "<div>• Famous for generating complexity and unpredictability from simple rules.</div>" +
             "<div>• Used in random number generation and as an example of how simple systems can create complex results.</div>" +
             "<div>• Class III means its patterns are unpredictable and do not settle down or repeat.</div>" +
             "</div>",
  'Rule 90': "<div class='space-y-2'>" +
             "<div class='font-bold text-[#57068c]'>Class:</div> II (Periodic/Fractal)" +
             "<div class='font-bold text-[#57068c]'>Features:</div>" +
             "<div>• Creates a repeating, triangular pattern known as the Sierpiński triangle.</div>" +
             "<div>• Each cell's next state is determined by comparing its left and right neighbors (using the XOR operation).</div>" +
             "<div>• The pattern is highly regular and self-similar, showing clear, repeating shapes.</div>" +
             "<div>• Often used to demonstrate how fractals and mathematical patterns can emerge from simple rules.</div>" +
             "<div>• Class II means its patterns are regular, repetitive, or form simple structures.</div>" +
             "</div>",
  'Rule 110': "<div class='space-y-2'>" +
              "<div class='font-bold text-[#57068c]'>Class:</div> IV (Complex)" +
              "<div class='font-bold text-[#57068c]'>Features:</div>" +
              "<div>• Known for its complex and varied patterns, including moving structures that interact in interesting ways.</div>" +
              "<div>• This rule is important because it is 'Turing complete,' meaning it can, in theory, perform any computation.</div>" +
              "<div>• The patterns are neither totally random nor completely regular, but a mix of both.</div>" +
              "<div>• Studied for its ability to model complex systems and computation with very simple rules.</div>" +
              "<div>• Class IV means it produces complex structures that can interact and evolve in unpredictable ways.</div>" +
              "</div>",
  'Rule 184 (Traffic)': "<div class='space-y-2'>" +
                        "<div class='font-bold text-[#57068c]'>Class:</div> II (Periodic/Stable)" +
                        "<div class='font-bold text-[#57068c]'>Features:</div>" +
                        "<div>• Models simple traffic flow: 'cars' (cells with value 1) move to the right if the space is empty.</div>" +
                        "<div>• Over time, the system organizes itself into groups or jams, similar to real traffic.</div>" +
                        "<div>• Helps researchers study how simple rules can explain real-world processes like traffic movement.</div>" +
                        "<div>• Useful for understanding how local decisions create larger patterns (like traffic jams).</div>" +
                        "<div>• Class II means its patterns tend to settle into repeating or stable arrangements.</div>" +
                        "</div>",
};

const ElementaryAutomataSimulator: React.FC<ElementaryAutomataSimulatorProps> = ({
  initialGenerations = 50,
  initialRuleNumber = 30,
}) => {
  const [numGenerations, setNumGenerations] = useState(initialGenerations);
  const [ruleNumber, setRuleNumber] = useState<number>(initialRuleNumber);
  const [history, setHistory] = useState<OneDGrid[]>([]);
  const [ruleFunction, setRuleFunction] = useState<ElementaryRuleFunction>(() => getElementaryRule(initialRuleNumber));
  const [customRuleInput, setCustomRuleInput] = useState<string>(initialRuleNumber.toString());
  const [error, setError] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(100);
  const [currentGeneration, setCurrentGeneration] = useState(0);

  // Create initial empty grid
  useEffect(() => {
    const emptyGrid = createOneDGrid(numGenerations, () => false);
    setHistory([emptyGrid]);
  }, [numGenerations]);

  // Animation effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAnimating && currentGeneration < numGenerations) {
      timer = setTimeout(() => {
        const currentGrid = history[history.length - 1];
        // Create a new grid with width matching the current generation
        const nextGrid = createOneDGrid(currentGeneration + 1, (i) => {
          if (i === 0 || i === currentGeneration) {
            return false; // Edge cells
          }
          // Get the previous row's cells that affect this cell
          const left = currentGrid[i - 1] || false;
          const center = currentGrid[i] || false;
          const right = currentGrid[i + 1] || false;
          // Apply the rule
          return ruleFunction(left, center, right);
        });
        setHistory(prev => [...prev, nextGrid]);
        setCurrentGeneration(prev => prev + 1);
      }, animationSpeed);
    } else if (currentGeneration >= numGenerations) {
      setIsAnimating(false);
    }
    return () => clearTimeout(timer);
  }, [isAnimating, currentGeneration, numGenerations, history, ruleFunction]);

  const handleReset = useCallback(() => {
    setIsAnimating(false);
    setCurrentGeneration(0);
    const emptyGrid = createOneDGrid(1, () => false);
    setHistory([emptyGrid]);
    setError(null);
  }, []);

  const handleAnimationSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const speed = parseInt(e.target.value, 10);
    if (!isNaN(speed) && speed > 0) {
      setAnimationSpeed(speed);
    }
  };

  const handleRuleChange = (value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= 0 && num <= 255) {
      setRuleNumber(num);
      setCustomRuleInput(value);
      setError(null);
      generateHistory();
    } else {
      if (famousElementaryRules[value] !== undefined) {
        const famousRuleNum = famousElementaryRules[value];
        setRuleNumber(famousRuleNum);
        setCustomRuleInput(famousRuleNum.toString());
        setError(null);
        generateHistory();
      } else {
        setCustomRuleInput(value);
        setError("Rule must be 0-255.");
      }
    }
  };

  const handleCustomRuleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomRuleInput(value);
    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= 0 && num <= 255) {
      setRuleNumber(num);
      setError(null);
      generateHistory();
    } else if (value === "") {
      setError("Please enter a rule number.");
    } else {
      setError("Rule must be 0-255.");
    }
  };

  const handleGenerationsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newGenerations = parseInt(e.target.value, 10);
    if (!isNaN(newGenerations) && newGenerations > 0 && newGenerations < 500) {
      setNumGenerations(newGenerations);
    }
  };

  const generateHistory = useCallback(() => {
    try {
      const ruleFunc = getElementaryRule(ruleNumber);
      setRuleFunction(() => ruleFunc);
      // Start with a single cell
      const initialGrid = createOneDGrid(1, (i) => i === 0);
      setHistory([initialGrid]);
      setCurrentGeneration(0);
      setIsAnimating(true);
      setError(null);
    } catch (e: any) {
      setError(e.message || "Invalid rule number.");
      setHistory([]);
    }
  }, [ruleNumber]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4 p-4 border rounded-md bg-card text-card-foreground">
        <div className="flex items-center gap-2">
          <Label htmlFor="ruleSelect">Rule:</Label>
          <Select value={customRuleInput} onValueChange={handleRuleChange}>
            <SelectTrigger id="ruleSelect" className="w-[120px]">
              <SelectValue placeholder="Select Rule" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(famousElementaryRules).map(([name, num]) => (
                <SelectItem key={name} value={num.toString()}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="number"
            min="0"
            max="255"
            value={customRuleInput}
            onChange={handleCustomRuleInputChange}
            className="w-[80px]"
            placeholder="0-255"
          />
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="gensInput">Generations:</Label>
          <Input
            id="gensInput"
            type="number"
            min="10"
            max="499"
            value={numGenerations}
            onChange={handleGenerationsChange}
            className="w-[80px]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="speedInput">Animation Speed (ms):</Label>
          <Input
            id="speedInput"
            type="number"
            min="10"
            max="1000"
            value={animationSpeed}
            onChange={handleAnimationSpeedChange}
            className="w-[80px]"
          />
        </div>
        <Button onClick={generateHistory} variant="outline">Generate</Button>
        <Button onClick={handleReset} variant="outline">Reset</Button>
        {error && <p className="text-red-500 text-sm ml-4">{error}</p>}
      </div>

      <div className="flex gap-8">
        <div className="flex-1">
          <GridDisplay 
            grid={history} 
            cellSize={Math.max(1, Math.min(8, 500 / numGenerations))}
          />
        </div>
        <div className="flex-1 p-4 border rounded-md bg-card">
          <h3 className="text-lg font-semibold mb-2 font-mono">{Object.keys(famousElementaryRules).find(key => famousElementaryRules[key] === ruleNumber) || `Rule ${ruleNumber}`}</h3>
          <div className="text-muted-foreground font-mono leading-relaxed" dangerouslySetInnerHTML={{ __html: ruleDescriptions[Object.keys(famousElementaryRules).find(key => famousElementaryRules[key] === ruleNumber) || ''] || '' }}></div>
        </div>
      </div>
    </div>
  );
};

export default ElementaryAutomataSimulator;
