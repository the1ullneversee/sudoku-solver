import { BoardCell } from './Board.jsx';
//import * as GLPK from 'glpk.js';
import GLPK from 'glpk.js';

export class ILPSolver {
  // Constraints from the mathematical formulation:
  // 1. ∑(i=1 to 9) xijk = 1 for j,k = 1 to 9 (each row must have each digit)
  // 2. ∑(j=1 to 9) xijk = 1 for i,k = 1 to 9 (each column must have each digit)
  // 3. ∑(j=3p-2 to 3p) ∑(i=3q-2 to 3q) xijk = 1 for k = 1 to 9, p,q = 1 to 3 (each box has each digit)
  // 4. ∑(k=1 to 9) xijk = 1 for i,j = 1 to 9 (each cell has exactly one value)
  // 5. xijk = 1 for all (i,j,k) ∈ G = all the known cells
  async solveBoard(
    board: BoardCell[][],
    updateUI: (board: BoardCell[][]) => void
  ) {
    // 1. init the GLPK solver
    // 2. Define variables
    // 3. Define constraints
    // 4. Solve the problem.
    // 5. Update the board with the solution
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

    // define 9x9x9 binary variables
    // x_i_j_k = 1 if cell(i,j) has value k, otherwise 0
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        for (let k = 0; k <= 9; k++) {
          const varName = `x_${i}_${j}_${k}`;
          lp.objective.vars.push({
            name: varName,
            coef: 0,
          });
          // mark as a binary variables
          lp.binaries.push(varName);
        }
      }
    }

    /*
      Each GLPK constraint follows this patern:
      { name: string, //id of the constraint
        vars: Array<{name: str, coef: number}, // variables in this constraint
        bnds: { type: GLP_FX | GLP_LO | GLP_UP, lb: number, ub: number} // bounds
      }
    */
    // Cell Constraint
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        let vars = [];
        for (let k = 1; k <= 9; k++) {
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

    // Row constraint
    for (let j = 0; j < 9; j++) {
      // for each row J
      for (let k = 1; k <= 9; k++) {
        // For each value K
        let vars = [];
        for (let i = 0; i < 9; i++) {
          // Sum across all columns i
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
    for (let i = 0; i < 9; i++) {
      // for each row i
      for (let k = 1; k <= 9; k++) {
        // for each value K
        let vars = [];
        for (let j = 0; j < 9; j++) {
          // Sum across all columns j
          vars.push({
            name: `x_${i}_${j}_${k}`,
            coef: 1,
          });
        }
        // Add this constraint object
        const colConstraint = {
          name: `col_${i}_value_${k}`,
          vars: vars,
          bnds: { type: glpk.GLP_FX, ub: 1.0, lb: 1.0 },
        };
        lp.subjectTo.push(colConstraint);
      }
    }

    // Each block constraint
    for (let blockRow = 0; blockRow < 3; blockRow++) {
      for (let blockCol = 0; blockCol < 3; blockCol++) {
        for (let k = 1; k <= 9; k++) {
          let vars = [];

          // iterate through all cells in this 3x3 block
          for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
              // cal board coordinates
              let i = blockRow * 3 + r;
              let j = blockCol * 3 + c;

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

    // respective initial values
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        // check if the cell has an initial value
        if (board[i][j].value !== null) {
          // get the known vlaue for this cell
          const k = board[i][j].value;

          // create a constraint that forces x_i_j_k = 1
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

    lp.objective = {
      direction: glpk.GLP_MAX, // OR GLP_MIN, doesn't matter
      name: 'obj',
      vars: [{ name: `x_0_0_1`, coef: 0 }],
    };

    try {
      const result = await glpk.solve(lp);

      if (result.result.status === glpk.GLP_OPT) {
        console.log('solution found');
        return this.extractSolution(board, result.result.vars, updateUI);
      } else {
        console.error('No solution found, Status', result.result.status);
        return false;
      }
    } catch (error) {
      console.error('Error solving ILP model', error);
      return false;
    }
  }

  extractSolution(board, solution, updateUI) {
    // For each cell, find which variable is set to 1
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        for (let k = 1; k <= 9; k++) {
          const varName = `x_${i}_${j}_${k}`;
          if (solution[varName] === 1) {
            board[i][j].value = k;
            break; // No need to check further values
          }
        }
      }
    }

    // Update the UI
    updateUI([...board]);

    return true;
  }
}
