export type CellState = number; // 0 for dead, 1 for alive, potentially more for other rules
export type Grid = CellState[][];
export type RuleFunction = (neighbors: CellState[], currentState: CellState) => CellState;

/**
 * Creates an initial grid with specified dimensions and an initializer function.
 * @param rows Number of rows.
 * @param cols Number of columns.
 * @param initializer Function to determine the initial state of each cell (row, col) => CellState.
 * @returns The initialized grid.
 */
export function createGrid(rows: number, cols: number, initializer: (row: number, col: number) => CellState): Grid {
  const grid: Grid = [];
  for (let i = 0; i < rows; i++) {
    grid[i] = [];
    for (let j = 0; j < cols; j++) {
      grid[i][j] = initializer(i, j);
    }
  }
  return grid;
}

/**
 * Calculates the next state of the grid based on a rule function.
 * Assumes toroidal (wrap-around) boundary conditions.
 * @param currentGrid The current state of the grid.
 * @param rule The rule function to apply.
 * @returns The grid representing the next generation.
 */
export function nextGeneration(currentGrid: Grid, rule: RuleFunction): Grid {
  if (!currentGrid || currentGrid.length === 0 || currentGrid[0].length === 0) {
    return [];
  }

  const rows = currentGrid.length;
  const cols = currentGrid[0].length;
  const newGrid: Grid = createGrid(rows, cols, () => 0); // Initialize new grid with dead cells

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      // Get Moore neighbors (8 surrounding cells) with wrap-around
      const neighbors: CellState[] = [];
      for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
          if (x === 0 && y === 0) continue; // Skip the cell itself
          const ni = (i + x + rows) % rows; // Wrap around rows
          const nj = (j + y + cols) % cols; // Wrap around columns
          neighbors.push(currentGrid[ni][nj]);
        }
      }
      newGrid[i][j] = rule(neighbors, currentGrid[i][j]);
    }
  }

  return newGrid;
}

/**
 * Example initializer: Randomly assigns 0 or 1.
 */
export function randomInitializer(probabilityAlive: number = 0.5): (row: number, col: number) => CellState {
    return () => (Math.random() < probabilityAlive ? 1 : 0);
}

// --- Famous Rules ---

/**
 * Conway's Game of Life Rule (B3/S23).
 * @param neighbors Array of neighbor states (0 or 1).
 * @param currentState The current cell's state (0 or 1).
 * @returns The next state of the cell.
 */
export const conwayRule: RuleFunction = (neighbors, currentState) => {
  const liveNeighbors = neighbors.reduce((sum, state) => sum + state, 0);

  if (currentState === 1) {
    // Survival: A live cell with 2 or 3 live neighbors survives.
    return (liveNeighbors === 2 || liveNeighbors === 3) ? 1 : 0;
  } else {
    // Birth: A dead cell with exactly 3 live neighbors becomes a live cell.
    return (liveNeighbors === 3) ? 1 : 0;
  }
};




// --- More Famous 2D Rules ---

/**
 * Seeds Rule (B2/S).
 * A dead cell becomes live if it has exactly 2 live neighbors.
 * All live cells die in the next generation.
 * @param neighbors Array of neighbor states (0 or 1).
 * @param currentState The current cell's state (0 or 1).
 * @returns The next state of the cell.
 */
export const seedsRule: RuleFunction = (neighbors, currentState) => {
  const liveNeighbors = neighbors.reduce((sum, state) => sum + state, 0);
  if (currentState === 0) {
    // Birth: A dead cell with exactly 2 live neighbors becomes live.
    return (liveNeighbors === 2) ? 1 : 0;
  } else {
    // Survival: No live cells survive (S parameter is empty).
    return 0;
  }
};

/**
 * HighLife Rule (B36/S23).
 * Similar to Conway's Game of Life, but with different birth/survival conditions.
 * @param neighbors Array of neighbor states (0 or 1).
 * @param currentState The current cell's state (0 or 1).
 * @returns The next state of the cell.
 */
