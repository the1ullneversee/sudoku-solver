import React, {useState, useContext, useEffect} from "react";
import {Link, Links} from "react-router-dom";
import {Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter} from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {Label} from "@radix-ui/react-label";
import { Input } from "@/components/ui/input"
import {Button} from "@/components/ui/button"
import {GameContext} from "@/Components/GameContext.jsx";
import Logo from "@/assets/Logo.svg";
import { useNavigate } from 'react-router-dom';



export default function GameProfile() {
    const {userName, setUserName, difficulty, setDifficulty} = useContext(GameContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (difficulty === null){
            setDifficulty("Easy 🌱")
        }
    }, [])

    return (
        <div className="flex min-h-screen items-center justify-center">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="text-center space-y-4 pb-2">
                    <div className="mx-auto w-32 h-32">
                        <img
                            src={Logo}
                            className="w-full h-full object-contain"
                            alt="Sudoku logo"
                        />
                    </div>
                    <CardTitle className="text-2xl font-bold">Sudoku</CardTitle>
                    <CardDescription className="text-sm text-gray-500">
                        Start a new game or continue where you left off
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form>
                        <div className="grid w-full items-center gap-4">
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="userName">Username</Label>
                                <Input id="userName" placeholder="Your username" value={userName}
                                       onChange={(e) => setUserName(e.target.value)}/>
                            </div>
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="difficulty">Difficulty</Label>
                                <Select value={difficulty} onValueChange={setDifficulty}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Easy 🌱"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Easy 🌱">🌱 Easy</SelectItem>
                                        <SelectItem value="Medium 🌟">🌟 Medium</SelectItem>
                                        <SelectItem value="Hard 🔥">🔥 Hard</SelectItem>
                                        <SelectItem value="Expert 👑">👑 Expert</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button
                        onClick={() => navigate('/board', {
                            state: {difficulty: difficulty}
                        })}
                    >
                        Start {difficulty} Game
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}