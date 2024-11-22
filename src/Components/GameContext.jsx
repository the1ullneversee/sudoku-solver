import React, {createContext, useState} from "react";

export const GameContext = createContext();

export const GameContextProvider = ({children}) => {
    const [userName, setUserName] = useState("");
    const [gameHistory, setGameHistory] = useState("");
    const [difficulty, setDifficulty] = useState("");

    return (
        <GameContext.Provider value={{
            userName,
            setUserName,
            gameHistory,
            setGameHistory,
            difficulty,
            setDifficulty,
        }}>
            {children}
        </GameContext.Provider>
    );
}