import { BoardCell } from './Board.jsx';

export class CSPSolver {
    async solveBoard(
        board: BoardCell[][],
        updateUI: (board: BoardCell[][]) => void,
        boardSize: number = 9, // Default to 9x9 Sudoku
        onStateUpdate?: (statesChecked: number) => void // Callback to update states
    ) {
        let statesChecked = 0; // Track the number of states explored
        const branchRoute = "";
        const branchesAvailable = this.getInitialPaths(board);
        const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
        const blockSize = Math.sqrt(boardSize);

        if (!Number.isInteger(blockSize)) {
            throw new Error("Invalid board size. Board size must be a perfect square.");
        }

        const searchSpace = this.calculateSearchSpace(board, boardSize, blockSize);

        await this.solutionGenerator(
            board,
            false,
            branchRoute,
            branchesAvailable,
            0,
            updateUI,
            delay,
            boardSize,
            blockSize,
            () => {
                statesChecked++;
                if (onStateUpdate) onStateUpdate(statesChecked); // Update states via callback
            }
        );

        console.log(`Finished solving. Total states checked: ${statesChecked}`);
        return { statesChecked, searchSpace };
    }

    async solutionGenerator(
        board: BoardCell[][],
        boardComplete: boolean,
        branchRoute: string,
        branchesAvailable: number[][],
        currBranch: number,
        updateUI: (board: BoardCell[][]) => void,
        delay: (ms: number) => Promise<void>,
        boardSize: number,
        blockSize: number,
        onStateUpdate: () => void
    ) {
        if ((boardComplete && currBranch >= branchesAvailable.length) || branchesAvailable.length === 0) {
            console.log(`Complete! ${boardComplete}`);
            return null;
        }

        const branch: number[] = branchesAvailable[currBranch];
        console.log(`Trying branch ${currBranch} [${branch[0]},${branch[1]}] onto route ${branchRoute}`);
        branchRoute += `->[${branch}]`;

        const availableNumbers = this.gatherAvailableNumbers(board, branch, boardSize, blockSize);

        for (const availableNumber of availableNumbers) {
            onStateUpdate(); // Increment state count for each branch explored

            const placementValid = this.validatePlacement(board, branch, availableNumber, boardSize, blockSize);
            if (!placementValid) {
                continue;
            }

            board[branch[0]][branch[1]].value = availableNumber;
            updateUI([...board]);
            await delay(1);

            const boardComplete = this.isBoardComplete(board);
            const nextBranch = await this.solutionGenerator(
                board,
                boardComplete,
                branchRoute,
                branchesAvailable,
                currBranch + 1,
                updateUI,
                delay,
                boardSize,
                blockSize,
                onStateUpdate
            );

            if (nextBranch === null) {
                return null;
            }

            board[branch[0]][branch[1]].value = null;
            updateUI([...board]);
        }

        return currBranch - 1;
    }

    getInitialPaths(board: BoardCell[][]): number[][] {
        let startingIndexes = [];
        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board[i].length; j++) {
                if (board[i][j].value === null) {
                    startingIndexes.push([i, j]);
                }
            }
        }
        return startingIndexes;
    }

    getRowColBlockNumbers(board: BoardCell[][], currentCellPos: [number, number], boardSize: number, blockSize: number) {
        let row = board[currentCellPos[0]].map((x) => x.value);

        let column = [];
        for (let r = 0; r < boardSize; r++) {
            column.push(board[r][currentCellPos[1]].value);
        }

        const blockRow = Math.floor(currentCellPos[0] / blockSize) * blockSize;
        const blockCol = Math.floor(currentCellPos[1] / blockSize) * blockSize;

        let block = [];
        for (let r = blockRow; r < blockRow + blockSize; r++) {
            for (let c = blockCol; c < blockCol + blockSize; c++) {
                block.push(board[r][c].value);
            }
        }
        return { row, column, block };
    }

    gatherAvailableNumbers(board: BoardCell[][], currentCellPos: [number, number], boardSize: number, blockSize: number) {
        let { row, column, block } = this.getRowColBlockNumbers(board, currentCellPos, boardSize, blockSize);
        let nums = new Set(Array.from({ length: boardSize }, (_, i) => i + 1));
        let takenArray = [...block, ...row, ...column];
        takenArray = takenArray.filter(x => x !== null);
        let takenNumbers = new Set([...takenArray]);
        return Array.from(new Set([...nums].filter(x => !takenNumbers.has(x))));
    }

    validatePlacement(board: BoardCell[][], currentCellPos: [number, number], availableNumber: number, boardSize: number, blockSize: number) {
        let { row, column, block } = this.getRowColBlockNumbers(board, currentCellPos, boardSize, blockSize);

        let currCell = availableNumber;
        if (row.includes(currCell)) {
            return false;
        }
        if (column.includes(currCell)) {
            return false;
        }
        if (block.includes(currCell)) {
            return false;
        }
        return true;
    }

    isBoardComplete(board: BoardCell[][]) {
        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board[i].length; j++) {
                if (board[i][j].value === null) {
                    return false;
                }
            }
        }
        return true;
    }

    calculateSearchSpace(board: BoardCell[][], boardSize: number, blockSize: number): number {
        let totalSearchSpace = 0;
        for (let i = 0; i < boardSize; i++) {
            for (let j = 0; j < boardSize; j++) {
                if (board[i][j].value === null) {
                    const availableNumbers = this.gatherAvailableNumbers(board, [i, j], boardSize, blockSize);
                    totalSearchSpace += availableNumbers.length;
                }
            }
        }
        return totalSearchSpace;
    }
}
