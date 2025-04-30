"use client";
import React, { useEffect, useRef, useState } from 'react';

const GRID_ROWS = 20;
const GRID_COLS = 60;
const LETTER_COLOR = '#57068c';
const BG_COLOR = '#f8f8ff';
const ANIMATION_SPEED = 60; // ms per step (slow)

// A simple bitmap for 'NYUAD' (1 = letter, 0 = background)
// This is a placeholder. For a real effect, you might want to generate this from a font or SVG.
const NYUAD_BITMAP: number[][] = [
  // N
  [1,0,0,0,1, 0, 1,1,1,0, 0, 1,0,0,1, 0, 1,1,1,0, 0, 1,0,0,1],
  [1,1,0,0,1, 0, 0,1,0,0, 0, 1,1,0,1, 0, 1,0,0,0, 0, 1,1,0,1],
  [1,0,1,0,1, 0, 0,1,0,0, 0, 1,0,1,1, 0, 1,0,0,0, 0, 1,0,1,1],
  [1,0,0,1,1, 0, 0,1,0,0, 0, 1,0,0,1, 0, 1,1,1,0, 0, 1,0,0,1],
  [1,0,0,0,1, 0, 1,1,1,0, 0, 1,0,0,1, 0, 1,0,0,0, 0, 1,0,0,1],
];

// Pad the bitmap to fit the grid
function getBitmapGrid() {
  const grid = Array.from({ length: GRID_ROWS }, () => Array(GRID_COLS).fill(0));
  const startRow = Math.floor((GRID_ROWS - NYUAD_BITMAP.length) / 2);
  const startCol = Math.floor((GRID_COLS - NYUAD_BITMAP[0].length) / 2);
  for (let r = 0; r < NYUAD_BITMAP.length; r++) {
    for (let c = 0; c < NYUAD_BITMAP[0].length; c++) {
      grid[startRow + r][startCol + c] = NYUAD_BITMAP[r][c];
    }
  }
  return grid;
}

export default function NyuadAutomataGrid() {
  const [grid, setGrid] = useState(
    Array.from({ length: GRID_ROWS }, () => Array(GRID_COLS).fill(0))
  );
  const [step, setStep] = useState(0);
  const target = useRef(getBitmapGrid());

  useEffect(() => {
    if (step >= GRID_ROWS * GRID_COLS) return;
    const timer = setTimeout(() => {
      // Reveal one more cell per step (random order for effect)
      const flat: [number, number][] = [];
      for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
          if (target.current[r][c] === 1 && grid[r][c] === 0) {
            flat.push([r, c]);
          }
        }
      }
      if (flat.length === 0) return;
      const [r, c] = flat[Math.floor(Math.random() * flat.length)];
      setGrid(g => {
        const newGrid = g.map(row => [...row]);
        newGrid[r][c] = 1;
        return newGrid;
      });
      setStep(s => s + 1);
    }, ANIMATION_SPEED);
    return () => clearTimeout(timer);
  }, [step, grid]);

  return (
    <div className="flex justify-center my-8">
      <div
        style={{
          display: 'grid',
          gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
          gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
          gap: 2,
          background: BG_COLOR,
          borderRadius: 8,
          boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
        }}
      >
        {grid.map((row, r) =>
          row.map((cell, c) => (
            <div
              key={r + '-' + c}
              style={{
                width: 12,
                height: 12,
                background: cell ? LETTER_COLOR : BG_COLOR,
                transition: 'background 0.2s',
                borderRadius: 2,
              }}
            />
          ))
        )}
      </div>
    </div>
  );
} 