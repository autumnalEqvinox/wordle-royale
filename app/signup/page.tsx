"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {createUserWithEmailAndPassword, updateProfile} from "firebase/auth"; 
import {auth, db} from "../lib/firebase";
import {doc, setDoc} from "firebase/firestore";

export default function Signup() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const router = useRouter();

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault(); // Prevent the default form submission behavior

        if (password !== confirmPassword) {
            alert("Passwords don't match");
            return;
        }

        if (password.length < 6) {
            alert("Passwords must be at least 6 characters.");
            return;
        }

        try { 
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCredential.user, {displayName: username});
            await setDoc(doc(db, "users", userCredential.user.uid), { // create firestore document, doc() determiens which doc to access, db is firestore database
                username: username,
                email: email,
            });
            alert("created account");
            router.push("/login");
        } 
        catch (error) {
        console.error("Signup failed:", error);
        alert("Cannot create account. Check information and try again.");
        }
    }

    return (
        <div className="flex flex-col items-center justify-center">
            <h1 className="text-4xl text-black font-bold mb-4">Sign Up Page</h1>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input 
                    type="text"
                    placeholder="Enter your username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
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

                <input
                    type="password"
                    placeholder="Confirm password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />

                <button type="submit" className="bg-blue-500 text-black font-bold px-6 py-3 rounded-lg w-fit mt-4"
                >
                    SIGN UP
                </button>

                <button type="button" className="bg-blue-500 text-black font-bold px-6 py-3 rounded-lg w-fit mt-4">
                    CONTINUE W/ GOOGLE 
                </button>
            </form>
        </div>
    );
}
