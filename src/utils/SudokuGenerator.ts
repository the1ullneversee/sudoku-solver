import fs from 'fs';

export function generateSudoku(boardSize: number, difficulty: string): number[][] {
    const blockSize = Math.sqrt(boardSize);
    if (!Number.isInteger(blockSize)) {
        throw new Error("Invalid board size. Board size must be a perfect square.");
    }

    console.log(`Starting Sudoku generation for board size ${boardSize}x${boardSize} with difficulty ${difficulty}`);

    // Generate a base pattern for the Sudoku board
    const basePattern = (row: number, col: number) =>
        (blockSize * (row % blockSize) + Math.floor(row / blockSize) + col) % boardSize;

    // Create a fully solved board using the base pattern
    const board = Array.from({ length: boardSize }, (_, row) =>
        Array.from({ length: boardSize }, (_, col) => basePattern(row, col) + 1)
    );

    // Shuffle rows, columns, and numbers to randomize the board
    const shuffleArray = (array: number[]) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    const shuffleBoard = () => {
        // Shuffle rows within each block
        for (let block = 0; block < blockSize; block++) {
            const rows = Array.from({ length: blockSize }, (_, i) => block * blockSize + i);
            const shuffledRows = shuffleArray([...rows]);
            for (let i = 0; i < blockSize; i++) {
                [board[rows[i]], board[shuffledRows[i]]] = [board[shuffledRows[i]], board[rows[i]]];
            }
        }

        // Shuffle columns within each block
        for (let block = 0; block < blockSize; block++) {
            const cols = Array.from({ length: blockSize }, (_, i) => block * blockSize + i);
            const shuffledCols = shuffleArray([...cols]);
            for (let i = 0; i < blockSize; i++) {
                for (let row = 0; row < boardSize; row++) {
                    [board[row][cols[i]], board[row][shuffledCols[i]]] = [
                        board[row][shuffledCols[i]],
                        board[row][cols[i]],
                    ];
                }
            }
        }

        // Shuffle numbers
        const numbers = Array.from({ length: boardSize }, (_, i) => i + 1);
        const shuffledNumbers = shuffleArray([...numbers]);
        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                board[row][col] = shuffledNumbers[board[row][col] - 1];
            }
        }
    };

    shuffleBoard();

    console.log("Fully solved board generated");

    // Determine the percentage of cells to remove based on difficulty
    let removalPercentage;
    switch (difficulty) {
        case "Easy":
            removalPercentage = 0.4; // Remove 40% of cells
            break;
        case "Medium":
            removalPercentage = 0.5; // Remove 50% of cells
            break;
        case "Hard":
            removalPercentage = 0.6; // Remove 60% of cells
            break;
        default:
            removalPercentage = 0.5; // Default to Medium
    }

    const totalCells = boardSize * boardSize;
    const removeCells = Math.floor(totalCells * removalPercentage);
    console.log(`Removing ${removeCells} cells to create the puzzle`);

    let removed = 0;
    while (removed < removeCells) {
        const row = Math.floor(Math.random() * boardSize);
        const col = Math.floor(Math.random() * boardSize);

        if (board[row][col] !== 0) {
            board[row][col] = 0;
            removed++;
        }

        // Log progress every 10 removals
        if (removed % 10 === 0) {
            console.log(`Removed ${removed}/${removeCells} cells`);
        }
    }

    console.log("Sudoku puzzle generation complete");
    console.log("Generated Sudoku Board:", board);
    return board;
}
