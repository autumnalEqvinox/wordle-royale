"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/app/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import Link from "next/link";
import { ArrowLeftToLine } from "lucide-react";

export default function PersonalStats() {
    const [user, setUser] = useState<User | null>(null);
    const [stats, setStats] = useState<PlayerStats | null>(null);
    const winRate = stats && stats.totalGames > 0 ? (stats.wins / stats.totalGames) * 100 : 0;


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
        });

        return () => {
            unsubscribe();
        };
    }, []);

    
    interface PlayerStats { 
        wins: number;
        totalGuesses: number; 
        totalGames: number;
    }

    useEffect(() => {
    if (!user) {
        setStats(null);
        return;
    }

        const playerRef = doc(db, "playerStats", user.uid);

        const unsubscribe = onSnapshot(
            playerRef,
            (snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.data();

                    setStats({
                        wins: data.wins ?? 0,
                        totalGuesses: data.totalGuesses ?? 0,
                        totalGames: data.totalGames ?? 0
                    });
                } else {
                    setStats(null);
                }
            },
            (error) => {
                console.error("Error retrieving personal stats:", error);
            }
        );

        return () => unsubscribe();
    }, [user]);


    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-8 text-center">

            <div className="bg-white rounded-xl p-8 w-full max-w-lg">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">
                    My Player Stats
                </h1>

                {user ? (
                    <div className="space-y-4 text-gray-800">

                        <p>Username: {user.displayName}</p>
                        <p>Email: {user.email}</p>

                        <div className="grid grid-cols-2 gap-4 mt-6">

                            <div className="bg-gray-100 p-4 rounded-lg">
                                <p className="text-gray-500">Total Games</p>
                                <p className="text-2xl font-bold">
                                    {stats?.totalGames ?? 0}
                                </p>
                            </div>

                            <div className="bg-gray-100 p-4 rounded-lg">
                                <p className="text-gray-500">Total Wins</p>
                                <p className="text-2xl font-bold">
                                    {stats?.wins ?? 0}
                                </p>
                            </div>

                            <div className="bg-gray-100 p-4 rounded-lg">
                                <p className="text-gray-500">Total Guesses</p>
                                <p className="text-2xl font-bold">
                                    {stats?.totalGuesses ?? 0}
                                </p>
                            </div>

                            <div className="bg-gray-100 p-4 rounded-lg">
                                <p className="text-gray-500">Win Rate</p>
                                <p className="text-2xl font-bold">
                                    {winRate.toFixed(1)}%
                                </p>
                            </div>

                        </div>
                    </div>
                ) : (
                    <p className="text-gray-600">No user logged in</p>
                )}

                <Link href="/play" className="inline-block mt-8 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
                    <ArrowLeftToLine size={24} className="inline-block mr-2" />
                    Back to Game
                </Link>
            </div>
        </main>
    );

}