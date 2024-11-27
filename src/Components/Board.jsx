import React, {useContext, useEffect, useState} from 'react';
import Cell from './Cell';
import {Play, Pause, Cake, Home} from "lucide-react";
import {GameContext} from "@/Components/GameContext.jsx";
import {useNavigate} from "react-router-dom";

export default function Board() {
    const {difficulty} = useContext(GameContext);
    const [board, setBoard] = useState([]);
    const [timer, setTimer] = useState(0);
    const [elapsedTime, setElapsedTime] = useState('00:00');
    const [isRunning, setIsRunning] = useState(true); // Add this to control timer
    const navigate = useNavigate();
    const [cellRows, setCellRows] = useState([]);
    const [cellCols, setCellCols] = useState([]);
    const [cellBlocks, setCellBlocks] = useState([]);
    const [boardComplete, setBoardComplete] = useState(false);
    // const samplePuzzle = [
    //     [5, 3, 0, 0, 7, 0, 0, 0, 0],
    //     [6, 0, 0, 1, 9, 5, 0, 0, 0],
    //     [0, 9, 8, 0, 0, 0, 0, 6, 0],
    //     [8, 0, 0, 0, 6, 0, 0, 0, 3],
    //     [4, 0, 0, 8, 0, 3, 0, 0, 1],
    //     [7, 0, 0, 0, 2, 0, 0, 0, 6],
    //     [0, 6, 0, 0, 0, 0, 2, 8, 0],
    //     [0, 0, 0, 4, 1, 9, 0, 0, 5],
    //     [0, 0, 0, 0, 8, 0, 0, 7, 9]
    // ];

    const samplePuzzle = [
        [5, 0, 4, 6, 7, 8, 9, 1, 2],
        [6, 7, 2, 1, 9, 5, 3, 4, 8],
        [0, 9, 8, 3, 4, 2, 5, 6, 7],
        [0, 5, 9, 7, 6, 1, 4, 2, 3],
        [4, 2, 6, 8, 5, 3, 7, 9, 1],
        [7, 1, 3, 9, 2, 4, 8, 5, 6],
        [9, 6, 1, 5, 3, 7, 2, 8, 4],
        [2, 8, 7, 4, 1, 9, 6, 3, 5],
        [3, 4, 5, 2, 8, 6, 1, 7, 9]
    ];
    class BoardCell {
        constructor(value, rowIndex, colIndex) {
            console.log(`Setting row ${rowIndex} ${colIndex} with value ${value}`);
            this.value = value === 0 ? null : value;
            let isLocked = this.value !== null;
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
                cellRows[i].push(board[i][j].value);
                cellCols[j].push(board[i][j].value);
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
        console.log(cellRows);
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (board[i][j].value === null) {
                    isBoardComplete = false;
                    return;
                }
            }
        }

        let boardValid = true;
        // go over each row


        for (let r = 0; r < 9; r++) {
            // each index in the row
            let rowValues = []
            let colValues = []
            for (let i = 0; i < 9; i++) {
                console.log(`cell row [${r},${i}] ${cellRows[r][i]}`);
                if (rowValues.includes(cellRows[r][i])) {
                    console.log(`cell row [${r},${i}] ${cellRows[r][i]} is invalid in ${cellRows[r]}`)
                    boardValid = false;
                    return;
                }
                rowValues.push(cellRows[r][i])
            }
            // each index in the column
            for (let j = 0; j < 9; j++) {
                console.log(`cell column [${j},${r}] ${cellCols[j][r]}`);
                if (colValues.includes(cellCols[j][r])) {
                    console.log(`Current col values ${colValues}`)
                    console.log(`cell col [${j},${r}] ${cellCols[j][r]} is invalid in ${cellCols[r]}`)
                    boardValid = false;
                    return;
                }
                colValues.push(cellCols[j][r]);
            }
        }
        console.log(`Board complete? ${isBoardComplete}`);
        setBoardComplete(isBoardComplete);
        setIsRunning(false);

    }

    function verifyCellValue(value) {
        if (value > 0 && value < 10) {
            console.log("Valid cell content");
            return true;
        }
        console.log("Invalid cell content");
        return false;
    }

    const handleCellChange = (rowIndex, colIndex, newValue) => {
        console.log(`Setting cell from cell change of ${rowIndex} ${colIndex} with value ${newValue}`);
        if (verifyCellValue(newValue)) {
            const newCells = board.map(row => [...row])
            newCells[rowIndex][colIndex].setValue(newValue);
            cellRows[rowIndex][colIndex] = newValue;
            cellCols[colIndex][rowIndex] = newValue;
            const blockIndex = Math.floor(rowIndex/3) * 3 + Math.floor(colIndex/3);
            cellBlocks[blockIndex] = newCells;
            setBoard(newCells);
            setCellCols(cellCols);
            setCellRows(cellRows);

            validateBoard();
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
        <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
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
                                    <Home className="w-4 h-4" />
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
                                        <Pause className="w-4 h-4" />
                                    ) : (
                                        <Play className="w-4 h-4" />
                                    )}
                                </button>
                                <span className="font-mono text-sm">{elapsedTime}</span>
                            </div>
                        </div>
                    </div>

                    {/* Game Board Section */}
                    <div className="p-4">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse bg-base-100">
                                <tbody>
                                {board?.map((row, rowIndex) => (
                                    <tr key={rowIndex}>
                                        {row.map((cellValue, colIndex) => (
                                            <td
                                                key={`${rowIndex}-${colIndex}`}
                                                className={`p-0 relative ${getCellBorderClasses(rowIndex, colIndex)}`}
                                                style={{
                                                    aspectRatio: '1/1',
                                                    width: '11.11%' // 100% / 9 cells
                                                }}
                                            >
                                                <Cell
                                                    cell={board[rowIndex][colIndex]}
                                                    onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Footer Section - Completion Message */}
                    <div className="border-t border-base-300 p-4">
                        <div className="min-h-[60px] flex justify-center">
                            {boardComplete && (
                                <div className="flex flex-col items-center gap-2 text-success">
                                    <Cake className="w-6 h-6" />
                                    <p className="text-center font-medium">
                                        Congratulations! You solved it in {elapsedTime}! 🎉
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}