export const highLifeRule: RuleFunction = (neighbors, currentState) => {
  const liveNeighbors = neighbors.reduce((sum, state) => sum + state, 0);

  if (currentState === 1) {
    // Survival: A live cell with 2 or 3 live neighbors survives.
    return (liveNeighbors === 2 || liveNeighbors === 3) ? 1 : 0;
  } else {
    // Birth: A dead cell with 3 or 6 live neighbors becomes a live cell.
    return (liveNeighbors === 3 || liveNeighbors === 6) ? 1 : 0;
  }
};

// --- Elementary Cellular Automata (1D) ---

export type OneDGrid = CellState[];
export type ElementaryRuleFunction = (left: CellState, center: CellState, right: CellState) => CellState;

/**
 * Creates an initial 1D grid (row).
 * @param size Number of cells.
 * @param initializer Function to determine the initial state of each cell (index) => CellState.
 * @returns The initialized 1D grid.
 */
export function createOneDGrid(size: number, initializer: (index: number) => CellState): OneDGrid {
  const grid: OneDGrid = [];
  for (let i = 0; i < size; i++) {
    grid[i] = initializer(i);
  }
  return grid;
}

/**
 * Calculates the next generation of a 1D elementary cellular automaton.
 * Assumes toroidal (wrap-around) boundary conditions.
 * @param currentGrid The current state of the 1D grid.
 * @param rule The elementary rule function to apply.
 * @returns The 1D grid representing the next generation.
 */
export function nextOneDGeneration(currentGrid: OneDGrid, rule: ElementaryRuleFunction): OneDGrid {
  if (!currentGrid || currentGrid.length === 0) {
    return [];
  }

  const size = currentGrid.length;
  const newGrid: OneDGrid = createOneDGrid(size, () => 0);

  for (let i = 0; i < size; i++) {
    const left = currentGrid[(i - 1 + size) % size]; // Wrap around left
    const center = currentGrid[i];
    const right = currentGrid[(i + 1) % size]; // Wrap around right
    newGrid[i] = rule(left, center, right);
  }

  return newGrid;
}

/**
 * Creates an elementary rule function from its Wolfram code (0-255).
 * @param ruleNumber The Wolfram code (e.g., 30, 110).
 * @returns An ElementaryRuleFunction.
 */
export function getElementaryRule(ruleNumber: number): ElementaryRuleFunction {
  if (ruleNumber < 0 || ruleNumber > 255) {
    throw new Error("Rule number must be between 0 and 255.");
  }

  // Convert rule number to 8-bit binary string, padded with leading zeros
  const binaryRule = ruleNumber.toString(2).padStart(8, '0');

  return (left, center, right) => {
    // The 8 neighborhood patterns in descending order: 111, 110, 101, 100, 011, 010, 001, 000
    const patternIndex = 7 - (left * 4 + center * 2 + right * 1);
    return parseInt(binaryRule[patternIndex], 10);
  };
}

/**
 * Example 1D initializer: Single live cell in the middle.
 */
export function singleCellInitializer(size: number): (index: number) => CellState {
    return (index) => (index === Math.floor(size / 2) ? 1 : 0);
}

// Example Elementary Rules
export const rule30 = getElementaryRule(30);
export const rule110 = getElementaryRule(110);
export const rule90 = getElementaryRule(90);





// --- Custom Rule Parsing ---

/**
 * Parses a B/S notation rule string (e.g., "B3/S23") into a RuleFunction.
 * @param ruleString The B/S notation string.
 * @returns A RuleFunction corresponding to the B/S string.
 * @throws Error if the rule string format is invalid.
 */
export function parseBSRule(ruleString: string): RuleFunction {
  const match = ruleString.toUpperCase().match(/^B([0-8]*)\/S([0-8]*)$/);
  if (!match) {
    throw new Error("Invalid B/S rule format. Expected format: B<birth_digits>/S<survival_digits> (e.g., B3/S23)");
  }

  const birthConditions = match[1].split("").map(Number);
  const survivalConditions = match[2].split("").map(Number);

  // Validate digits
  if (birthConditions.some(isNaN) || survivalConditions.some(isNaN)) {
      throw new Error("Invalid digits in B/S rule. Use digits 0-8 only.");
  }

  // Create sets for efficient lookup
  const birthSet = new Set(birthConditions);
  const survivalSet = new Set(survivalConditions);

  return (neighbors, currentState) => {
    const liveNeighbors = neighbors.reduce((sum, state) => sum + (state === 1 ? 1 : 0), 0); // Assuming state 1 is 'live'

    if (currentState === 1) {
      // Survival check
      return survivalSet.has(liveNeighbors) ? 1 : 0;
    } else {
      // Birth check
      return birthSet.has(liveNeighbors) ? 1 : 0;
    }
  };
}




