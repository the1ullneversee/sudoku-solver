import React, { useState, useContext } from "react";
import { GameContext } from "@/Components/GameContext.jsx";

export default function Login() {
    const { userName, setUserName, difficulty, setDifficulty, setToken, setBoardSize } = useContext(GameContext);
    const [localUserName, setLocalUserName] = useState(userName);
    const [localPassword, setLocalPassword] = useState("");
    const [localBoardSize, setLocalBoardSize] = useState(9); // Default to 9x9
    const [localDifficulty, setLocalDifficulty] = useState(difficulty || "Medium"); // Default to Medium

    const handleBoardSizeChange = (e) => {
        const size = parseInt(e.target.value, 10);
        setLocalBoardSize(size);
        setBoardSize(size);
    };

    const handleDifficultyChange = (e) => {
        const selectedDifficulty = e.target.value;
        setLocalDifficulty(selectedDifficulty);
        setDifficulty(selectedDifficulty);
    };

    async function handleLogin(username, password) {
        try {
            const formData = new URLSearchParams();
            formData.append('grant_type', 'password');
            formData.append('username', username);
            formData.append('password', password);

            let response = await fetch('https://king-prawn-app-zg3xi.ondigitalocean.app/auth/login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: formData
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error("Failed to login");
            }

            // The token should be accessed directly from the data object, not using get()
            console.log(data);
            setToken(data.access_token); // Changed from data.get('access_token')
            return true; // Indicate success
        } catch(error) {
            console.error(error);
            throw error; // Re-throw to handle in handleSubmit
        }
    }

    const PresentLogin = () => (
        <div>
            <label className="label">
                <span className="label-text">Username</span>
            </label>
            <input
                type="text"
                className="input input-bordered w-full"
                placeholder="Your username"
                value={localUserName}
                onChange={(e) => setLocalUserName(e.target.value)}
            />
            <label className="label">
                <span className="label-text">Password</span>
            </label>
            <input
                type="text"
                className="input input-bordered w-full"
                placeholder="Your password"
                value={localPassword}
                onChange={(e) => setLocalPassword(e.target.value)}
            />
            <label className="label">
                <span className="label-text">Board Size</span>
            </label>
            <select
                className="select select-bordered w-full"
                value={localBoardSize}
                onChange={handleBoardSizeChange}
            >
                <option value={4}>4x4</option>
                <option value={9}>9x9</option>
                <option value={16}>16x16</option>
                <option value={25}>25x25</option>
            </select>
            <label className="label">
                <span className="label-text">Difficulty</span>
            </label>
            <select
                className="select select-bordered w-full"
                value={localDifficulty}
                onChange={handleDifficultyChange}
            >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
            </select>
            <p className="text-sm text-gray-500 mt-2">
                Note: The generated Sudoku board will be saved to a file for your reference.
            </p>
            <button onClick={handleLogin}>Login</button>
        </div>
    );

    return (
        <div className="max-w-md mx-auto p-6">
            {userName === "" ? (
                <PresentLogin />
            ) : (
                <div className="text-center text-lg font-medium">
                    Hi, {userName}!
                </div>
            )}
        </div>
    );
}
