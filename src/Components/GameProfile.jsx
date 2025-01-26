import React, {useState, useContext, useEffect} from "react";
import {useNavigate} from 'react-router-dom';
import {GameContext} from "@/Components/GameContext.jsx";
import Logo from "@/assets/Logo.svg";
import Login from "./Login.tsx";

export default function GameProfile() {
    const {userName, setUserName, difficulty, setDifficulty, setToken} = useContext(GameContext);
    const [localUserName, setLocalUserName] = useState(userName);
    const [localPassword, setLocalPassword] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        if (difficulty === null) {
            setDifficulty("Easy 🌱")
        }
    }, [])



    const handleSubmit = async(e) => {
        e.preventDefault(); // Prevent form submission
        e.stopPropagation(); // Also stop event propagation
        navigate('/board', {
            state: { difficulty: difficulty }
        });
    };

    return (
        // Using DaisyUI's container class for proper centering
        <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
            <div className="card w-96 bg-base-100 shadow-xl">
                <div className="card-body">
                    {/* Logo Section */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-32 h-32">
                            <img
                                src={Logo}
                                className="w-full h-full object-contain"
                                alt="Sudoku logo"
                            />
                        </div>
                        <h2 className="card-title text-2xl font-bold">Sudoku</h2>
                        <p className="text-sm text-base-content/70">
                            Start a new game or continue where you left off
                        </p>
                    </div>

                    {/* Form Section */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Login />
                        <{userName === "" ? (

                        ) : (
                            <div className="text-center text-lg font-medium">
                                Hi, {userName}!
                            </div>
                        )}>

                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text">Difficulty</span>
                            </label>
                            <select
                                className="select select-bordered w-full"
                                value={difficulty}
                                onChange={(e) => setDifficulty(e.target.value)}
                            >
                                <option value="Easy 🌱">🌱 Easy</option>
                                <option value="Medium 🌟">🌟 Medium</option>
                                <option value="Hard 🔥">🔥 Hard</option>
                                <option value="Expert 👑">👑 Expert</option>
                            </select>
                        </div>
                        <button
                            type="submit"
                            className="btn btn-primary w-full"
                        >
                            Start {difficulty} Game
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}