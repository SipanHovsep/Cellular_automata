"use client"; // GridDisplay itself doesn't use hooks, but it's used by client components, so marking it might be safer or required depending on usage context.

import React, { useState, useCallback } from 'react';
import { Grid, OneDGrid } from '@/lib/automata';

interface GridDisplayProps {
  grid: Grid | OneDGrid;
  cellSize?: number;
  cellColor?: (state: number) => string;
  onCellClick?: (row: number, col: number) => void;
  isDrawing?: boolean;
  brushSize?: number;
}

const defaultCellColor = (state: number): string => {
  // Simple black/white for 0/1 states
  if (state === 1) return 'bg-black';
  // Add more colors for multi-state automata later
  return 'bg-white';
};

const GridDisplay: React.FC<GridDisplayProps> = ({
  grid,
  cellSize = 10, // default cell size in pixels
  cellColor = defaultCellColor,
  onCellClick,
  isDrawing = false,
  brushSize = 1,
}) => {
  const [isMouseDown, setIsMouseDown] = useState(false);

  if (!grid || grid.length === 0) {
    return <div className="border border-gray-300 p-4 text-center text-gray-500">No grid data</div>;
  }

  const isOneD = !Array.isArray(grid[0]);

  if (isOneD) {
    // Render 1D grid (single row) - This interpretation might be wrong for Elementary CA history.
    // If grid is OneDGrid[], it's actually a history (2D). Let's adjust.
    // Check if the first element is an array. If not, it's a single 1D grid.
    // If the first element IS an array, treat it as 2D (history of 1D).
    const isHistory = Array.isArray(grid[0]);

    if (!isHistory) {
        // Render single 1D grid (single row)
        const oneDGrid = grid as OneDGrid;
        return (
          <div className="flex border border-gray-300" style={{ height: `${cellSize}px` }}>
            {oneDGrid.map((cellState, colIndex) => (
              <div
                key={`cell-${colIndex}`}
                className={`flex-shrink-0 border-r border-b border-gray-200 ${cellColor(cellState)}`}
                style={{
                  width: `${cellSize}px`,
                  height: `${cellSize}px`,
                }}
              />
            ))}
          </div>
        );
    } // else fall through to 2D rendering which handles OneDGrid[] history

  }

  // Render 2D grid or 1D history
  const twoDGrid = grid as Grid; // Works for Grid (CellState[][]) and history (OneDGrid[] which is CellState[][])
  const numRows = twoDGrid.length;
  const numCols = twoDGrid[0]?.length || 0;

  if (numRows === 0 || numCols === 0) {
      return <div className="border border-gray-300 p-4 text-center text-gray-500">Empty grid data</div>;
  }

  const handleMouseDown = (row: number, col: number) => {
    setIsMouseDown(true);
    if (onCellClick) {
      onCellClick(row, col);
    }
  };

  const handleMouseEnter = (row: number, col: number) => {
    if (isMouseDown && onCellClick) {
      onCellClick(row, col);
    }
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  return (
    <div
      className="inline-block border border-gray-300 leading-none select-none"
      style={{
        gridTemplateColumns: `repeat(${numCols}, ${cellSize}px)`,
        gridTemplateRows: `repeat(${numRows}, ${cellSize}px)`,
        display: 'grid',
        // Add a max-width to prevent extremely wide grids from breaking layout
        maxWidth: '100%',
        overflowX: 'auto', // Allow horizontal scrolling for wide grids
      }}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {twoDGrid.map((row, rowIndex) =>
        row.map((cellState, colIndex) => (
          <div
            key={`cell-${rowIndex}-${colIndex}`}
            // Adjusted borders slightly for better look
            className={`border-r border-b border-gray-200 ${cellColor(cellState)} cursor-pointer`}
            style={{
              width: `${cellSize}px`,
              height: `${cellSize}px`,
              // Ensure borders don't add to size
              boxSizing: 'border-box',
            }}
            onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
            onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
          />
        ))
      )}
    </div>
  );

};

export default GridDisplay;
