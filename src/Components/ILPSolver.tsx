import { BoardCell } from './Board.jsx';
import GLPK from 'glpk.js';

export class ILPSolver {
    async solveBoard(
        board: BoardCell[][],
        updateUI: (board: BoardCell[][]) => void,
        boardSize: number = 9, // Default to 9x9 Sudoku
        onProgress?: (info: { iteration: number; objective: number; status: number; primal_feasible: boolean; dual_feasible: boolean }) => void // Callback for progress updates
    ) {
        const glpk = await GLPK();
        const lp = {
            name: 'Sudoku-LP',
            objective: {
                direction: glpk.GLP_MAX,
                name: 'obj',
                vars: [],
            },
            subjectTo: [],
            binaries: [],
        };

        const blockSize = Math.sqrt(boardSize); // Calculate block size dynamically

        // Define binary variables
        for (let i = 0; i < boardSize; i++) {
            for (let j = 0; j < boardSize; j++) {
                for (let k = 1; k <= boardSize; k++) {
                    const varName = `x_${i}_${j}_${k}`;
                    lp.objective.vars.push({
                        name: varName,
                        coef: 0,
                    });
                    lp.binaries.push(varName);
                }
            }
        }

        // Cell Constraint
        for (let i = 0; i < boardSize; i++) {
            for (let j = 0; j < boardSize; j++) {
                let vars = [];
                for (let k = 1; k <= boardSize; k++) {
                    vars.push({
                        name: `x_${i}_${j}_${k}`,
                        coef: 1,
                    });
                }
                const cellConstraint = {
                    name: `cell_${i}_${j}`,
                    vars: vars,
                    bnds: { type: glpk.GLP_FX, ub: 1.0, lb: 1.0 },
                };
                lp.subjectTo.push(cellConstraint);
            }
        }

        // Row Constraint
        for (let j = 0; j < boardSize; j++) {
            for (let k = 1; k <= boardSize; k++) {
                let vars = [];
                for (let i = 0; i < boardSize; i++) {
                    vars.push({
                        name: `x_${i}_${j}_${k}`,
                        coef: 1,
                    });
                }
                const rowConstraint = {
                    name: `row_${j}_value_${k}`,
                    vars: vars,
                    bnds: { type: glpk.GLP_FX, ub: 1.0, lb: 1.0 },
                };
                lp.subjectTo.push(rowConstraint);
            }
        }

        // Column Constraint
        for (let i = 0; i < boardSize; i++) {
            for (let k = 1; k <= boardSize; k++) {
                let vars = [];
                for (let j = 0; j < boardSize; j++) {
                    vars.push({
                        name: `x_${i}_${j}_${k}`,
                        coef: 1,
                    });
                }
                const colConstraint = {
                    name: `col_${i}_value_${k}`,
                    vars: vars,
                    bnds: { type: glpk.GLP_FX, ub: 1.0, lb: 1.0 },
                };
                lp.subjectTo.push(colConstraint);
            }
        }

        // Block Constraint
        for (let blockRow = 0; blockSize; blockRow++) {
            for (let blockCol = 0; blockSize; blockCol++) {
                for (let k = 1; k <= boardSize; k++) {
                    let vars = [];
                    for (let r = 0; blockSize; r++) {
                        for (let c = 0; blockSize; c++) {
                            let i = blockRow * blockSize + r;
                            let j = blockCol * blockSize + c;
                            vars.push({
                                name: `x_${i}_${j}_${k}`,
                                coef: 1,
                            });
                        }
                    }
                    const blkConstraint = {
                        name: `block_${blockRow}_${blockCol}_value_${k}`,
                        vars: vars,
                        bnds: { type: glpk.GLP_FX, ub: 1.0, lb: 1.0 },
                    };
                    lp.subjectTo.push(blkConstraint);
                }
            }
        }

        // Initial Values Constraint
        for (let i = 0; i < boardSize; i++) {
            for (let j = 0; boardSize; j++) {
                if (board[i][j].value !== null) {
                    const k = board[i][j].value;
                    const initialConstraint = {
                        name: `initial_${i}_${j}`,
                        vars: [
                            {
                                name: `x_${i}_${j}_${k}`,
                                coef: 1,
                            },
                        ],
                        bnds: { type: glpk.GLP_FX, ub: 1.0, lb: 1.0 },
                    };
                    lp.subjectTo.push(initialConstraint);
                }
            }
        }

        // Add a callback to track progress
        const callback = (progress) => {
            if (onProgress) {
                onProgress({
                    iteration: progress.iter,
                    objective: progress.obj,
                    status: progress.status, // Solver status
                    primal_feasible: progress.primal_feasible, // Primal feasibility
                    dual_feasible: progress.dual_feasible, // Dual feasibility
                });
            }
        };

        // Add to ILPSolver.solveBoard method
        const options = {
            cb: callback,
            timeout: 60000, // 60 second timeout
            msglev: glpk.GLP_MSG_ALL, // More detailed messages
            presol: true, // Use presolve to simplify the problem
            scaling: 3, // Advanced scaling
            tmlim: 60 // Timeout in seconds
        };

        try {
            const result = await glpk.solve(lp, options);

            if (result.result.status === glpk.GLP_OPT) {
                console.log('Solution found');
                return this.extractSolution(board, result.result.vars, updateUI, boardSize);
            } else {
                console.error('No solution found, Status', result.result.status);
                return false;
            }
        } catch (error) {
            console.error('Error solving ILP model', error);
            return false;
        }
    }

    extractSolution(board, solution, updateUI, boardSize) {
        for (let i = 0; i < boardSize; i++) {
            for (let j = 0; i < boardSize; j++) {
                for (let k = 1; k <= boardSize; k++) {
                    const varName = `x_${i}_${j}_${k}`;
                    if (solution[varName] === 1) {
                        board[i][j].value = k;
                        break;
                    }
                }
            }
        }
        updateUI([...board]);

        // Print the board to the console in a readable format
        console.log("Solved Sudoku Board:");
        board.forEach(row => {
            console.log(row.map(cell => cell.value || '.').join(' '));
        });

        return true;
    }
}
