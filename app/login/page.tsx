"use client";
import { useState } from "react";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        console.log("Email:", email);
    }

    return (
        <div className="flex flex-col items-center justify-center">

            <h1 className="text-4xl text-black font-bold mb-4">Login Page</h1>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input 
                    type="email"
                    placeholder="Enter your email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Enter your password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button type="submit" className="bg-blue-500 text-black font-bold px-6 py-3 rounded-lg w-fit mt-4">
                    LOGIN
                </button>
            </form>
        </div>
    );
}