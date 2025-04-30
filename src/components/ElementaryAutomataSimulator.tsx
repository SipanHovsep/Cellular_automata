"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { OneDGrid, createOneDGrid, nextOneDGeneration, getElementaryRule, singleCellInitializer, ElementaryRuleFunction } from '@/lib/automata';
import GridDisplay from './GridDisplay'; // Assuming GridDisplay can handle 1D history (multiple rows)
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ElementaryAutomataSimulatorProps {
  initialWidth?: number;
  initialGenerations?: number;
  initialRuleNumber?: number;
}

const famousElementaryRules: { [key: string]: number } = {
  'Rule 30': 30,
  'Rule 90': 90,
  'Rule 110': 110,
  'Rule 184 (Traffic)': 184,
};

const ElementaryAutomataSimulator: React.FC<ElementaryAutomataSimulatorProps> = ({
  initialWidth = 101, // Odd number often looks better for single cell start
  initialGenerations = 50,
  initialRuleNumber = 30,
}) => {
  const [width, setWidth] = useState(initialWidth);
  const [numGenerations, setNumGenerations] = useState(initialGenerations);
  const [ruleNumber, setRuleNumber] = useState<number>(initialRuleNumber);
  const [history, setHistory] = useState<OneDGrid[]>([]);
  const [ruleFunction, setRuleFunction] = useState<ElementaryRuleFunction>(() => getElementaryRule(initialRuleNumber));
  const [customRuleInput, setCustomRuleInput] = useState<string>(initialRuleNumber.toString());
  const [error, setError] = useState<string | null>(null);

  const generateHistory = useCallback(() => {
    try {
      const ruleFunc = getElementaryRule(ruleNumber);
      setRuleFunction(() => ruleFunc); // Store the valid rule function
      const initialGrid = createOneDGrid(width, singleCellInitializer(width));
      const generatedHistory: OneDGrid[] = [initialGrid];

      let currentGrid = initialGrid;
      for (let i = 1; i < numGenerations; i++) {
        currentGrid = nextOneDGeneration(currentGrid, ruleFunc);
        generatedHistory.push(currentGrid);
      }
      setHistory(generatedHistory);
      setError(null); // Clear previous errors
    } catch (e: any) {
      setError(e.message || "Invalid rule number.");
      setHistory([]); // Clear history on error
    }
  }, [width, numGenerations, ruleNumber]);

  useEffect(() => {
    generateHistory();
  }, [generateHistory]); // Regenerate when parameters change

  const handleRuleChange = (value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= 0 && num <= 255) {
      setRuleNumber(num);
      setCustomRuleInput(value);
      setError(null);
    } else {
      // Handle selection of named rules if needed, or keep custom input
      if (famousElementaryRules[value] !== undefined) {
          const famousRuleNum = famousElementaryRules[value];
          setRuleNumber(famousRuleNum);
          setCustomRuleInput(famousRuleNum.toString());
          setError(null);
      } else {
          setCustomRuleInput(value); // Keep invalid input shown for correction
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
      } else if (value === "") {
          setError("Please enter a rule number.");
      } else {
          setError("Rule must be 0-255.");
      }
  };

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newWidth = parseInt(e.target.value, 10);
    if (!isNaN(newWidth) && newWidth > 0 && newWidth < 500) { // Add upper limit
      setWidth(newWidth);
    }
  };

  const handleGenerationsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newGenerations = parseInt(e.target.value, 10);
    if (!isNaN(newGenerations) && newGenerations > 0 && newGenerations < 500) { // Add upper limit
      setNumGenerations(newGenerations);
    }
  };

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
          <Label htmlFor="widthInput">Width:</Label>
          <Input
            id="widthInput"
            type="number"
            min="10"
            max="499"
            value={width}
            onChange={handleWidthChange}
            className="w-[80px]"
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
         <Button onClick={generateHistory} variant="outline">Generate</Button>
         {error && <p className="text-red-500 text-sm ml-4">{error}</p>}
      </div>

      {/* Render history using GridDisplay, treating history as a 2D grid */} 
      {history.length > 0 ? (
          <GridDisplay grid={history} cellSize={8} />
      ) : (
          <div className="border border-gray-300 p-4 text-center text-gray-500">{error ? 'Error generating history.' : 'No history generated.'}</div>
      )}
    </div>
  );
};

export default ElementaryAutomataSimulator;
