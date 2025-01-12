import React, {useContext, useEffect, useState} from 'react';
import Cell from './Cell';
import {Play, Pause, Cake, Home, XCircle, Eraser } from "lucide-react";
import {GameContext} from "@/Components/GameContext.jsx";
import {useNavigate} from "react-router-dom";
import {Solver} from "./Solver";

export default function Board() {
    const {difficulty, userName} = useContext(GameContext);
    const [board, setBoard] = useState([]);
    const [timer, setTimer] = useState(0);
    const [elapsedTime, setElapsedTime] = useState('00:00');
    const [isRunning, setIsRunning] = useState(true); // Add this to control timer
    const navigate = useNavigate();
    const [cellRows, setCellRows] = useState([]);
    const [cellCols, setCellCols] = useState([]);
    const [cellBlocks, setCellBlocks] = useState([]);
    const [boardComplete, setBoardComplete] = useState(false);
    const [numbersLeft, setNumbersLeft] = useState({});
    const [numberSelected, setNumberSelected] = useState(new Set());

    const solver = new Solver();

    const handleSolve = async () => {
        const solved = await solver.solveBoard(board, setBoard);
        Object.keys(numbersLeft).forEach(key => numbersLeft[key] = 0);
    }

    const [invalidCellsPresent, setInvalidCellsPresent] = useState(false);
    const [isErasing, setIsErasing] = useState(false);
    const toggleSelect = (num) => {
        if (numberSelected !== num) {
            setNumberSelected(num);
        } else {
            setNumberSelected(null);
        }
        console.log(`number selected is ${num}`)
    };

    const samplePuzzle = [
        [5, 3, 0, 0, 7, 0, 0, 0, 0],
        [6, 0, 0, 1, 9, 5, 0, 0, 0],
        [0, 9, 8, 0, 0, 0, 0, 6, 0],
        [8, 0, 0, 0, 6, 0, 0, 0, 3],
        [4, 0, 0, 8, 0, 3, 0, 0, 1],
        [7, 0, 0, 0, 2, 0, 0, 0, 6],
        [0, 6, 0, 0, 0, 0, 2, 8, 0],
        [0, 0, 0, 4, 1, 9, 0, 0, 5],
        [0, 0, 0, 0, 8, 0, 0, 7, 9]
    ];

    class BoardCell {
        constructor(value, rowIndex, colIndex) {
            console.log(`Setting row ${rowIndex} ${colIndex} with value ${value}`);
            this.value = value === 0 ? null : value;
            let isLocked = this.value !== null;
            this.isPreset = isLocked;
            this.cellColour = isLocked ?  '#f3f4f6': '#ffffff'
            this.colIndex = colIndex;
            this.rowIndex = rowIndex;
            this.isValid = true;
            this.errors = []
            this.isLocked = isLocked;
        }

        setValue(newValue) {
            this.value = newValue;
        }
    }

    function buildBoard() {
        let board = []
        let cellRows = [];
        let cellCols = [];
        let cellBlocks = [];
        let numbers = Object.fromEntries([...Array(9)].map((_, i) => [i + 1, 9]))
        for (let i = 0; i < 9; i++)
        {
            board[i] = []
            for (let j = 0; j < 9; j++) {
                if (cellRows[i] === undefined){
                    cellRows[i] = [];
                }
                if (cellCols[j] === undefined){
                    cellCols[j] = [];
                }
                board[i][j] = new BoardCell(samplePuzzle[i][j], i, j);
                cellRows[i].push(board[i][j]);
                cellCols[j].push(board[i][j]);

                if (board[i][j].value !== null) {
                    numbers[board[i][j].value] -= 1;
                }
                // cell blocks will be each element within i + 3, j+3 where i and j are modulus 3 ==0
                const blockIndex = Math.floor(i/3) * 3 + Math.floor(j/3);
                if (cellBlocks[blockIndex] === undefined){
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
        console.log(board);
    }

    const formatTime = (seconds) => {
        const date = new Date(seconds * 1000).toISOString().substring(14, 19);
        return date;
    };

    const setRunning = () => {
        setIsRunning(!isRunning);
    }

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
        }
    }, [isRunning]);

    useEffect(() => {
        buildBoard();
        //setTimer(0);
    }, []);

    function validateBoard() {
        let isBoardComplete = true;
        setBoardComplete(isBoardComplete);
        console.log(cellRows);
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (board[i][j].value === null) {
                    isBoardComplete = false;
                    setBoardComplete(isBoardComplete);
                    return;
                }
            }
        }
        const size = 9;
        let boardValid = true;

        // Helper function to mark cell as invalid and update board
        const markCellInvalid = (row, col) => {
            board[row][col].isValid = false;
            setBoard([...board]);
        };

        // Helper function to validate a sequence (row or column)
        const validateSequence = (cells, type) => {
            const values = [];

            for (let i = 0; i < size; i++) {
                const currentCell = cells[i];

                if (!currentCell.value) continue; // Skip empty cells

                if (values.some(cell => cell.value === currentCell.value)) {
                    if (currentCell.isPreset) {
                        // Find and mark all duplicate preset cells as invalid
                        const duplicates = values.filter(cell => cell.value === currentCell.value);
                        duplicates.forEach(dup => {
                            markCellInvalid(dup.rowIndex, dup.colIndex);
                            setInvalidCellsPresent(true);
                            boardValid = false;
                        });
                    } else {
                        // Mark the current non-preset duplicate as invalid
                        const [row, col] = type === 'row' ?
                            [cells[0].rowIndex, i] :
                            [i, cells[0].colIndex];
                        markCellInvalid(row, col);
                        boardValid = false;
                        setInvalidCellsPresent(true);
                        return false; // Exit early for non-preset duplicates
                    }
                }

                values.push(currentCell);
            }
            return true;
        };

        // Validate all rows and columns
        for (let i = 0; i < size; i++) {
            const rowCells = board[i];
            const colCells = board.map(row => row[i]);

            if (!validateSequence(rowCells, 'row')) return false;
            if (!validateSequence(colCells, 'column')) return false;
        }

        return boardValid;
    }

    function verifyCellValue(value) {
        if (value > 0 && value < 10) {
            console.log("Valid cell content");
            return true;
        }
        console.log("Invalid cell content");
        return false;
    }

    function eraseBoardValue(rowIndex, colIndex) {
        const newCells = board.map(row => [...row])
        let previousCell = newCells[rowIndex][colIndex];
        previousCell.isValid = true;
        numbersLeft[previousCell.value] += 1;
        previousCell.setValue(null);
        newCells[rowIndex][colIndex] = previousCell
        cellRows[rowIndex][colIndex] = previousCell
        cellCols[colIndex][rowIndex] = previousCell
        const blockIndex = Math.floor(rowIndex/3) * 3 + Math.floor(colIndex/3);
        cellBlocks[blockIndex] = newCells;
        setBoard(newCells);
        setCellCols(cellCols);
        setCellRows(cellRows);
        validateBoard();
    }

    function setBoardWithValue(rowIndex, colIndex, newValue) {
        const newCells = board.map(row => [...row])
        let newCellValue = newValue === '' ? null : newValue;
        newCells[rowIndex][colIndex].setValue(newCellValue);
        cellRows[rowIndex][colIndex].setValue(newCellValue);
        cellCols[colIndex][rowIndex].setValue(newCellValue);
        const blockIndex = Math.floor(rowIndex/3) * 3 + Math.floor(colIndex/3);
        cellBlocks[blockIndex] = newCells;
        setBoard(newCells);
        setCellCols(cellCols);
        setCellRows(cellRows);
        numbersLeft[newCellValue] -= 1;
        setNumbersLeft(numbersLeft);
        if (numbersLeft[newValue] === 0) {
            setNumberSelected( null);
        }
        validateBoard();
    }

    const handleCellChange = (rowIndex, colIndex, currentValue) => {
        if (isErasing && currentValue) {
            console.log(`erasing cell [${rowIndex}][${colIndex}]`);
            eraseBoardValue(rowIndex, colIndex);
            return;
        }
        console.log(`raw value from cell ${rowIndex}: ${currentValue}`);
        let selectedNumber = parseInt(numberSelected);
        if (selectedNumber === currentValue) {
            return;
        }
        console.log(`Setting cell from cell change of ${rowIndex} ${colIndex} with value ${selectedNumber}`);
        if (verifyCellValue(selectedNumber)) {
            setBoardWithValue(rowIndex, colIndex, selectedNumber);
        }
    }
    // Helper function to determine cell border classes
    const getCellBorderClasses = (rowIndex, colIndex) => {
        let classes = "border border-base-300 ";

        if ((rowIndex + 1) % 3 === 0 && rowIndex < 8) {
            classes += "border-b-2 border-b-base-content/30 ";
        }

        if ((colIndex + 1) % 3 === 0 && colIndex < 8) {
            classes += "border-r-2 border-r-base-content/30 ";
        }

        return classes;
    };


    return (
        <div className="min-h-screen min-w-screen flex items-center justify-center bg-base-200 p-4">
            <div className="card bg-base-100 shadow-xl w-full max-w-2xl">
                {/* Header Section */}
                <div className="card-body p-0">
                    <div className="border-b border-base-300 p-4">
                        <div className="flex items-center justify-between">
                            {/* Game Title and Difficulty */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => navigate('/')}
                                    className="btn btn-ghost btn-sm"
                                >
                                    <Home className="w-4 h-4"/>
                                </button>
                                <h3 className="text-lg font-semibold">
                                    Sudoku <span className="text-primary">{difficulty}</span>
                                </h3>
                            </div>

                            {/* Timer Controls */}
                            <div className="flex items-center gap-2 bg-base-200 rounded-lg px-3 py-1">
                                <button
                                    onClick={setRunning}
                                    className="btn btn-ghost btn-sm btn-square"
                                >
                                    {isRunning ? (
                                        <Pause className="w-4 h-4"/>
                                    ) : (
                                        <Play className="w-4 h-4"/>
                                    )}
                                </button>
                                <span className="font-mono text-sm">{elapsedTime}</span>
                            </div>
                        </div>
                    </div>

                    {/* Game Board Section */}
                    {/*${cell.value && cell.isValid ? 'bg-green-200' : ''}*/}
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
                                                        width: '10%'
                                                    }}
                                                >

                                                    <button
                                                        value={cell}
                                                        className={`
                                                                w-full h-full text-center focus:outline-none 
                                                                
                                                                ${cell.value && !cell.isValid ? 'bg-red-200' : ''}
                                                                ${cell.isLocked ? 'font-bold' : 'font-light'}
                                                                ${cell.isLocked ? 'text-gray-600' : 'text-gray-500'}
                                                            `}
                                                        onClick={(e) => handleCellChange(rowIndex, colIndex, cell.value)}
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

                    {/* Footer Section - Completion Message */}
                    <div className="min-h-[60px] flex justify-center">
                        <div>
                            {Object.entries(numbersLeft).map(([key, value]) => (
                                key !== null && (
                                    <div className="indicator p-1">
                                        <span
                                            className="indicator-item indicator-top indicator-center badge badge-primary">{value}</span>
                                        <button key={key}
                                                className={`btn btn-outline btn-secondary ${numberSelected === key ? 'btn-active' : ''}`}
                                                disabled={value === 0} onClick={() => toggleSelect(key)}>{key}</button>
                                    </div>
                                )
                            ))}
                        </div>
                        <div>
                            <button onClick={handleSolve}> Solve! </button>
                        </div>
                        <button
                            className={`btn ${isErasing ? 'btn-active' : ''}`}
                            onClick={() => setIsErasing(!isErasing)}
                        >
                            Button
                            <Eraser className="h-6 w-6"/>
                        </button>
                    </div>
                    <div className="min-h-[60px] flex justify-center">
                        {boardComplete && (
                            <div className="flex flex-col items-center gap-2">
                                {!invalidCellsPresent ? (
                                    <div className="flex flex-col items-center gap-2 text-success">
                                        <Cake className="w-6 h-6"/>
                                        <p className="text-center font-medium">
                                            Congratulations {userName}! You solved it in {elapsedTime}! 🎉
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-destructive">
                                        <XCircle className="w-6 h-6"/>
                                        <p className="text-center font-medium">
                                            Board complete but contains errors. Check highlighted cells.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}