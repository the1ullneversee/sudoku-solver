import React, {useState, useContext} from "react";
import {GameContext} from "@/Components/GameContext.jsx";
export default function Login() {

    const {userName, setUserName, difficulty, setDifficulty, setToken} = useContext(GameContext);
    const [localUserName, setLocalUserName] = useState(userName);
    const [localPassword, setLocalPassword] = useState("");

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
                placeholder="Your username"
                value={localPassword}
                onChange={(e) => setLocalPassword(e.target.value)}
            />
            <button onClick={handleLogin}>Login</button>`
        </div>
    );

    return (
        <div className="max-w-md mx-auto p-6">
            {userName === "" ? (
                <PresentLogin/>
            ) : (
                <div className="text-center text-lg font-medium">
                    Hi, {userName}!
                </div>
            )}
        </div>
    )
}
