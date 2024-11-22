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
import { Play, Pause } from "lucide-react";
import {GameContext} from "@/Components/GameContext.jsx";
import {useNavigate} from "react-router-dom";

export default function Board() {
    const {difficulty} = useContext(GameContext);
    const [board, setBoard] = useState([]);
    const [timer, setTimer] = useState(0);
    const [elapsedTime, setElapsedTime] = useState('00:00');
    const [isRunning, setIsRunning] = useState(true); // Add this to control timer
    const navigate = useNavigate();

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

    function buildBoard() {
        let board = []
        console.log(board);
        //builds a 9x9 grid of cells
        for (let i = 0; i < 9; i++){
            board[i] = []
            for (let j = 0; j < 9; j++){
                board[i][j] = samplePuzzle[i][j]
            }
        }
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



    return (
        <div className="App">
            <Card>
                <CardHeader className="space-y-1">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Sudoku {difficulty}</h3>
                        <span><Button onClick={() => {navigate('/')}}>Home</Button></span>
                        <Badge color="white">
                            <Button
                               //variant="ghost"
                                //size="icon"
                                //className="h-6 w-6 p-0 hover:bg-transparent"
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
                    <Table>
                        <TableBody>
                            {board?.map((row, rowIndex) => (
                                <TableRow key={rowIndex}>
                                    {row.map((cellValue, colIndex) => (
                                        <TableCell key={`${rowIndex}-${colIndex}`}>
                                            <Cell
                                                value={cellValue}
                                                row={rowIndex}
                                                col={colIndex}
                                            />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}