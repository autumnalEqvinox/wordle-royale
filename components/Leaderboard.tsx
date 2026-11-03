"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/app/lib/firebase";

export default function Leaderboard() {
    interface Player {
        uid: string; 
        username: string; 
        wins: number; 
        streak: number;
        totalGuesses: number;
    }


    const [players, setPlayers] = useState<Player[]>([]);

useEffect(() => {
    const playersCollection = collection(db, "playerStats");

    const unsubscribe = onSnapshot(playersCollection, (snapshot) => {
        const playerData: Player[] = snapshot.docs.map((doc) => ({
            uid: doc.id,
            username: doc.data().username,
            wins: doc.data().wins,
            streak: doc.data().streak,
            totalGuesses: doc.data().totalGuesses
        }));

        playerData.sort((a,b) => b.wins -a.wins);
        setPlayers(playerData);
    },
    (error) => {
        console.error("Error retrieving leaderboard:", error);
    });

    return () => unsubscribe();
}, []);

    return (
        <div className="w-full max-w-5xl mx-auto p-6 bg-white rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Leaderboard
            </h2>
            
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="py-2 px-4 border-b">Rank</th>
                            <th className="py-2 px-4 border-b">Username</th>
                            <th className="py-2 px-4 border-b">Wins</th>
                            <th className="py-2 px-4 border-b">Streak</th>
                            <th className="py-2 px-4 border-b">Total Guesses</th>
                        </tr>
                    </thead>

                    {/* Player statistics */}
                    <tbody>
                        {players.map((player, index) => (
                            <tr key={player.uid} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                                <td className="py-2 px-4 border-b">{index + 1}</td>
                                <td className="py-2 px-4 border-b">{player.username}</td>
                                <td className="py-2 px-4 border-b">{player.wins}</td>
                                <td className="py-2 px-4 border-b">{player.streak}</td>
                                <td className="py-2 px-4 border-b">{player.totalGuesses}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
             