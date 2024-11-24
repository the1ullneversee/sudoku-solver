import React, {useContext, useEffect, useState} from 'react';
import Cell from './Cell';
import {
    Table,
    TableBody,
    TableCell,
    TableRow
} from "@/components/ui/table"
import {Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {Button} from "@/Components/ui/button"
import {Play, Pause, Cake} from "lucide-react";
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
        let classes = "border border-slate-200 ";

        // Add thicker bottom border for every 3rd row
        if ((rowIndex + 1) % 3 === 0 && rowIndex < 8) {
            classes += "border-b-2 border-b-slate-400 ";
        }

        // Add thicker right border for every 3rd column
        if ((colIndex + 1) % 3 === 0 && colIndex < 8) {
            classes += "border-r-2 border-r-slate-400 ";
        }

        return classes;
    };


    return (
        <div className="App">
            <Card>
                <CardHeader className="space-y-1">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Sudoku {difficulty}</h3>
                        <span><Button onClick={() => {navigate('/')}}>Home</Button></span>
                        <Badge color="white">
                            <Button
                               variant="ghost"
                                size="icon"
                                className="h-6 w-6 p-0 hover:bg-transparent"
                                onClick={setRunning}
                            >
                                {isRunning ? (
                                    <Pause className="" />
                                ) : (
                                    <Play className="" />
                                )}
                            </Button>
                            <span className="font-mono text-sm">{elapsedTime}</span>
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table className="border-2 border-slate-100">
                        <TableBody>
                            {board?.map((row, rowIndex) => (
                                <TableRow key={rowIndex} className="border-slate-200">
                                    {row.map((cellValue, colIndex) => (
                                        <TableCell key={`${rowIndex}-${colIndex}`} className={`p-0 ${getCellBorderClasses(rowIndex, colIndex)}`}>
                                            <Cell
                                                cell={board[rowIndex][colIndex]}
                                                onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                                            />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
                <CardFooter>
                    <div className="min-h-[60px]">
                        {boardComplete ? (
                            <div className="flex flex-col items-center gap-2">
                                <Cake />
                                <div>
                                    Congratulations, you solved it in {elapsedTime}!
                                </div>
                            </div>
                        ) : null}
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}