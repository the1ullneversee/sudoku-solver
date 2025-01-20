import React, {useState, useContext, useEffect} from "react";
import {useNavigate} from 'react-router-dom';
import {GameContext} from "@/Components/GameContext.jsx";
import Logo from "@/assets/Logo.svg";

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

    const handleSubmit = async(e) => {
        e.preventDefault(); // Prevent form submission
        e.stopPropagation(); // Also stop event propagation

        try {
            await handleLogin(localUserName, localPassword);
            setUserName(localUserName);
            navigate('/board', {
                state: { difficulty: difficulty }
            });
        } catch(error) {
            console.error('Login failed:', error);
            // Handle login failure (maybe set an error state to show to user)
            alert(error.message);
        }
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
                        {userName === "" ? (
                            <div className="form-control w-full">
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
                                    placeholder="Your username"
                                    value={localPassword}
                                    onChange={(e) => setLocalPassword(e.target.value)}
                                />
                                <button>Login</button>
                            </div>
                        ) : (
                            <div className="text-center text-lg font-medium">
                                Hi, {userName}!
                            </div>
                        )}

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