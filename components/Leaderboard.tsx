"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/app/lib/firebase";

export default function Leaderboard() {
    interface Player {
        uid: string; 
        username: string; 
        score: number; 
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
            score: doc.data().score,
            wins: doc.data().wins,
            streak: doc.data().streak,
            totalGuesses: doc.data().totalGuesses
        }));

        setPlayers(playerData);
    },
    (error) => {
        console.error("Error retrieving leaderboard:", error);
    });

    return () => unsubscribe();
}, []);

    return (
        <div>
            <h2> Leaderboard test </h2>
            
            {players.map((player) => (
                <div key={player.uid}>
                    <p>Username: {player.username}</p>
                    <p>Score: {player.score}</p>
                    <p>Wins: {player.wins}</p>
                    <p>Streak: {player.streak}</p>
                    <p>Total Guesses: {player.totalGuesses}</p>
                </div>
            ))} 
        </div>
    );
}