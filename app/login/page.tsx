"use client";
import {useState, useEffect} from "react";
import {auth} from "../lib/firebase";
import {signInWithEmailAndPassword, onAuthStateChanged, signOut} from "firebase/auth";
import type {User} from "firebase/auth";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [user, setUser] = useState<User|null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { 
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => { // sees if theres changes in authentication
            setUser(currentUser);
            setLoading(false);
        });

        return () => unsubscribe(); 
    }, []);

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        try { 
            await signInWithEmailAndPassword(auth, email, password);
            alert("logged in successfully");
        }
        catch (error) {
            console.error("Login failed:", error);
            alert ("Unable to login. Check email and password and try again.");
        }
    }

    async function handleLogout() { 
        try {
            await signOut(auth);
            alert("Logged out");
        }
        catch (error) {
            console.error("Logout failed:", error);
            alert("Unable to logout. Please try again.");
        }
    }



    return (
        <div className="flex flex-col items-center justify-center">

            <h1 className="text-4xl text-black font-bold mb-4">Login Page</h1>

            {loading ? (
                <p>Loading...</p>
            ) : user ? (
                <div>
                    <h2> logged in as {user.displayName} </h2>
                    <button 
                        type="button"
                        onClick={handleLogout}
                        className="bg-red-500 text-black font-bold px-6 py-3 rounded-lg w-fit mt-4"
                    >
                        LOGOUT
                    </button>
                </div>
            ) : (
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
            )}
        </div>
    );
}
  