import React, { useContext, useEffect, useState } from 'react';
import Cell from './Cell';
import { Play, Pause, Cake, Home, XCircle, Eraser } from "lucide-react";
import { GameContext } from "@/Components/GameContext.jsx";
import { useNavigate } from "react-router-dom";
import { CSPSolver } from "./CSPSolver";
import { ILPSolver } from "./ILPSolver";
import { generateSudoku } from "@/utils/SudokuGenerator";

export default function Board() {
    const { difficulty, userName, boardSize } = useContext(GameContext);
    const [board, setBoard] = useState([]);
    const [timer, setTimer] = useState(0);
    const [elapsedTime, setElapsedTime] = useState('00:00');
    const [isRunning, setIsRunning] = useState(true);
    const [solveStats, setSolveStats] = useState(null);
    const [isSolving, setIsSolving] = useState(false);
    const navigate = useNavigate();
    const [cellRows, setCellRows] = useState([]);
    const [cellCols, setCellCols] = useState([]);
    const [cellBlocks, setCellBlocks] = useState([]);
    const [boardComplete, setBoardComplete] = useState(false);
    const [numbersLeft, setNumbersLeft] = useState({});
    const [numberSelected, setNumberSelected] = useState(new Set());

    const CspSolver = new CSPSolver();
    const IlpSolver = new ILPSolver();

    const handleSolve = async () => {
        setIsSolving(true);
        
        // First validate the board size is a perfect square
        const blockSize = Math.sqrt(boardSize);
        if (!Number.isInteger(blockSize)) {
            setSolveStats({
                method: "ILP Solver",
                elapsedTime: "N/A",
                progress: "Error: Invalid board size",
                status: "Board size must be a perfect square (4, 9, 16, 25, etc.)"
            });
            setIsSolving(false);
            return;
        }

        // For large boards, provide a warning
        if (boardSize > 16) {
            setSolveStats({
                method: "ILP Solver",
                elapsedTime: "Starting...",
                progress: `Warning: Large ${boardSize}x${boardSize} board`,
                status: `Creating model with ${boardSize*boardSize*boardSize} variables - this may take time`
            });
        } else {
            setSolveStats({
                method: "ILP Solver",
                elapsedTime: "Calculating...",
                progress: "Starting...",
                status: "Initializing...",
            });
        }

        // Add a delay to allow UI to update
        await new Promise(resolve => setTimeout(resolve, 100));

        // Setup timeout handler
        const timeoutDuration = 120000; // 2 minutes
        let timeoutId;
        let solverTimedOut = false;
        
        const timeoutPromise = new Promise(resolve => {
            timeoutId = setTimeout(() => {
                solverTimedOut = true;
                resolve(false);
            }, timeoutDuration);
        });

        const startTime = performance.now();
        
        // Create a wrapper for solver with timeout race
        const solverPromise = IlpSolver.solveBoard(
            board,
            setBoard,
            boardSize,
            (progress) => {
                setSolveStats((prevStats) => ({
                    ...prevStats,
                    elapsedTime: `${((performance.now() - startTime) / 1000).toFixed(1)} seconds`,
                    progress: `Iteration: ${progress.iteration}, Objective: ${progress.objective}`,
                    status: `Status: ${progress.status}, Primal Feasible: ${progress.primal_feasible}, Dual Feasible: ${progress.dual_feasible}`,
                }));
            }
        );
        
        // Race between solver and timeout
        const solved = await Promise.race([solverPromise, timeoutPromise]);
        clearTimeout(timeoutId);
        
        const endTime = performance.now();

        setSolveStats((prevStats) => ({
            ...prevStats,
            elapsedTime: `${((endTime - startTime) / 1000).toFixed(2)} seconds`,
            progress: solverTimedOut ? "Timed out after 2 minutes" : 
                     solved ? "Solved successfully!" : "No solution found.",
            status: solverTimedOut ? "Consider using CSP solver for this size" : 
                   solved ? "Optimal solution found." : "Solver terminated.",
        }));
        
        setIsSolving(false);
    };

    const handleSolveCSP = async () => {
        setIsSolving(true);
        let statesChecked = 0;

        setSolveStats({
            method: "CSP Solver",
            elapsedTime: "Calculating...",
            statesChecked: "0 states",
            searchSpace: "Calculating...",
        });

        const startTime = performance.now();
        const updateStats = () => {
            setSolveStats((prevStats) => ({
                ...prevStats,
                statesChecked: `${statesChecked} states`,
            }));
        };

        const { statesChecked: finalStatesChecked, searchSpace } = await CspSolver.solveBoard(
            board,
            setBoard,
            boardSize,
            () => {
                statesChecked++;
                if (statesChecked % 100 === 0) updateStats();
            }
        );
        const endTime = performance.now();

        setSolveStats({
            method: "CSP Solver",
            elapsedTime: `${((endTime - startTime) / 1000).toFixed(2)} seconds`,
            statesChecked: `${finalStatesChecked} states`,
            searchSpace: `${searchSpace} possibilities`,
        });
        setIsSolving(false);
        Object.keys(numbersLeft).forEach(key => numbersLeft[key] = 0);
    };

    const toggleSelect = (num) => {
        if (numberSelected !== num) {
            setNumberSelected(num);
        } else {
            setNumberSelected(null);
        }
    };

    const handleSaveBoard = () => {
        try {
            const generatedPuzzle = generateSudoku(boardSize, difficulty);
            console.log('Sudoku board saved successfully.');
        } catch (error) {
            console.error('Error saving Sudoku board:', error);
        }
    };

    class BoardCell {
        constructor(value, rowIndex, colIndex) {
            this.value = value === 0 ? null : value;
            this.isPreset = this.value !== null;
            this.cellColour = this.isPreset ? '#f3f4f6' : '#ffffff';
            this.colIndex = colIndex;
            this.rowIndex = rowIndex;
            this.isValid = true;
            this.errors = [];
            this.isLocked = this.isPreset;
        }

        setValue(newValue) {
            this.value = newValue;
        }
    }

    function buildBoard() {
        const blockSize = Math.sqrt(boardSize);
        if (!Number.isInteger(blockSize)) {
            throw new Error("Invalid board size. Board size must be a perfect square.");
        }

        const generatedPuzzle = generateSudoku(boardSize, difficulty);
        let board = [];
        let cellRows = [];
        let cellCols = [];
        let cellBlocks = [];
        let numbers = Object.fromEntries([...Array(boardSize)].map((_, i) => [i + 1, boardSize]));

        for (let i = 0; i < boardSize; i++) {
            board[i] = [];
            for (let j = 0; j < boardSize; j++) {
                if (cellRows[i] === undefined) {
                    cellRows[i] = [];
                }
                if (cellCols[j] === undefined) {
                    cellCols[j] = [];
                }
                board[i][j] = new BoardCell(generatedPuzzle[i][j], i, j);
                cellRows[i].push(board[i][j]);
                cellCols[j].push(board[i][j]);

                if (board[i][j].value !== null) {
                    numbers[board[i][j].value] -= 1;
                }

                const blockIndex = Math.floor(i / blockSize) * blockSize + Math.floor(j / blockSize);
                if (cellBlocks[blockIndex] === undefined) {
                    cellBlocks[blockIndex] = [];
                }
                cellBlocks[blockIndex].push(board[i][j].value);
            }
        }
        setCellRows(cellRows);
        setCellCols(cellCols);
        setCellBlocks(cellBlocks);
        setBoard(board);
        setNumbersLeft(numbers);
    }

    const formatTime = (seconds) => {
        const date = new Date(seconds * 1000).toISOString().substring(14, 19);
        return date;
    };

    const setRunning = () => {
        setIsRunning(!isRunning);
    };

    useEffect(() => {
        let intervalId;

        if (isRunning) {
            intervalId = setInterval(() => {
                setTimer(prevTimer => {
                    const newTime = prevTimer + 1;
                    setElapsedTime(formatTime(newTime));
                    return newTime;
                });
            }, 1000);
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [isRunning]);

    useEffect(() => {
        buildBoard();
    }, [boardSize]);

    const getCellBorderClasses = (rowIndex, colIndex) => {
        const blockSize = Math.sqrt(boardSize);
        let classes = "border border-base-300 "; // Default border for all cells
    
        // Add thicker borders between blocks
        if ((rowIndex + 1) % blockSize === 0 && rowIndex < boardSize - 1) {
            classes += "border-b-2 border-b-base-content/30 ";
        }
        if ((colIndex + 1) % blockSize === 0 && colIndex < boardSize - 1) {
            classes += "border-r-2 border-r-base-content/30 ";
        }
    
        return classes;
    };

    return (
        <div className="min-h-screen min-w-screen flex items-center justify-center bg-base-200 p-4">
            <div className="card bg-base-100 shadow-xl w-full max-w-2xl">
                <div className="card-body p-0">
                    <div className="border-b border-base-300 p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => navigate('/')}
                                    className="btn btn-ghost btn-sm"
                                >
                                    <Home className="w-4 h-4" />
                                </button>
                                <h3 className="text-lg font-semibold">
                                    Sudoku <span className="text-primary">{difficulty}</span>
                                </h3>
                            </div>
                            <div className="flex items-center gap-2 bg-base-200 rounded-lg px-3 py-1">
                                <button
                                    onClick={setRunning}
                                    className="btn btn-ghost btn-sm btn-square"
                                >
                                    {isRunning ? (
                                        <Pause className="w-4 h-4" />
                                    ) : (
                                        <Play className="w-4 h-4" />
                                    )}
                                </button>
                                <span className="font-mono text-sm">{elapsedTime}</span>
                            </div>
                        </div>
                    </div>
                    <div className="p-4">
                        <div className="overflow-x-auto">
                            <table className="w-full h-full min-h-[400px] min-w-[300px] border-collapse bg-base-100">
                                <tbody>
                                    {board?.map((row, rowIndex) => (
                                        <tr key={rowIndex}>
                                            {row.map((cellValue, colIndex) => {
                                                const cell = board[rowIndex][colIndex];
                                                return (
                                                    <td key={`${rowIndex}-${colIndex}`}
                                                        className={`p-0 relative ${getCellBorderClasses(rowIndex, colIndex)}`}
                                                        style={{
                                                            aspectRatio: '1/1',
                                                            width: `${100 / boardSize}%`
                                                        }}
                                                    >
                                                        <button
                                                            value={cell}
                                                            className={`w-full h-full text-center focus:outline-none ${cell.isLocked ? 'font-bold' : 'font-light'}`}
                                                            onClick={() => {}}
                                                            disabled={cell.isLocked}
                                                        >
                                                            {cell.value}
                                                        </button>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="flex justify-center gap-4 mt-4">
                        <button
                            onClick={handleSolve}
                            className={`btn btn-primary ${isSolving ? 'btn-disabled' : ''}`}
                            disabled={isSolving}
                        >
                            Solve with ILP
                        </button>
                        <button
                            onClick={handleSolveCSP}
                            className={`btn btn-secondary ${isSolving ? 'btn-disabled' : ''}`}
                            disabled={isSolving}
                        >
                            Solve with CSP
                        </button>
                    </div>
                    {solveStats && (
                        <div className="mt-4 p-4 bg-gray-100 rounded-lg shadow">
                            <h4 className="text-lg font-semibold">Solve Stats</h4>
                            <p><strong>Method:</strong> {solveStats.method}</p>
                            <p><strong>Elapsed Time:</strong> {solveStats.elapsedTime}</p>
                            {solveStats.statesChecked && (
                                <p><strong>States Checked:</strong> {solveStats.statesChecked}</p>
                            )}
                            <p><strong>Search Space:</strong> {solveStats.searchSpace}</p>
                            {solveStats.progress && (
                                <p><strong>Progress:</strong> {solveStats.progress}</p>
                            )}
                            {solveStats.status && (
                                <p><strong>Status:</strong> {solveStats.status}</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}