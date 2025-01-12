import {BoardCell} from './Board.jsx'

export class Solver {

    solveBoard(board: BoardCell[][]) {
        // solve board steps:
        // 1. Pick an initial solution
        // 2. Explore all extensions of the current solution
        // 3. If an extension leads to a solution, return that solution.
        // 4. if an extension does not lead to a solution, backtrack to the previous.
        // 5. Repeat 2-4 until all possible solutions have been explored.
        this.solutionGenerator(board, false);
    }

    solutionGenerator(board: BoardCell[][], boardComplete: boolean) {
        if (boardComplete) {
            console.log(`complete! ${boardComplete}`);
            return null;
        }
        let branches = this.getInitialPaths(board);
        console.log(`found ${branches.length} branches`);
        for (let branch of branches) {
            console.log(`trying branch [${branch[0]},${branch[1]}]`);
            let availableNumbers = this.gatherAvailableNumbers(board, branch);
            for (let availableNumber of availableNumbers) {
                console.log(`trying ${availableNumber}`);
                if (this.validatePlacement(board, branch, availableNumber)) {
                    let boardComplete = this.isBoardComplete(board);
                    board[branch[0]][branch[1]].value = availableNumber;
                    return this.solutionGenerator(board, boardComplete);
                } else {
                    console.log(`Invalid placement of ${availableNumber}`);
                    board[branch[0]][branch[1]].value = null;
                }
            }
        }
    }

    getInitialPaths(board: BoardCell[][]) {
        let startingIndexes = [];
        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board[i].length; j++) {
                if (board[i][j].value === null) {
                    console.log(`Detected available position @ [${i},${j}]`);
                    startingIndexes.push([i, j]);
                }
            }
        }
        return startingIndexes;
    }

    getRowColBlockNumbers(board: BoardCell[][], currentCellPos: [number, number]) {
        let row = board[currentCellPos[0]].map((x) => x.value)

        // construct column
        let column = [];
        for (let r = 0; r < board.length; r++) {
            column.push(board[r][currentCellPos[1]].value);
        }

        // construct block
        // Find which block we're in
        const blockRow = Math.floor(currentCellPos[0] / 3) * 3;  // Start of block row
        const blockCol = Math.floor(currentCellPos[1] / 3) * 3;  // Start of block col

        let block = [];
        // Get all numbers in the current 3x3 block
        for (let r = blockRow; r < blockRow + 3; r++) {
            for (let c = blockCol; c < blockCol + 3; c++) {
                block.push(board[r][c].value);
            }
        }
        return { row, column, block};
    }

    gatherAvailableNumbers(board: BoardCell[][], currentCellPos: [number, number]) {
        let {row, column, block} = this.getRowColBlockNumbers(board, currentCellPos);
        let nums = new Set([1,2,3,4,5,6,7,8,9]);
        let blockNumbers = new Set([...block]);
        return Array.from(new Set([...nums].filter(x => !blockNumbers.has(x))));

    }

    validatePlacement(board: BoardCell[][], currentCellPos: [number, number], availableNumber: number) {
        //check row
        let {row, column, block} = this.getRowColBlockNumbers(board, currentCellPos);

        let currCell = availableNumber;
        if (row.includes(currCell)) {
            console.log(`row ${row} contains ${currCell}`);
            return false;
        }
        if (column.includes(currCell)) {
            console.log(`column ${column} contains ${currCell}`);
            return false;
        }
        if (block.includes(currCell)) {
            console.log(`block ${block} contains ${currCell}`);
            return false;
        }
        console.log(`num ${currCell} not found in local`);
        return true;

    }

    isBoardComplete(board: BoardCell[][]) {
        for (let i = 1; i < board.length; i++) {
            for (let j = 0; j < board[i].length; j++) {
                if (board[i][j].value === null) {
                    return false;
                }
            }
        }
        return true;
    }
}
