import {BoardCell} from './Board.jsx'

export class Solver {
    async solveBoard(board: BoardCell[][], updateUI: (board: BoardCell[][]) => void) {
        // solve board steps:
        // 1. Pick an initial solution
        // 2. Explore all extensions of the current solution
        // 3. If an extension leads to a solution, return that solution.
        // 4. if an extension does not lead to a solution, backtrack to the previous.
        // 5. Repeat 2-4 until all possible solutions have been explored.
        let branchRoute = ""
        let branchesAvailable = this.getInitialPaths(board);
        // Add delay helper function
        const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
        await this.solutionGenerator(board, false, branchRoute, branchesAvailable, 0, updateUI, delay);
        console.log("Finished solving");
    }

    async solutionGenerator(board: BoardCell[][],
                            boardComplete: boolean,
                            branchRoute:string,
                            branchesAvailable: number[][],
                            currBranch: number,
                            updateUI: (board: BoardCell[][]) => void,
                            delay: (ms: number) => Promise<void>)
    {
        if (boardComplete && currBranch >= branchesAvailable.length || branchesAvailable.length == 0) {
            console.log(`complete! ${boardComplete}`);
            return null;
        }
        let branch: number[] = branchesAvailable[currBranch];
        console.log(`trying branch ${currBranch} [${branch[0]},${branch[1]}] onto route ${branchRoute}`);
        branchRoute += `->[${branch}]`
        // try this branch to see if it works.
        // from this position what numbers are available
        let availableNumbers = this.gatherAvailableNumbers(board, branch);
        // each of these numbers becomes a possible combination to try
        for (let availableNumber of availableNumbers) {
            let placementValid = this.validatePlacement(board, branch, availableNumber);
            if (! placementValid) {
                // try next solution
                continue;
            }

            // set this value as it's valid
            board[branch[0]][branch[1]].value = availableNumber;
            updateUI([...board]);
            await delay(1);  // 50ms delay between moves
            console.log(`currBranch ${currBranch} [${branch[0]},${branch[1]}] ${availableNumber} is valid`);
            let boardComplete = this.isBoardComplete(board);
            // now from this position, chose the next branch that needs filling out.
            currBranch = await this.solutionGenerator(board, boardComplete, branchRoute, branchesAvailable, currBranch+=1, updateUI, delay);
            if (currBranch == null) {
                return null;
            }
            // solution didn't work, so let's remove the value we had here, and try the next available.
            console.log(`erasing ${currBranch} [${branch[0]},${branch[1]}] [${board[branch[0]][branch[1]].value}] invalid number by downstream route.`)
            board[branch[0]][branch[1]].value = null;
            updateUI([...board]);
        }
        // this branch didn't work so we will rewind the branch.
        return currBranch -= 1;
    }


    getInitialPaths(board: BoardCell[][]): number[][] {
        let startingIndexes = [];
        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board[i].length; j++) {
                if (board[i][j].value === null) {
                    //console.log(`Detected available position @ [${i},${j}]`);
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
        let takenArray = [...block, ...row, ...column];
        takenArray = takenArray.filter(x => x !== null);
        let takenNumbers = new Set([...takenArray]);
        return Array.from(new Set([...nums].filter(x => !takenNumbers.has(x))));

    }

    validatePlacement(board: BoardCell[][], currentCellPos: [number, number], availableNumber: number) {
        //check row
        let {row, column, block} = this.getRowColBlockNumbers(board, currentCellPos);

        let currCell = availableNumber;
        if (row.includes(currCell)) {
            //console.log(`row ${row} contains ${currCell}`);
            return false;
        }
        if (column.includes(currCell)) {
            //console.log(`column ${column} contains ${currCell}`);
            return false;
        }
        if (block.includes(currCell)) {
            //console.log(`block ${block} contains ${currCell}`);
            return false;
        }
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