// --- Example Simulation: Forest Fire ---

export const FIRE_STATES = {
  EMPTY: 0,
  TREE: 1,
  BURNING: 2,
  BURNT: 3,
};

/**
 * Initializer for Forest Fire: Creates a grid mostly populated with trees,
 * with some empty patches and potentially a starting fire point.
 * @param rows Number of rows.
 * @param cols Number of columns.
 * @param treeDensity Probability a cell is initially a tree (vs empty).
 * @param initialFire Optional coordinates {row, col} to start the fire.
 * @returns The initialized grid for the fire simulation.
 */
export function forestInitializer(rows: number, cols: number, treeDensity: number = 0.8, initialFire?: {row: number, col: number}): Grid {
  return createGrid(rows, cols, (r, c) => {
    if (initialFire && r === initialFire.row && c === initialFire.col) {
      return FIRE_STATES.BURNING;
    }
    return Math.random() < treeDensity ? FIRE_STATES.TREE : FIRE_STATES.EMPTY;
  });
}

/**
 * Forest Fire Rule.
 * - Burning trees turn into burnt trees.
 * - Trees next to a burning tree start burning (probabilistically).
 * @param neighbors Array of neighbor states.
 * @param currentState The current cell's state.
 * @param ignitionProbability Probability a tree catches fire from a burning neighbor.
 * @returns The next state of the cell.
 */
export function forestFireRule(neighbors: CellState[], currentState: CellState, ignitionProbability: number = 0.4): CellState {
  if (currentState === FIRE_STATES.BURNING) {
    return FIRE_STATES.BURNT; // Burning tree burns out
  }

  if (currentState === FIRE_STATES.TREE) {
    // Check if any neighbor is burning
    const isNeighborBurning = neighbors.some(state => state === FIRE_STATES.BURNING);
    if (isNeighborBurning) {
        // Probabilistic ignition
        return Math.random() < ignitionProbability ? FIRE_STATES.BURNING : FIRE_STATES.TREE;
    }
  }

  // EMPTY and BURNT states remain unchanged
  return currentState;
}

// --- Example Simulation: Simple Crystal Growth ---

export const CRYSTAL_STATES = {
  EMPTY: 0,
  CRYSTAL: 1,
};

/**
 * Initializer for Crystal Growth: Creates an empty grid with a seed crystal in the center.
 * @param rows Number of rows.
 * @param cols Number of columns.
 * @returns The initialized grid for crystal growth.
 */
export function crystalSeedInitializer(rows: number, cols: number): Grid {
  const centerRow = Math.floor(rows / 2);
  const centerCol = Math.floor(cols / 2);
  return createGrid(rows, cols, (r, c) => {
    return (r === centerRow && c === centerCol) ? CRYSTAL_STATES.CRYSTAL : CRYSTAL_STATES.EMPTY;
  });
}

/**
 * Simple Crystal Growth Rule.
 * An empty cell becomes crystal if it has at least N crystal neighbors.
 * @param neighbors Array of neighbor states.
 * @param currentState The current cell's state.
 * @param threshold Minimum number of crystal neighbors to turn an empty cell into crystal.
 * @returns The next state of the cell.
 */
export function simpleCrystalRule(neighbors: CellState[], currentState: CellState, threshold: number = 3): CellState {
    if (currentState === CRYSTAL_STATES.EMPTY) {
        const crystalNeighbors = neighbors.reduce((sum, state) => sum + (state === CRYSTAL_STATES.CRYSTAL ? 1 : 0), 0);
        if (crystalNeighbors >= threshold) {
            return CRYSTAL_STATES.CRYSTAL;
        }
    }
    // Crystal state remains crystal, empty remains empty if threshold not met
    return currentState;
}

