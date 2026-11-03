"use client"

import KeyboardDetector from "@/features/KeyboardDetector";
import PlayerPresence from "@/components/PlayerSession";
import { useState, useEffect } from "react";
import { Delete } from "lucide-react";
import Leaderboard from "@/components/Leaderboard";
import { auth, db } from "@/app/lib/firebase";
import { 
    doc, 
    updateDoc, 
    getDoc, 
    setDoc, 
    addDoc, 
    increment, 
    collection, 
    serverTimestamp } from "firebase/firestore";
import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { isValidWord, getRandomWord } from "@/features/validWords";

export default function GamePlay() {
    // this exists to change the length of the word if need be
    const [MAX_LENGTH, setMaxLength] = useState<number>(5);
    const [hasWon, setHasWon] = useState(false);

    const [isOpen, setIsOpen] = useState<boolean>(false);

    // need to store guesses in the database, and display the last 5 recent on the
    // the screen, so the letter colors can still work and change
    const [guessedText, setGuessedText] = useState<string[]>([]);

    // get the last 5 guesses from guessedText by getting the max between 0 (starting), and the max length - 5
    const guessedTextLength = Math.max(0, guessedText.length-5);

    const [text, setText] = useState("");
    const [pressedKey, setPressedKey] = useState("");
    const [validGuess, setValidGuess] = useState("HOWDY"); // API call ???

    // three states - gray, green, or yellow
    // const word_state = ["gray", "gray", "gray", "gray", "gray"];

    // count how many letters are in the word and then set the failsafe to display for yellow

    // on load, use the stored word, or pick and store one if there is none yet
    useEffect(() => {
        let cancelled = false;

        // waits for Firebase to restore the session so Firestore sees the signed-in user
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) return;
            try {
                const snap = await getDoc(doc(db, "game", "word"));
                const saved = snap.data()?.currentWord;
                if (cancelled) return;

                if (typeof saved === "string" && isValidWord(saved)) {
                    setValidGuess(saved);
                } else {
                    const word = getRandomWord();
                    setValidGuess(word);
                    // await saveWord(word);
                }
            } catch (err) {
                console.error("Failed to load game/word", err);
            }
        });

        return () => {
            cancelled = true;
            unsubscribe();
        };
    }, []);

    
    // after a win, wait 10 seconds, then clear the board and pick a new word
    useEffect(() => {
        if (!hasWon) return;

        const timer = setTimeout(() => {
            const nextWord = getRandomWord(validGuess);
            setValidGuess(nextWord);
            // saveWord(nextWord); // store the new word in Firestore
            setGuessedText([]);
            setText("");
            setIsOpen(false);
            setHasWon(false);
        }, 10000);

        return () => clearTimeout(timer); // cancel if the page is left before the 10 seconds are up
    }, [hasWon, validGuess]);

    async function initializePlayer(user: User) { // function to initialize player stats in firestore if they don't exist
        const playerRef = doc(db, "playerStats", user.uid);
        const playerSnapshot = await getDoc(playerRef);

        if (!playerSnapshot.exists()) {  // if doc doesn't exist (if player doesn't exist), create it with base stats of 0 
            await setDoc(playerRef, { // writes the new doc to firestore 
                username: user.displayName || "Player",
                wins: 0, 
                streak: 0,
                totalGuesses: 0
            });
        }
    }
    
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                void initializePlayer(user).catch((error) => {
                    console.error("error initializing player:", error);
                }); 
            }
        });
        return () => unsubscribe();
    }, []);
    
    // useEffect(() => {
    //     const playerRef = doc(db, "playerStats", User.uid);
    // })
    
    // function to save player guesses to firestore 
    async function savePlayerGuess(isCorrect: boolean) { 

        const user = auth.currentUser;

        if (!user) { 
            console.error("No user");
            return;
        }
        try { 
            const playerRef = doc(db, "playerStats", user.uid);

            await addDoc(collection(db, "rooms", "main", "guesses"), {
                word: text,
                userID: user.uid,
                submittedAt: serverTimestamp()
            })

            await updateDoc(playerRef, {
                totalGuesses: increment(1),
                ...(isCorrect ? { wins: increment(1) } : {})
            });

            console.log("guess saved ");

        } catch (error) {
            console.error("Unable to save guess:", error);
        }
    }


    // enter logic to stop guesses from be entered
    const handleEnter = () => {
        // if the guess is valid, stop inputs or text
        if (hasWon) {
            return;
        };

        if (text.length >= MAX_LENGTH) {
                

                // reject words that are not in the word list, keep the letters so the player can fix them
                if (!isValidWord(text)) {
                    alert("Not in word list");
                    return;
                }

                setGuessedText((prev) => [...prev, text]);

                if (validGuess === text) {
                    setIsOpen(true); 
                    setHasWon(true);
                };
            
                savePlayerGuess(text === validGuess);
                setText("")
            };
        }

        // gonna have to change the code from instead of guessedText last 5 guesses, 
        //       I need to adjust to check for every word. probably just keep the state of before and 
        // then update the letters over time. like keeping a state of 5 letters, and then
        // sending and updating it over time, saves space and code


    {/* Code for button letters color changing visibility */}
    const qIsGreen = () => {
        let color = "bg-gray-300";
        let letter = "Q"

        for (let row = 0; row < guessedText.length; row++) {
            if (guessedText[row]?.includes(letter)) {
                if (
                    (guessedText[row][0] === letter && validGuess[0] === letter) ||
                    (guessedText[row][1] === letter && validGuess[1] === letter) ||
                    (guessedText[row][2] === letter && validGuess[2] === letter) ||
                    (guessedText[row][3] === letter && validGuess[3] === letter) ||
                    (guessedText[row][4] === letter && validGuess[4] === letter)
                ) {
                    return "bg-green-400";
                }

                // switch () {
                //     case (guessedText[row][0] === letter && validGuess[0] === letter): return true;
                //     (guessedText[row][1] === letter && validGuess[1] === letter) ||
                //     (guessedText[row][2] === letter && validGuess[2] === letter) ||
                //     (guessedText[row][3] === letter && validGuess[3] === letter) ||
                //     (guessedText[row][4] === letter && validGuess[4] === letter)
                // } 

                color = validGuess.includes(letter)
                    ? "bg-yellow-400"
                    : "bg-gray-400"
            }
        }

        return color;
    };

    const wIsGreen = () => {
        let color = "bg-gray-300";
        let letter = "W"

        for (let row = 0; row < guessedText.length; row++) {
            if (guessedText[row]?.includes(letter)) {
                if (
                    (guessedText[row][0] === letter && validGuess[0] === letter) ||
                    (guessedText[row][1] === letter && validGuess[1] === letter) ||
                    (guessedText[row][2] === letter && validGuess[2] === letter) ||
                    (guessedText[row][3] === letter && validGuess[3] === letter) ||
                    (guessedText[row][4] === letter && validGuess[4] === letter)
                ) {
                    return "bg-green-400";
                }

                color = validGuess.includes(letter)
                    ? "bg-yellow-400"
                    : "bg-gray-400"
            }
        }

            return color;
        };


    const eIsGreen = () => {
        let color = "bg-gray-300";
        let letter = "E"

        for (let row = 0; row < guessedText.length; row++) {
            if (guessedText[row]?.includes(letter)) {
                if (
                    (guessedText[row][0] === letter && validGuess[0] === letter) ||
                    (guessedText[row][1] === letter && validGuess[1] === letter) ||
                    (guessedText[row][2] === letter && validGuess[2] === letter) ||
                    (guessedText[row][3] === letter && validGuess[3] === letter) ||
                    (guessedText[row][4] === letter && validGuess[4] === letter)
                ) {
                    return "bg-green-400";
                }

                color = validGuess.includes(letter)
                    ? "bg-yellow-400"
                    : "bg-gray-400"
            }
        }

            return color;
        };

    const rIsGreen = () => {
        let color = "bg-gray-300";
        let letter = "R"

        for (let row = 0; row < guessedText.length; row++) {
            if (guessedText[row]?.includes(letter)) {
                if (
                    (guessedText[row][0] === letter && validGuess[0] === letter) ||
                    (guessedText[row][1] === letter && validGuess[1] === letter) ||
                    (guessedText[row][2] === letter && validGuess[2] === letter) ||
                    (guessedText[row][3] === letter && validGuess[3] === letter) ||
                    (guessedText[row][4] === letter && validGuess[4] === letter)
                ) {
                    return "bg-green-400";
                }

                color = validGuess.includes(letter)
                    ? "bg-yellow-400"
                    : "bg-gray-400"
            }
        }

            return color;
        };

    const tIsGreen = () => {
        let color = "bg-gray-300";
        let letter = "T"

        for (let row = 0; row < guessedText.length; row++) {
            if (guessedText[row]?.includes(letter)) {
                if (
                    (guessedText[row][0] === letter && validGuess[0] === letter) ||
                    (guessedText[row][1] === letter && validGuess[1] === letter) ||
                    (guessedText[row][2] === letter && validGuess[2] === letter) ||
                    (guessedText[row][3] === letter && validGuess[3] === letter) ||
                    (guessedText[row][4] === letter && validGuess[4] === letter)
                ) {
                    return "bg-green-400";
                }

                color = validGuess.includes(letter)
                    ? "bg-yellow-400"
                    : "bg-gray-400"
            }
        }

            return color;
        };

    const yIsGreen = () => {
        let color = "bg-gray-300";
        let letter = "Y"

        for (let row = 0; row < guessedText.length; row++) {
            if (guessedText[row]?.includes(letter)) {
                if (
                    (guessedText[row][0] === letter && validGuess[0] === letter) ||
                    (guessedText[row][1] === letter && validGuess[1] === letter) ||
                    (guessedText[row][2] === letter && validGuess[2] === letter) ||
                    (guessedText[row][3] === letter && validGuess[3] === letter) ||
                    (guessedText[row][4] === letter && validGuess[4] === letter)
                ) {
                    return "bg-green-400";
                }

                color = validGuess.includes(letter)
                    ? "bg-yellow-400"
                    : "bg-gray-400"
            }
        }

            return color;
        };


    const uIsGreen = () => {
        let color = "bg-gray-300";
        let letter = "U"

        for (let row = 0; row < guessedText.length; row++) {
            if (guessedText[row]?.includes(letter)) {
                if (
                    (guessedText[row][0] === letter && validGuess[0] === letter) ||
                    (guessedText[row][1] === letter && validGuess[1] === letter) ||
                    (guessedText[row][2] === letter && validGuess[2] === letter) ||
                    (guessedText[row][3] === letter && validGuess[3] === letter) ||
                    (guessedText[row][4] === letter && validGuess[4] === letter)
                ) {
                    return "bg-green-400";
                }

                color = validGuess.includes(letter)
                    ? "bg-yellow-400"
                    : "bg-gray-400"
            }
        }

            return color;
        };

    const iIsGreen = () => {
        let color = "bg-gray-300";
        let letter = "I"

        for (let row = 0; row < guessedText.length; row++) {
            if (guessedText[row]?.includes(letter)) {
                if (
                    (guessedText[row][0] === letter && validGuess[0] === letter) ||
                    (guessedText[row][1] === letter && validGuess[1] === letter) ||
                    (guessedText[row][2] === letter && validGuess[2] === letter) ||
                    (guessedText[row][3] === letter && validGuess[3] === letter) ||
                    (guessedText[row][4] === letter && validGuess[4] === letter)
                ) {
                    return "bg-green-400";
                }

                color = validGuess.includes(letter)
                    ? "bg-yellow-400"
                    : "bg-gray-400"
            }
        }

            return color;
        };

    const oIsGreen = () => {
        let color = "bg-gray-300";
        let letter = "O"

        for (let row = 0; row < guessedText.length; row++) {
            if (guessedText[row]?.includes(letter)) {
                if (
                    (guessedText[row][0] === letter && validGuess[0] === letter) ||
                    (guessedText[row][1] === letter && validGuess[1] === letter) ||
                    (guessedText[row][2] === letter && validGuess[2] === letter) ||
                    (guessedText[row][3] === letter && validGuess[3] === letter) ||
                    (guessedText[row][4] === letter && validGuess[4] === letter)
                ) {
                    return "bg-green-400";
                }

                color = validGuess.includes(letter)
                    ? "bg-yellow-400"
                    : "bg-gray-400"
            }
        }

            return color;
        };

    const pIsGreen = () => {
        let color = "bg-gray-300";
        let letter = "P"

        for (let row = 0; row < guessedText.length; row++) {
            if (guessedText[row]?.includes(letter)) {
                if (
                    (guessedText[row][0] === letter && validGuess[0] === letter) ||
                    (guessedText[row][1] === letter && validGuess[1] === letter) ||
                    (guessedText[row][2] === letter && validGuess[2] === letter) ||
                    (guessedText[row][3] === letter && validGuess[3] === letter) ||
                    (guessedText[row][4] === letter && validGuess[4] === letter)
                ) {
                    return "bg-green-400";
                }

                color = validGuess.includes(letter)
                    ? "bg-yellow-400"
                    : "bg-gray-400"
            }
        }

            return color;
        };


    {/* Row 2 */}

    const aIsGreen = () => {
        let color = "bg-gray-300";
        let letter = "A"

        for (let row = 0; row < guessedText.length; row++) {
            if (guessedText[row]?.includes(letter)) {
                if (
                    (guessedText[row][0] === letter && validGuess[0] === letter) ||
                    (guessedText[row][1] === letter && validGuess[1] === letter) ||
                    (guessedText[row][2] === letter && validGuess[2] === letter) ||
                    (guessedText[row][3] === letter && validGuess[3] === letter) ||
                    (guessedText[row][4] === letter && validGuess[4] === letter)
                ) {
                    return "bg-green-400";
                }

                color = validGuess.includes(letter)
                    ? "bg-yellow-400"
                    : "bg-gray-400"
            }
        }

            return color;
        };


    const sIsGreen = () => {
        let color = "bg-gray-300";
        let letter = "S"

        for (let row = 0; row < guessedText.length; row++) {
            if (guessedText[row]?.includes(letter)) {
                if (
                    (guessedText[row][0] === letter && validGuess[0] === letter) ||
                    (guessedText[row][1] === letter && validGuess[1] === letter) ||
                    (guessedText[row][2] === letter && validGuess[2] === letter) ||
                    (guessedText[row][3] === letter && validGuess[3] === letter) ||
                    (guessedText[row][4] === letter && validGuess[4] === letter)
                ) {
                    return "bg-green-400";
                }

                color = validGuess.includes(letter)
                    ? "bg-yellow-400"
                    : "bg-gray-400"
            }
        }

            return color;
        };

    const dIsGreen = () => {
        let color = "bg-gray-300";
        let letter = "D"

        for (let row = 0; row < guessedText.length; row++) {
            if (guessedText[row]?.includes(letter)) {
                if (
                    (guessedText[row][0] === letter && validGuess[0] === letter) ||
                    (guessedText[row][1] === letter && validGuess[1] === letter) ||
                    (guessedText[row][2] === letter && validGuess[2] === letter) ||
                    (guessedText[row][3] === letter && validGuess[3] === letter) ||
                    (guessedText[row][4] === letter && validGuess[4] === letter)
                ) {
                    return "bg-green-400";
                }

                color = validGuess.includes(letter)
                    ? "bg-yellow-400"
                    : "bg-gray-400"
            }
        }

            return color;
        };

    const fIsGreen = () => {
        let color = "bg-gray-300";
        let letter = "F"

        for (let row = 0; row < guessedText.length; row++) {
            if (guessedText[row]?.includes(letter)) {
                if (
                    (guessedText[row][0] === letter && validGuess[0] === letter) ||
                    (guessedText[row][1] === letter && validGuess[1] === letter) ||
                    (guessedText[row][2] === letter && validGuess[2] === letter) ||
                    (guessedText[row][3] === letter && validGuess[3] === letter) ||
                    (guessedText[row][4] === letter && validGuess[4] === letter)
                ) {
                    return "bg-green-400";
                }

                color = validGuess.includes(letter)
                    ? "bg-yellow-400"
                    : "bg-gray-400"
            }
        }

            return color;
        };

    const gIsGreen = () => {
        let color = "bg-gray-300";
        let letter = "G"

        for (let row = 0; row < guessedText.length; row++) {
            if (guessedText[row]?.includes(letter)) {
                if (
                    (guessedText[row][0] === letter && validGuess[0] === letter) ||
                    (guessedText[row][1] === letter && validGuess[1] === letter) ||
                    (guessedText[row][2] === letter && validGuess[2] === letter) ||
                    (guessedText[row][3] === letter && validGuess[3] === letter) ||
                    (guessedText[row][4] === letter && validGuess[4] === letter)
                ) {
                    return "bg-green-400";
                }

                color = validGuess.includes(letter)
                    ? "bg-yellow-400"
                    : "bg-gray-400"
            }
        }

            return color;
        };


    const hIsGreen = () => {
        let color = "bg-gray-300";
        let letter = "H"

        for (let row = 0; row < guessedText.length; row++) {
            if (guessedText[row]?.includes(letter)) {
                if (
                    (guessedText[row][0] === letter && validGuess[0] === letter) ||
                    (guessedText[row][1] === letter && validGuess[1] === letter) ||
                    (guessedText[row][2] === letter && validGuess[2] === letter) ||
                    (guessedText[row][3] === letter && validGuess[3] === letter) ||
                    (guessedText[row][4] === letter && validGuess[4] === letter)
                ) {
                    return "bg-green-400";
                }

                color = validGuess.includes(letter)
                    ? "bg-yellow-400"
                    : "bg-gray-400"
            }
        }

            return color;
        };

    const jIsGreen = () => {
        let color = "bg-gray-300";
        let letter = "J"

        for (let row = 0; row < guessedText.length; row++) {
            if (guessedText[row]?.includes(letter)) {
                if (
                    (guessedText[row][0] === letter && validGuess[0] === letter) ||
                    (guessedText[row][1] === letter && validGuess[1] === letter) ||
                    (guessedText[row][2] === letter && validGuess[2] === letter) ||
                    (guessedText[row][3] === letter && validGuess[3] === letter) ||
                    (guessedText[row][4] === letter && validGuess[4] === letter)
                ) {
                    return "bg-green-400";
                }

                color = validGuess.includes(letter)
                    ? "bg-yellow-400"
                    : "bg-gray-400"
            }
        }

            return color;
        };

    const kIsGreen = () => {
        let color = "bg-gray-300";
        let letter = "K"

        for (let row = 0; row < guessedText.length; row++) {
            if (guessedText[row]?.includes(letter)) {
                if (
                    (guessedText[row][0] === letter && validGuess[0] === letter) ||
                    (guessedText[row][1] === letter && validGuess[1] === letter) ||
                    (guessedText[row][2] === letter && validGuess[2] === letter) ||
                    (guessedText[row][3] === letter && validGuess[3] === letter) ||
                    (guessedText[row][4] === letter && validGuess[4] === letter)
                ) {
                    return "bg-green-400";
                }

                color = validGuess.includes(letter)
                    ? "bg-yellow-400"
                    : "bg-gray-400"
            }
        }

            return color;
        };

    const lIsGreen = () => {
        let color = "bg-gray-300";
        let letter = "L"

        for (let row = 0; row < guessedText.length; row++) {
            if (guessedText[row]?.includes(letter)) {
                if (
                    (guessedText[row][0] === letter && validGuess[0] === letter) ||
                    (guessedText[row][1] === letter && validGuess[1] === letter) ||
                    (guessedText[row][2] === letter && validGuess[2] === letter) ||
                    (guessedText[row][3] === letter && validGuess[3] === letter) ||
                    (guessedText[row][4] === letter && validGuess[4] === letter)
                ) {
                    return "bg-green-400";
                }

                color = validGuess.includes(letter)
                    ? "bg-yellow-400"
                    : "bg-gray-400"
            }
        }

            return color;
        };


    {/* Row 3 */}

    const zIsGreen = () => {
        let color = "bg-gray-300";
        let letter = "Z"

        for (let row = 0; row < guessedText.length; row++) {
            if (guessedText[row]?.includes(letter)) {
                if (
                    (guessedText[row][0] === letter && validGuess[0] === letter) ||
                    (guessedText[row][1] === letter && validGuess[1] === letter) ||
                    (guessedText[row][2] === letter && validGuess[2] === letter) ||
                    (guessedText[row][3] === letter && validGuess[3] === letter) ||
                    (guessedText[row][4] === letter && validGuess[4] === letter)
                ) {
                    return "bg-green-400";
                }

                color = validGuess.includes(letter)
                    ? "bg-yellow-400"
                    : "bg-gray-400"
            }
        }

            return color;
        };


    const xIsGreen = () => {
        let color = "bg-gray-300";
        let letter = "X"

        for (let row = 0; row < guessedText.length; row++) {
            if (guessedText[row]?.includes(letter)) {
                if (
                    (guessedText[row][0] === letter && validGuess[0] === letter) ||
                    (guessedText[row][1] === letter && validGuess[1] === letter) ||
                    (guessedText[row][2] === letter && validGuess[2] === letter) ||
                    (guessedText[row][3] === letter && validGuess[3] === letter) ||
                    (guessedText[row][4] === letter && validGuess[4] === letter)
                ) {
                    return "bg-green-400";
                }

                color = validGuess.includes(letter)
                    ? "bg-yellow-400"
                    : "bg-gray-400"
            }
        }

            return color;
        };

    const cIsGreen = () => {
        let color = "bg-gray-300";
        let letter = "C"

        for (let row = 0; row < guessedText.length; row++) {
            if (guessedText[row]?.includes(letter)) {
                if (
                    (guessedText[row][0] === letter && validGuess[0] === letter) ||
                    (guessedText[row][1] === letter && validGuess[1] === letter) ||
                    (guessedText[row][2] === letter && validGuess[2] === letter) ||
                    (guessedText[row][3] === letter && validGuess[3] === letter) ||
                    (guessedText[row][4] === letter && validGuess[4] === letter)
                ) {
                    return "bg-green-400";
                }

                color = validGuess.includes(letter)
                    ? "bg-yellow-400"
                    : "bg-gray-400"
            }
        }

            return color;
        };

    const vIsGreen = () => {
        let color = "bg-gray-300";
        let letter = "V"

        for (let row = 0; row < guessedText.length; row++) {
            if (guessedText[row]?.includes(letter)) {
                if (
                    (guessedText[row][0] === letter && validGuess[0] === letter) ||
                    (guessedText[row][1] === letter && validGuess[1] === letter) ||
                    (guessedText[row][2] === letter && validGuess[2] === letter) ||
                    (guessedText[row][3] === letter && validGuess[3] === letter) ||
                    (guessedText[row][4] === letter && validGuess[4] === letter)
                ) {
                    return "bg-green-400";
                }

                color = validGuess.includes(letter)
                    ? "bg-yellow-400"
                    : "bg-gray-400"
            }
        }

            return color;
        };

    const bIsGreen = () => {
        let color = "bg-gray-300";
        let letter = "B"

        for (let row = 0; row < guessedText.length; row++) {
            if (guessedText[row]?.includes(letter)) {
                if (
                    (guessedText[row][0] === letter && validGuess[0] === letter) ||
                    (guessedText[row][1] === letter && validGuess[1] === letter) ||
                    (guessedText[row][2] === letter && validGuess[2] === letter) ||
                    (guessedText[row][3] === letter && validGuess[3] === letter) ||
                    (guessedText[row][4] === letter && validGuess[4] === letter)
                ) {
                    return "bg-green-400";
                }

                color = validGuess.includes(letter)
                    ? "bg-yellow-400"
                    : "bg-gray-400"
            }
        }

            return color;
        };


    const nIsGreen = () => {
        let color = "bg-gray-300";
        let letter = "N"

        for (let row = 0; row < guessedText.length; row++) {
            if (guessedText[row]?.includes(letter)) {
                if (
                    (guessedText[row][0] === letter && validGuess[0] === letter) ||
                    (guessedText[row][1] === letter && validGuess[1] === letter) ||
                    (guessedText[row][2] === letter && validGuess[2] === letter) ||
                    (guessedText[row][3] === letter && validGuess[3] === letter) ||
                    (guessedText[row][4] === letter && validGuess[4] === letter)
                ) {
                    return "bg-green-400";
                }

                color = validGuess.includes(letter)
                    ? "bg-yellow-400"
                    : "bg-gray-400"
            }
        }

            return color;
        };

    const mIsGreen = () => {
        let color = "bg-gray-300";
        let letter = "M"

        for (let row = 0; row < guessedText.length; row++) {
            if (guessedText[row]?.includes(letter)) {
                if (
                    (guessedText[row][0] === letter && validGuess[0] === letter) ||
                    (guessedText[row][1] === letter && validGuess[1] === letter) ||
                    (guessedText[row][2] === letter && validGuess[2] === letter) ||
                    (guessedText[row][3] === letter && validGuess[3] === letter) ||
                    (guessedText[row][4] === letter && validGuess[4] === letter)
                ) {
                    return "bg-green-400";
                }

                color = validGuess.includes(letter)
                    ? "bg-yellow-400"
                    : "bg-gray-400"
            }
        }

            return color;
        };

        return (
            <>
        <KeyboardDetector
            hasWon={hasWon}
            text={text}
            setText={setText}
            setPressedKey={setPressedKey}
            onSubmit={handleEnter}
            // changed onSubmit ot handleEnter to connect keyboard to new combined functino that busmits guesses and logs to firestore + check for win 
            // also removed redundant functions that were not needed anymore since the new function handles both keyboard and enter button submission
        />
            
        <main className="flex flex-col items-center p-14">
            <div className="grid grid-cols-5 grid-rows-6 gap-2">
                {/* Row 1 */}

                <div 
                    key={0}
                    className={`flex h-15 w-15 items-center justify-center border-2 border-grey-500 text-3xl font-bold
                    ${
                        !guessedText[guessedTextLength]?.[0]
                            ? ""
                            : validGuess[0] === guessedText[guessedTextLength][0]
                                ? "bg-green-400"
                                : validGuess.includes(guessedText[guessedTextLength][0])
                                    ? "bg-yellow-400"
                                    : validGuess[0] != guessedText[guessedTextLength][0]
                                        ? "bg-gray-400"
                                        : ""
                    }`}
                >
                    
                    {guessedText[guessedTextLength] != null && guessedText[guessedTextLength] != "" // checks to see if there is a submission
                        ? guessedText[guessedTextLength][0] // display the submitted word for this row
                        : guessedText.length == guessedTextLength // if there is not a submission
                            ? text[0] // display the guess's letter position
                            : "" // show nothing if not on that row
                            } {/* Think of this as a cursor, it will not show the previous 
                                results until there is a guess. If there is a guess, then you 
                                can move down the ladder and try the next row for a guess 
                                attempt. This ensures there is no multiple guesses being displayed. 
                                */}
                            
                    </div>

                    <div 
                    key={1}
                    className={`flex h-15 w-15 items-center justify-center border-2 border-grey-500 text-3xl font-bold
                    ${
                        !guessedText[guessedTextLength]?.[1]
                            ? ""
                            : validGuess[1] === guessedText[guessedTextLength][1]
                                ? "bg-green-400"
                                : validGuess.includes(guessedText[guessedTextLength][1])
                                    ? "bg-yellow-400"
                                    : validGuess[1] != guessedText[guessedTextLength][1]
                                        ? "bg-gray-400"
                                        : ""
                    }`}
                    >
                    {guessedText[guessedTextLength] != null && guessedText[guessedTextLength] != "" 
                        ? guessedText[guessedTextLength][1] 
                        : guessedText.length == guessedTextLength
                            ? text[1] 
                            : ""
                            }

                    </div>

                    <div 
                    key={2}
                    className={`flex h-15 w-15 items-center justify-center border-2 border-grey-500 text-3xl font-bold
                    ${
                        !guessedText[guessedTextLength]?.[2]
                            ? ""
                            : validGuess[2] === guessedText[guessedTextLength][2]
                                ? "bg-green-400"
                                : validGuess.includes(guessedText[guessedTextLength][2])
                                    ? "bg-yellow-400"
                                    : validGuess[2] != guessedText[guessedTextLength][2]
                                        ? "bg-gray-400"
                                        : ""
                    }`}
                    >
                    {guessedText[guessedTextLength] != null && guessedText[guessedTextLength] != "" 
                        ? guessedText[guessedTextLength][2] 
                        : guessedText.length == guessedTextLength
                            ? text[2]
                            : ""
                            }
                    </div>

                    <div 
                    key={3}
                    className={`flex h-15 w-15 items-center justify-center border-2 border-grey-500 text-3xl font-bold
                    ${
                        !guessedText[guessedTextLength]?.[3]
                            ? ""
                            : validGuess[3] === guessedText[guessedTextLength][3]
                                ? "bg-green-400"
                                : validGuess.includes(guessedText[guessedTextLength][3])
                                    ? "bg-yellow-400"
                                    : validGuess[3] != guessedText[guessedTextLength][3]
                                        ? "bg-gray-400"
                                        : ""
                    }`}
                    >
                    {guessedText[guessedTextLength] != null && guessedText[guessedTextLength] != "" 
                        ? guessedText[guessedTextLength][3] 
                        : guessedText.length == guessedTextLength
                            ? text[3]
                            : ""
                            }
                    </div>

                    <div 
                    key={4}
                    className={`flex h-15 w-15 items-center justify-center border-2 border-grey-500 text-3xl font-bold
                    ${
                        !guessedText[guessedTextLength]?.[4]
                            ? ""
                            : validGuess[4] === guessedText[guessedTextLength][4]
                                ? "bg-green-400"
                                : validGuess.includes(guessedText[guessedTextLength][4])
                                    ? "bg-yellow-400"
                                    : validGuess[4] != guessedText[guessedTextLength][4]
                                        ? "bg-gray-400"
                                        : ""
                    }`}
                    >
                    {guessedText[guessedTextLength] != null && guessedText[guessedTextLength] != "" 
                        ? guessedText[guessedTextLength][4] 
                        : guessedText.length == guessedTextLength
                            ? text[4]
                            : ""
                            }
                    </div>

                {/* Row 2 */}
           <div 
                    key={5}
                    className={`flex h-15 w-15 items-center justify-center border-2 border-grey-500 text-3xl font-bold
                    ${
                        !guessedText[guessedTextLength+1]?.[0]
                            ? ""
                            : validGuess[0] === guessedText[guessedTextLength+1][0]
                                ? "bg-green-400"
                                : validGuess.includes(guessedText[guessedTextLength+1][0])
                                    ? "bg-yellow-400"
                                    : validGuess[0] != guessedText[guessedTextLength+1][0]
                                        ? "bg-gray-400"
                                        : ""
                    }`}
                    >
                    {guessedText[guessedTextLength+1] != null && guessedText[guessedTextLength+1] != "" 
                        ? guessedText[guessedTextLength+1][0] 
                        : guessedText.length == guessedTextLength+1
                            ? text[0]
                            : ""
                            }

                    </div>

                    <div 
                    key={6}
                    className={`flex h-15 w-15 items-center justify-center border-2 border-grey-500 text-3xl font-bold
                    ${
                        !guessedText[guessedTextLength+1]?.[1]
                            ? ""
                            : validGuess[1] === guessedText[guessedTextLength+1][1]
                                ? "bg-green-400"
                                : validGuess.includes(guessedText[guessedTextLength+1][1])
                                    ? "bg-yellow-400"
                                    : validGuess[1] != guessedText[guessedTextLength+1][1]
                                        ? "bg-gray-400"
                                        : ""
                    }`}
                    >

                    {guessedText[guessedTextLength+1] != null && guessedText[guessedTextLength+1] != "" 
                        ? guessedText[guessedTextLength+1][1] 
                        : guessedText.length == guessedTextLength+1
                            ? text[1]
                            : ""
                            }

                    </div>

                    <div 
                    key={7}
                    className={`flex h-15 w-15 items-center justify-center border-2 border-grey-500 text-3xl font-bold
                    ${
                        !guessedText[guessedTextLength+1]?.[2]
                            ? ""
                            : validGuess[2] === guessedText[guessedTextLength+1][2]
                                ? "bg-green-400"
                                : validGuess.includes(guessedText[guessedTextLength+1][2])
                                    ? "bg-yellow-400"
                                    : validGuess[2] != guessedText[guessedTextLength+1][2]
                                        ? "bg-gray-400"
                                        : ""
                    }`}
                    >
                    {guessedText[guessedTextLength+1] != null && guessedText[guessedTextLength+1] != "" 
                        ? guessedText[guessedTextLength+1][2] 
                        : guessedText.length == guessedTextLength+1
                            ? text[2]
                            : ""
                            }
                    </div>

                    <div 
                    key={8}
                    className={`flex h-15 w-15 items-center justify-center border-2 border-grey-500 text-3xl font-bold
                    ${
                        !guessedText[guessedTextLength+1]?.[3]
                            ? ""
                            : validGuess[3] === guessedText[guessedTextLength+1][3]
                                ? "bg-green-400"
                                : validGuess.includes(guessedText[guessedTextLength+1][3])
                                    ? "bg-yellow-400"
                                    : validGuess[3] != guessedText[guessedTextLength+1][3]
                                        ? "bg-gray-400"
                                        : ""
                    }`}
                    >
                    {guessedText[guessedTextLength+1] != null && guessedText[guessedTextLength+1] != "" 
                        ? guessedText[guessedTextLength+1][3] 
                        : guessedText.length == guessedTextLength+1
                            ? text[3]
                            : ""
                            }
                    </div>

                    <div 
                    key={9}
                    className={`flex h-15 w-15 items-center justify-center border-2 border-grey-500 text-3xl font-bold
                    ${
                        !guessedText[guessedTextLength+1]?.[4]
                            ? ""
                            : validGuess[4] === guessedText[guessedTextLength+1][4]
                                ? "bg-green-400"
                                : validGuess.includes(guessedText[guessedTextLength+1][4])
                                    ? "bg-yellow-400"
                                    : validGuess[4] != guessedText[guessedTextLength+1][4]
                                        ? "bg-gray-400"
                                        : ""
                    }`}
                    >
                    {guessedText[guessedTextLength+1] != null && guessedText[guessedTextLength+1] != "" 
                        ? guessedText[guessedTextLength+1][4] 
                        : guessedText.length == guessedTextLength+1
                            ? text[4]
                            : ""
                            }
                    </div>


                {/* Row 3 */}
                <div 
                    key={10}
                    className={`flex h-15 w-15 items-center justify-center border-2 border-grey-500 text-3xl font-bold
                    ${
                        !guessedText[guessedTextLength+2]?.[0]
                            ? ""
                            : validGuess[0] === guessedText[guessedTextLength+2][0]
                                ? "bg-green-400"
                                : validGuess.includes(guessedText[guessedTextLength+2][0])
                                    ? "bg-yellow-400"
                                    : validGuess[0] != guessedText[guessedTextLength+2][0]
                                        ? "bg-gray-400"
                                        : ""
                    }`}
                    >
                    {guessedText[guessedTextLength+2] != null && guessedText[guessedTextLength+2] != "" 
                        ? guessedText[guessedTextLength+2][0] 
                        : guessedText.length == guessedTextLength+2
                            ? text[0]
                            : ""
                            }

                    </div>

                    <div 
                    key={11}
                    className={`flex h-15 w-15 items-center justify-center border-2 border-grey-500 text-3xl font-bold
                    ${
                        !guessedText[guessedTextLength+2]?.[1]
                            ? ""
                            : validGuess[1] === guessedText[guessedTextLength+2][1]
                                ? "bg-green-400"
                                : validGuess.includes(guessedText[guessedTextLength+2][1])
                                    ? "bg-yellow-400"
                                    : validGuess[1] != guessedText[guessedTextLength+2][1]
                                        ? "bg-gray-400"
                                        : ""
                    }`}
                    >
                    {guessedText[guessedTextLength+2] != null && guessedText[guessedTextLength+2] != "" 
                        ? guessedText[guessedTextLength+2][1] 
                        : guessedText.length == guessedTextLength+2
                            ? text[1]
                            : ""
                            }

                    </div>

                    <div 
                    key={12}
                    className={`flex h-15 w-15 items-center justify-center border-2 border-grey-500 text-3xl font-bold
                    ${
                        !guessedText[guessedTextLength+2]?.[2]
                            ? ""
                            : validGuess[2] === guessedText[guessedTextLength+2][2]
                                ? "bg-green-400"
                                : validGuess.includes(guessedText[guessedTextLength+2][2])
                                    ? "bg-yellow-400"
                                    : validGuess[2] != guessedText[guessedTextLength+2][2]
                                        ? "bg-gray-400"
                                        : ""
                    }`}
                    >
                    {guessedText[guessedTextLength+2] != null && guessedText[guessedTextLength+2] != "" 
                        ? guessedText[guessedTextLength+2][2] 
                        : guessedText.length == guessedTextLength+2
                            ? text[2]
                            : ""
                            }
                    </div>

                    <div 
                    key={13}
                    className={`flex h-15 w-15 items-center justify-center border-2 border-grey-500 text-3xl font-bold
                    ${
                        !guessedText[guessedTextLength+2]?.[3]
                            ? ""
                            : validGuess[3] === guessedText[guessedTextLength+2][3]
                                ? "bg-green-400"
                                : validGuess.includes(guessedText[guessedTextLength+2][3])
                                    ? "bg-yellow-400"
                                    : validGuess[3] != guessedText[guessedTextLength+2][3]
                                        ? "bg-gray-400"
                                        : ""
                    }`}
                    >
                    {guessedText[guessedTextLength+2] != null && guessedText[guessedTextLength+2] != "" 
                        ? guessedText[guessedTextLength+2][3] 
                        : guessedText.length == guessedTextLength+2
                            ? text[3]
                            : ""
                            }

                    </div>

                    <div 
                    key={14}
                    className={`flex h-15 w-15 items-center justify-center border-2 border-grey-500 text-3xl font-bold
                    ${
                        !guessedText[guessedTextLength+2]?.[4]
                            ? ""
                            : validGuess[4] === guessedText[guessedTextLength+2][4]
                                ? "bg-green-400"
                                : validGuess.includes(guessedText[guessedTextLength+2][4])
                                    ? "bg-yellow-400"
                                    : validGuess[4] != guessedText[guessedTextLength+2][4]
                                        ? "bg-gray-400"
                                        : ""
                    }`}
                    >
                    {guessedText[guessedTextLength+2] != null && guessedText[guessedTextLength+2] != "" 
                        ? guessedText[guessedTextLength +2][4] 
                        : guessedText.length == guessedTextLength+2
                            ? text[4]
                            : ""
                            }

                    </div>

                {/* Row 4 */}
                <div 
                    key={15}
                    className={`flex h-15 w-15 items-center justify-center border-2 border-grey-500 text-3xl font-bold
                    ${
                        !guessedText[guessedTextLength + 3]?.[0]
                            ? ""
                            : validGuess[0] === guessedText[guessedTextLength + 3][0]
                                ? "bg-green-400"
                                : validGuess.includes(guessedText[guessedTextLength + 3][0])
                                    ? "bg-yellow-400"
                                    : validGuess[0] != guessedText[guessedTextLength + 3][0]
                                        ? "bg-gray-400"
                                        : ""
                    }`}
                    >
                    {guessedText[guessedTextLength + 3] != null && guessedText[guessedTextLength + 3] != "" 
                        ? guessedText[guessedTextLength + 3][0] 
                        : guessedText.length == guessedTextLength + 3
                            ? text[0]
                            : ""
                            }

                    </div>

                    <div 
                    key={16}
                    className={`flex h-15 w-15 items-center justify-center border-2 border-grey-500 text-3xl font-bold
                    ${
                        !guessedText[guessedTextLength + 3]?.[1]
                            ? ""
                            : validGuess[1] === guessedText[guessedTextLength + 3][1]
                                ? "bg-green-400"
                                : validGuess.includes(guessedText[guessedTextLength + 3][1])
                                    ? "bg-yellow-400"
                                    : validGuess[1] != guessedText[guessedTextLength + 3][1]
                                        ? "bg-gray-400"
                                        : ""
                    }`}
                    >
                    {guessedText[guessedTextLength + 3] != null && guessedText[guessedTextLength + 3] != "" 
                        ? guessedText[guessedTextLength + 3][1] 
                        : guessedText.length == guessedTextLength + 3
                            ? text[1]
                            : ""
                            }

                    </div>

                    <div 
                    key={17}
                    className={`flex h-15 w-15 items-center justify-center border-2 border-grey-500 text-3xl font-bold
                    ${
                        !guessedText[guessedTextLength + 3]?.[2]
                            ? ""
                            : validGuess[2] === guessedText[guessedTextLength + 3][2]
                                ? "bg-green-400"
                                : validGuess.includes(guessedText[guessedTextLength + 3][2])
                                    ? "bg-yellow-400"
                                    : validGuess[2] != guessedText[guessedTextLength + 3][2]
                                        ? "bg-gray-400"
                                        : ""
                    }`}
                    >
                    {guessedText[guessedTextLength + 3] != null && guessedText[guessedTextLength + 3] != "" 
                        ? guessedText[guessedTextLength + 3][2] 
                        : guessedText.length == guessedTextLength + 3
                            ? text[2]
                            : ""
                            }
                    </div>

                    <div 
                    key={18}
                    className={`flex h-15 w-15 items-center justify-center border-2 border-grey-500 text-3xl font-bold
                    ${
                        !guessedText[guessedTextLength + 3]?.[3]
                            ? ""
                            : validGuess[3] === guessedText[guessedTextLength + 3][3]
                                ? "bg-green-400"
                                : validGuess.includes(guessedText[guessedTextLength + 3][3])
                                    ? "bg-yellow-400"
                                    : validGuess[3] != guessedText[guessedTextLength + 3][3]
                                        ? "bg-gray-400"
                                        : ""
                    }`}
                    >
                    {guessedText[guessedTextLength + 3] != null && guessedText[guessedTextLength + 3] != "" 
                        ? guessedText[guessedTextLength + 3][3] 
                        : guessedText.length == guessedTextLength + 3
                            ? text[3]
                            : ""
                            }
                    </div>

                    <div 
                    key={19}
                    className={`flex h-15 w-15 items-center justify-center border-2 border-grey-500 text-3xl font-bold
                    ${
                        !guessedText[guessedTextLength + 3]?.[4]
                            ? ""
                            : validGuess[4] === guessedText[guessedTextLength + 3][4]
                                ? "bg-green-400"
                                : validGuess.includes(guessedText[guessedTextLength + 3][4])
                                    ? "bg-yellow-400"
                                    : validGuess[4] != guessedText[guessedTextLength + 3][4]
                                        ? "bg-gray-400"
                                        : ""
                    }`}
                    >
                    {guessedText[guessedTextLength + 3] != null && guessedText[guessedTextLength + 3] != "" 
                        ? guessedText[guessedTextLength + 3][4] 
                        : guessedText.length == guessedTextLength + 3
                            ? text[4]
                            : ""
                            }
                    </div>

                {/* Row 5 */}
                <div 
                    key={20}
                    className={`flex h-15 w-15 items-center justify-center border-2 border-grey-500 text-3xl font-bold
                    ${
                        !guessedText[guessedTextLength + 4]?.[0]
                            ? ""
                            : validGuess[0] === guessedText[guessedTextLength + 4][0]
                                ? "bg-green-400"
                                : validGuess.includes(guessedText[guessedTextLength + 4][0])
                                    ? "bg-yellow-400"
                                    : validGuess[0] != guessedText[guessedTextLength + 4][0]
                                        ? "bg-gray-400"
                                        : ""
                    }`}
                    >
                    {guessedText[guessedTextLength + 4] != null && guessedText[guessedTextLength + 4] != "" 
                        ? guessedText[guessedTextLength + 4][0] 
                        : guessedText.length == guessedTextLength + 4
                            ? text[0]
                            : ""
                            }

                    </div>

                    <div 
                    key={21}
                    className={`flex h-15 w-15 items-center justify-center border-2 border-grey-500 text-3xl font-bold
                    ${
                        !guessedText[guessedTextLength + 4]?.[1]
                            ? ""
                            : validGuess[1] === guessedText[guessedTextLength + 4][1]
                                ? "bg-green-400"
                                : validGuess.includes(guessedText[guessedTextLength + 4][1])
                                    ? "bg-yellow-400"
                                    : validGuess[1] != guessedText[guessedTextLength + 4][1]
                                        ? "bg-gray-400"
                                        : ""
                    }`}
                    >
                    {guessedText[guessedTextLength + 4] != null && guessedText[guessedTextLength + 4] != "" 
                        ? guessedText[guessedTextLength + 4][1] 
                        : guessedText.length == guessedTextLength + 4
                            ? text[1]
                            : ""
                            }

                    </div>

                    <div 
                    key={22}
                    className={`flex h-15 w-15 items-center justify-center border-2 border-grey-500 text-3xl font-bold
                    ${
                        !guessedText[guessedTextLength + 4]?.[2]
                            ? ""
                            : validGuess[2] === guessedText[guessedTextLength + 4][2]
                                ? "bg-green-400"
                                : validGuess.includes(guessedText[guessedTextLength + 4][2])
                                    ? "bg-yellow-400"
                                    : validGuess[2] != guessedText[guessedTextLength + 4][2]
                                        ? "bg-gray-400"
                                        : ""
                    }`}
                    >
                    {guessedText[guessedTextLength + 4] != null && guessedText[guessedTextLength + 4] != "" 
                        ? guessedText[guessedTextLength + 4][2] 
                        : guessedText.length == guessedTextLength + 4
                            ? text[2]
                            : ""
                            }

                    </div>

                    <div 
                    key={23}
                    className={`flex h-15 w-15 items-center justify-center border-2 border-grey-500 text-3xl font-bold
                    ${
                        !guessedText[guessedTextLength + 4]?.[3]
                            ? ""
                            : validGuess[3] === guessedText[guessedTextLength + 4][3]
                                ? "bg-green-400"
                                : validGuess.includes(guessedText[guessedTextLength + 4][3])
                                    ? "bg-yellow-400"
                                    : validGuess[3] != guessedText[guessedTextLength + 4][3]
                                        ? "bg-gray-400"
                                        : ""
                    }`}
                    >
                    {guessedText[guessedTextLength + 4] != null && guessedText[guessedTextLength + 4] != "" 
                        ? guessedText[guessedTextLength + 4][3] 
                        : guessedText.length == guessedTextLength + 4
                            ? text[3]
                            : ""
                            }

                    </div>

                    <div 
                    key={24}
                    className={`flex h-15 w-15 items-center justify-center border-2 border-grey-500 text-3xl font-bold
                    ${
                        !guessedText[guessedTextLength + 4]?.[4]
                            ? ""
                            : validGuess[4] === guessedText[guessedTextLength + 4][4]
                                ? "bg-green-400"
                                : validGuess.includes(guessedText[guessedTextLength + 4][4])
                                    ? "bg-yellow-400"
                                    : validGuess[4] != guessedText[guessedTextLength + 4][4]
                                        ? "bg-gray-400"
                                        : ""
                    }`}
                    >
                    {guessedText[guessedTextLength + 4] != null && guessedText[guessedTextLength + 4] != "" 
                        ? guessedText[guessedTextLength + 4][4] 
                        : guessedText.length == guessedTextLength + 4
                            ? text[4]
                            : ""
                            }

                    </div>

                {/* Row 6 */}
                <div 
                    key={25}
                    className={`flex h-15 w-15 items-center justify-center border-2 border-grey-500 text-3xl font-bold
                    ${
                        !guessedText[guessedTextLength + 5]?.[0]
                            ? ""
                            : validGuess[0] === guessedText[guessedTextLength + 5][0]
                                ? "bg-green-400"
                                : validGuess.includes(guessedText[guessedTextLength + 5][0])
                                    ? "bg-yellow-400"
                                    : validGuess[0] != guessedText[guessedTextLength + 5][0]
                                        ? "bg-gray-400"
                                        : ""
                    }`}
                    >
                    {guessedText[guessedTextLength + 5] != null && guessedText[guessedTextLength + 5] != "" 
                        ? guessedText[guessedTextLength + 5][0] 
                        : guessedText.length == guessedTextLength + 5
                            ? text[0]
                            : ""
                            }

                    </div>

                    <div 
                    key={26}
                    className={`flex h-15 w-15 items-center justify-center border-2 border-grey-500 text-3xl font-bold
                    ${
                        !guessedText[guessedTextLength + 5]?.[1]
                            ? ""
                            : validGuess[1] === guessedText[guessedTextLength + 5][1]
                                ? "bg-green-400"
                                : validGuess.includes(guessedText[guessedTextLength + 5][1])
                                    ? "bg-yellow-400"
                                    : validGuess[1] != guessedText[guessedTextLength + 5][1]
                                        ? "bg-gray-400"
                                        : ""
                    }`}
                    >
                    {guessedText[guessedTextLength + 5] != null && guessedText[guessedTextLength + 5] != "" 
                        ? guessedText[guessedTextLength + 5][1] 
                        : guessedText.length == guessedTextLength + 5
                            ? text[1]
                            : ""
                            }


                    </div>

                    <div 
                    key={27}
                    className={`flex h-15 w-15 items-center justify-center border-2 border-grey-500 text-3xl font-bold
                    ${
                        !guessedText[guessedTextLength + 5]?.[2]
                            ? ""
                            : validGuess[2] === guessedText[guessedTextLength + 5][2]
                                ? "bg-green-400"
                                : validGuess.includes(guessedText[guessedTextLength + 5][2])
                                    ? "bg-yellow-400"
                                    : validGuess[2] != guessedText[guessedTextLength + 5][2]
                                        ? "bg-gray-400"
                                        : ""
                    }`}
                    >
                    {guessedText[guessedTextLength + 5] != null && guessedText[guessedTextLength + 5] != "" 
                        ? guessedText[guessedTextLength + 5][2] 
                        : guessedText.length == guessedTextLength + 5
                            ? text[2]
                            : ""
                            }

                    </div>

                    <div 
                    key={28}
                    className={`flex h-15 w-15 items-center justify-center border-2 border-grey-500 text-3xl font-bold
                    ${
                        !guessedText[guessedTextLength + 5]?.[3]
                            ? ""
                            : validGuess[3] === guessedText[guessedTextLength + 5][3]
                                ? "bg-green-400"
                                : validGuess.includes(guessedText[guessedTextLength + 5][3])
                                    ? "bg-yellow-400"
                                    : validGuess[3] != guessedText[guessedTextLength + 5][3]
                                        ? "bg-gray-400"
                                        : ""
                    }`}
                    >
                    {guessedText[guessedTextLength + 5] != null && guessedText[guessedTextLength + 5] != "" 
                        ? guessedText[guessedTextLength + 5][3] 
                        : guessedText.length == guessedTextLength + 5
                            ? text[3]
                            : ""
                            }

                    </div>

                    <div 
                    key={29}
                    className={`flex h-15 w-15 items-center justify-center border-2 border-grey-500 text-3xl font-bold
                    ${
                        !guessedText[guessedTextLength + 5]?.[4]
                            ? ""
                            : validGuess[4] === guessedText[guessedTextLength + 5][4]
                                ? "bg-green-400"
                                : validGuess.includes(guessedText[guessedTextLength + 5][4])
                                    ? "bg-yellow-400"
                                    : validGuess[4] != guessedText[guessedTextLength + 5][4]
                                        ? "bg-gray-400"
                                        : ""
                    }`}
                    >
                    {guessedText[guessedTextLength + 5] != null && guessedText[guessedTextLength + 5] != "" 
                        ? guessedText[guessedTextLength + 5][4] 
                        : guessedText.length == guessedTextLength + 5
                            ? text[4]
                            : ""
                            }

                    </div>

            </div>

    {/* {This is the keyboard buttons} */}
        <div className="flex flex-col items-center gap-2 mt-8">
            <div key={100} className="flex gap-2">
                <button key="Q-key" 
                className={`h-10 w-10 ${
                pressedKey === "Q"
                    ? qIsGreen() === "bg-green-400"
                        ? "bg-green-500"
                        : qIsGreen() === "bg-yellow-400"
                            ? "bg-yellow-500"
                            : "bg-gray-500"

                    : qIsGreen()
                }
                ${ // This is for hover effects
                    qIsGreen() === "bg-green-400"
                        ? "hover:bg-green-600"
                        : qIsGreen() === "bg-yellow-400"
                            ? "hover:bg-yellow-500"
                            : "hover:bg-gray-500"
                }`}
                onClick={
                    () => {
                        setText((prev) => {
                            if (hasWon || prev.length >= MAX_LENGTH) {
                                return prev;
                                }

                        return prev + "Q";
                    });
                       }
                    }
                >
                     Q
                </button>

        <button key="W-key" 
                className={`h-10 w-10 ${
                pressedKey === "W" 
                    ? wIsGreen() === "bg-green-400"
                        ? "bg-green-500"
                        : wIsGreen() === "bg-yellow-400"
                            ? "bg-yellow-500"
                            : "bg-gray-500"

                    : wIsGreen()
                }
                ${ // This is for hover effects
                    wIsGreen() === "bg-green-400"
                        ? "hover:bg-green-600"
                        : wIsGreen() === "bg-yellow-400"
                            ? "hover:bg-yellow-500"
                            : "hover:bg-gray-500"
                }`}
                onClick={
                    () => {
                        setText((prev) => {
                            if (hasWon || prev.length >= MAX_LENGTH) {
                                return prev;
                                }

                // there was an extra ENTER button logic here for some reason - I deleted it 

                        return prev + "W";
                    });
                }
            }
        >
            W
        </button>
        
        <button key="E-key" 
                className={`h-10 w-10 ${
                pressedKey === "E"
                    ? eIsGreen() === "bg-green-400"
                        ? "bg-green-500"
                        : eIsGreen() === "bg-yellow-400"
                            ? "bg-yellow-500"
                            : "bg-gray-500"

                    : eIsGreen()
                }
                ${ // This is for hover effects
                    eIsGreen() === "bg-green-400"
                        ? "hover:bg-green-600"
                        : eIsGreen() === "bg-yellow-400"
                            ? "hover:bg-yellow-500"
                            : "hover:bg-gray-500"
                }`}
                onClick={
                    () => {
                        setText((prev) => {
                            if (hasWon || prev.length >= MAX_LENGTH) {
                                return prev;
                                }

                        return prev + "E";
                    });
                       }
                    }
                >
                    E
                </button>

        <button key="R-key"
                className={`h-10 w-10 ${
                pressedKey === "R" 
                    ? rIsGreen() === "bg-green-400"
                        ? "bg-green-500"
                        : rIsGreen() === "bg-yellow-400"
                            ? "bg-yellow-500"
                            : "bg-gray-500"

                    : rIsGreen()
                }
                ${ // This is for hover effects
                    rIsGreen() === "bg-green-400"
                        ? "hover:bg-green-600"
                        : rIsGreen() === "bg-yellow-400"
                            ? "hover:bg-yellow-500"
                            : "hover:bg-gray-500"
                }`}
                onClick={
                    () => {
                        setText((prev) => {
                            if (hasWon || prev.length >= MAX_LENGTH) {
                                return prev;
                                }

                        return prev + "R";
                    });
                }
            }
        >
            R
        </button>

        <button key="T-key" 
                className={`h-10 w-10 ${
                pressedKey === "T"
                    ? tIsGreen() === "bg-green-400"
                        ? "bg-green-500"
                        : tIsGreen() === "bg-yellow-400"
                            ? "bg-yellow-500"
                            : "bg-gray-500"

                    : tIsGreen()
                }
                ${ // This is for hover effects
                    tIsGreen() === "bg-green-400"
                        ? "hover:bg-green-600"
                        : tIsGreen() === "bg-yellow-400"
                            ? "hover:bg-yellow-500"
                            : "hover:bg-gray-500"
                }`}
                onClick={
                    () => {
                        setText((prev) => {
                            if (hasWon || prev.length >= MAX_LENGTH) {
                                return prev;
                                }

                        return prev + "T";
                    });
                       }
                    }
                >
                    T
                </button>

        <button key="Y-key"
                className={`h-10 w-10 ${
                pressedKey === "Y" 
                    ? yIsGreen() === "bg-green-400"
                        ? "bg-green-500"
                        : yIsGreen() === "bg-yellow-400"
                            ? "bg-yellow-500"
                            : "bg-gray-500"

                    : yIsGreen()
                }
                ${ // This is for hover effects
                    yIsGreen() === "bg-green-400"
                        ? "hover:bg-green-600"
                        : yIsGreen() === "bg-yellow-400"
                            ? "hover:bg-yellow-500"
                            : "hover:bg-gray-500"
                }`}
                onClick={
                    () => {
                        setText((prev) => {
                            if (hasWon || prev.length >= MAX_LENGTH) {
                                return prev;
                                }

                        return prev + "Y";
                    });
                }
            }
        >
            Y
        </button>

        <button key="U-key"
                className={`h-10 w-10 ${
                pressedKey === "U"
                    ? uIsGreen() === "bg-green-400"
                        ? "bg-green-500"
                        : uIsGreen() === "bg-yellow-400"
                            ? "bg-yellow-500"
                            : "bg-gray-500"

                    : uIsGreen()
                }
                ${ // This is for hover effects
                    uIsGreen() === "bg-green-400"
                        ? "hover:bg-green-600"
                        : uIsGreen() === "bg-yellow-400"
                            ? "hover:bg-yellow-500"
                            : "hover:bg-gray-500"
                }`}
                onClick={
                    () => {
                        setText((prev) => {
                            if (hasWon || prev.length >= MAX_LENGTH) {
                                return prev;
                                }

                        return prev + "U";
                    });
                       }
                    }
                >
                    U
                </button>

        <button key="I-key"
                className={`h-10 w-10 ${
                pressedKey === "I" 
                    ? iIsGreen() === "bg-green-400"
                        ? "bg-green-500"
                        : iIsGreen() === "bg-yellow-400"
                            ? "bg-yellow-500"
                            : "bg-gray-500"

                    : iIsGreen()
                }
                ${ // This is for hover effects
                    iIsGreen() === "bg-green-400"
                        ? "hover:bg-green-600"
                        : iIsGreen() === "bg-yellow-400"
                            ? "hover:bg-yellow-500"
                            : "hover:bg-gray-500"
                }`}
                onClick={
                    () => {
                        setText((prev) => {
                            if (hasWon || prev.length >= MAX_LENGTH) {
                                return prev;
                                }

                        return prev + "I";
                    });
                }
            }
        >
            I
        </button>

        <button key="O-key"
                className={`h-10 w-10 ${
                pressedKey === "O"
                    ? oIsGreen() === "bg-green-400"
                        ? "bg-green-500"
                        : oIsGreen() === "bg-yellow-400"
                            ? "bg-yellow-500"
                            : "bg-gray-500"

                    : oIsGreen()
                }
                ${ // This is for hover effects
                    oIsGreen() === "bg-green-400"
                        ? "hover:bg-green-600"
                        : oIsGreen() === "bg-yellow-400"
                            ? "hover:bg-yellow-500"
                            : "hover:bg-gray-500"
                }`}
                onClick={
                    () => {
                        setText((prev) => {
                            if (hasWon || prev.length >= MAX_LENGTH) {
                                return prev;
                                }

                        return prev + "O";
                    });
                       }
                    }
                >
                    O
                </button>

        <button key="P-key"
                className={`h-10 w-10 ${
                pressedKey === "P" 
                    ? pIsGreen() === "bg-green-400"
                        ? "bg-green-500"
                        : pIsGreen() === "bg-yellow-400"
                            ? "bg-yellow-500"
                            : "bg-gray-500"

                    : pIsGreen()
                }
                ${ // This is for hover effects
                    pIsGreen() === "bg-green-400"
                        ? "hover:bg-green-600"
                        : pIsGreen() === "bg-yellow-400"
                            ? "hover:bg-yellow-500"
                            : "hover:bg-gray-500"
                }`}
                onClick={
                    () => {
                        setText((prev) => {
                            if (hasWon || prev.length >= MAX_LENGTH) {
                                return prev;
                                }

                        return prev + "P";
                        });
                    }
                }
            >
                P
            </button>
        </div>

    {/* Row 2 */}
        <div key={102} className="flex gap-2">
            <button key="A-key" 
            className={`h-10 w-10 ${
            pressedKey === "A"
                ? aIsGreen() === "bg-green-400"
                        ? "bg-green-500"
                        : aIsGreen() === "bg-yellow-400"
                            ? "bg-yellow-500"
                            : "bg-gray-500"

                    : aIsGreen()
                }
                ${ // This is for hover effects
                    aIsGreen() === "bg-green-400"
                        ? "hover:bg-green-600"
                        : aIsGreen() === "bg-yellow-400"
                            ? "hover:bg-yellow-500"
                            : "hover:bg-gray-500"
                }`}
            onClick={
                () => {
                    setText((prev) => {
                        if (hasWon || prev.length >= MAX_LENGTH) {
                            return prev;
                            }

                    return prev + "A";
                });
                    }
                }
            >
                A
            </button>
        
        <button key="S-key" 
            className={`h-10 w-10 ${
            pressedKey === "S"
                ? sIsGreen() === "bg-green-400"
                        ? "bg-green-500"
                        : sIsGreen() === "bg-yellow-400"
                            ? "bg-yellow-500"
                            : "bg-gray-500"

                    : sIsGreen()
                }
                ${ // This is for hover effects
                    sIsGreen() === "bg-green-400"
                        ? "hover:bg-green-600"
                        : sIsGreen() === "bg-yellow-400"
                            ? "hover:bg-yellow-500"
                            : "hover:bg-gray-500"
                }`}
            onClick={
                () => {
                    setText((prev) => {
                        if (hasWon || prev.length >= MAX_LENGTH) {
                            return prev;
                            }

                    return prev + "S";
                });
                    }
                }
            >
                S
            </button>

            <button key="D-key" 
            className={`h-10 w-10 ${
            pressedKey === "D"
                ? dIsGreen() === "bg-green-400"
                        ? "bg-green-500"
                        : dIsGreen() === "bg-yellow-400"
                            ? "bg-yellow-500"
                            : "bg-gray-500"

                    : dIsGreen()
                }
                ${ // This is for hover effects
                    dIsGreen() === "bg-green-400"
                        ? "hover:bg-green-600"
                        : dIsGreen() === "bg-yellow-400"
                            ? "hover:bg-yellow-500"
                            : "hover:bg-gray-500"
                }`}
            onClick={
                () => {
                    setText((prev) => {
                        if (hasWon || prev.length >= MAX_LENGTH) {
                            return prev;
                            }

                    return prev + "D";
                });
                    }
                }
            >
                D
            </button>

            <button key="F-key" 
            className={`h-10 w-10 ${
            pressedKey === "F"
                ? fIsGreen() === "bg-green-400"
                        ? "bg-green-500"
                        : fIsGreen() === "bg-yellow-400"
                            ? "bg-yellow-500"
                            : "bg-gray-500"

                    : fIsGreen()
                }
                ${ // This is for hover effects
                    fIsGreen() === "bg-green-400"
                        ? "hover:bg-green-600"
                        : fIsGreen() === "bg-yellow-400"
                            ? "hover:bg-yellow-500"
                            : "hover:bg-gray-500"
                }`}
            onClick={
                () => {
                    setText((prev) => {
                        if (hasWon || prev.length >= MAX_LENGTH) {
                            return prev;
                            }

                    return prev + "F";
                });
                    }
                }
            >
                F
            </button>

            <button key="G-key" 
            className={`h-10 w-10 ${
            pressedKey === "G"
                ? gIsGreen() === "bg-green-400"
                        ? "bg-green-500"
                        : gIsGreen() === "bg-yellow-400"
                            ? "bg-yellow-500"
                            : "bg-gray-500"

                    : gIsGreen()
                }
                ${ // This is for hover effects
                    gIsGreen() === "bg-green-400"
                        ? "hover:bg-green-600"
                        : gIsGreen() === "bg-yellow-400"
                            ? "hover:bg-yellow-500"
                            : "hover:bg-gray-500"
                }`}
            onClick={
                () => {
                    setText((prev) => {
                        if (hasWon || prev.length >= MAX_LENGTH) {
                            return prev;
                            }

                    return prev + "G";
                });
                    }
                }
            >
                G
            </button>

            <button key="H-key" 
            className={`h-10 w-10 ${
            pressedKey === "H"
                ? hIsGreen() === "bg-green-400"
                        ? "bg-green-500"
                        : hIsGreen() === "bg-yellow-400"
                            ? "bg-yellow-500"
                            : "bg-gray-500"

                    : hIsGreen()
                }
                ${ // This is for hover effects
                    hIsGreen() === "bg-green-400"
                        ? "hover:bg-green-600"
                        : hIsGreen() === "bg-yellow-400"
                            ? "hover:bg-yellow-500"
                            : "hover:bg-gray-500"
                }`}
            onClick={
                () => {
                    setText((prev) => {
                        if (hasWon || prev.length >= MAX_LENGTH) {
                            return prev;
                            }

                    return prev + "H";
                });
                    }
                }
            >
                H
            </button>

            <button key="J-key" 
            className={`h-10 w-10 ${
            pressedKey === "J"
                ? jIsGreen() === "bg-green-400"
                        ? "bg-green-500"
                        : jIsGreen() === "bg-yellow-400"
                            ? "bg-yellow-500"
                            : "bg-gray-500"

                    : jIsGreen()
                }
                ${ // This is for hover effects
                    jIsGreen() === "bg-green-400"
                        ? "hover:bg-green-600"
                        : jIsGreen() === "bg-yellow-400"
                            ? "hover:bg-yellow-500"
                            : "hover:bg-gray-500"
                }`}
            onClick={
                () => {
                    setText((prev) => {
                        if (hasWon || prev.length >= MAX_LENGTH) {
                            return prev;
                            }

                    return prev + "J";
                });
                    }
                }
            >
                J
            </button>

            <button key="K-key" 
            className={`h-10 w-10 ${
            pressedKey === "K"
                ? kIsGreen() === "bg-green-400"
                        ? "bg-green-500"
                        : kIsGreen() === "bg-yellow-400"
                            ? "bg-yellow-500"
                            : "bg-gray-500"

                    : kIsGreen()
                }
                ${ // This is for hover effects
                    kIsGreen() === "bg-green-400"
                        ? "hover:bg-green-600"
                        : kIsGreen() === "bg-yellow-400"
                            ? "hover:bg-yellow-500"
                            : "hover:bg-gray-500"
                }`}
            onClick={
                () => {
                    setText((prev) => {
                        if (hasWon || prev.length >= MAX_LENGTH) {
                            return prev;
                            }

                    return prev + "K";
                });
                    }
                }
            >
                K
            </button>

            <button key="L-key" 
            className={`h-10 w-10 ${
            pressedKey === "L"
                ? lIsGreen() === "bg-green-400"
                        ? "bg-green-500"
                        : lIsGreen() === "bg-yellow-400"
                            ? "bg-yellow-500"
                            : "bg-gray-500"

                    : lIsGreen()
                }
                ${ // This is for hover effects
                    lIsGreen() === "bg-green-400"
                        ? "hover:bg-green-600"
                        : lIsGreen() === "bg-yellow-400"
                            ? "hover:bg-yellow-500"
                            : "hover:bg-gray-500"
                }`}
            onClick={
                () => {
                    setText((prev) => {
                        if (hasWon || prev.length >= MAX_LENGTH) {
                            return prev;
                            }

                    return prev + "L";
                });
                    }
                }
            >
                L
            </button>
            
            {/* Delete */}
            <button 
                className={`h-10 w-12 pl-2 ${
                    pressedKey === "BACKSPACE"
                    ? "bg-red-500"
                    : "bg-gray-300"
                } hover:bg-red-500`}
                onClick={() => setText((prev) => prev.slice(0, -1))}
                > 

                <Delete size={32} aria-hidden="true"> </Delete>
            </button>

        </div>

        <div key={103} className="flex gap-2">
            <button key="Z-key" 
            className={`h-10 w-10 ${
            pressedKey === "Z"
                ? zIsGreen() === "bg-green-400"
                        ? "bg-green-500"
                        : zIsGreen() === "bg-yellow-400"
                            ? "bg-yellow-500"
                            : "bg-gray-500"

                    : zIsGreen()
                }
                ${ // This is for hover effects
                    zIsGreen() === "bg-green-400"
                        ? "hover:bg-green-600"
                        : zIsGreen() === "bg-yellow-400"
                            ? "hover:bg-yellow-500"
                            : "hover:bg-gray-500"
                }`}
            onClick={
                () => {
                    setText((prev) => {
                        if (hasWon || prev.length >= MAX_LENGTH) {
                            return prev;
                            }

                    return prev + "Z";
                });
                    }
                }
            >
                Z
            </button>

            <button key="X-key" 
            className={`h-10 w-10 ${
            pressedKey === "X"
                ? xIsGreen() === "bg-green-400"
                        ? "bg-green-500"
                        : xIsGreen() === "bg-yellow-400"
                            ? "bg-yellow-500"
                            : "bg-gray-500"

                    : xIsGreen()
                }
                ${ // This is for hover effects
                    xIsGreen() === "bg-green-400"
                        ? "hover:bg-green-600"
                        : xIsGreen() === "bg-yellow-400"
                            ? "hover:bg-yellow-500"
                            : "hover:bg-gray-500"
                }`}
            onClick={
                () => {
                    setText((prev) => {
                        if (hasWon || prev.length >= MAX_LENGTH) {
                            return prev;
                            }

                    return prev + "X";
                });
                    }
                }
            >
                X
            </button>

            <button key="C-key" 
            className={`h-10 w-10 ${
            pressedKey === "C"
                ? cIsGreen() === "bg-green-400"
                        ? "bg-green-500"
                        : cIsGreen() === "bg-yellow-400"
                            ? "bg-yellow-500"
                            : "bg-gray-500"

                    : cIsGreen()
                }
                ${ // This is for hover effects
                    cIsGreen() === "bg-green-400"
                        ? "hover:bg-green-600"
                        : cIsGreen() === "bg-yellow-400"
                            ? "hover:bg-yellow-500"
                            : "hover:bg-gray-500"
                }`}
            onClick={
                () => {
                    setText((prev) => {
                        if (hasWon || prev.length >= MAX_LENGTH) {
                            return prev;
                            }

                    return prev + "C";
                });
                    }
                }
            >
                C
            </button>

            <button key="V-key" 
            className={`h-10 w-10 ${
            pressedKey === "V"
                ? vIsGreen() === "bg-green-400"
                        ? "bg-green-500"
                        : vIsGreen() === "bg-yellow-400"
                            ? "bg-yellow-500"
                            : "bg-gray-500"

                    : vIsGreen()
                }
                ${ // This is for hover effects
                    vIsGreen() === "bg-green-400"
                        ? "hover:bg-green-600"
                        : vIsGreen() === "bg-yellow-400"
                            ? "hover:bg-yellow-500"
                            : "hover:bg-gray-500"
                }`}
            onClick={
                () => {
                    setText((prev) => {
                        if (hasWon || prev.length >= MAX_LENGTH) {
                            return prev;
                            }

                    return prev + "V";
                });
                    }
                }
            >
                V
            </button>

            <button key="B-key" 
            className={`h-10 w-10 ${
            pressedKey === "B"
                ? bIsGreen() === "bg-green-400"
                        ? "bg-green-500"
                        : bIsGreen() === "bg-yellow-400"
                            ? "bg-yellow-500"
                            : "bg-gray-500"

                    : bIsGreen()
                }
                ${ // This is for hover effects
                    bIsGreen() === "bg-green-400"
                        ? "hover:bg-green-600"
                        : bIsGreen() === "bg-yellow-400"
                            ? "hover:bg-yellow-500"
                            : "hover:bg-gray-500"
                }`}
            onClick={
                () => {
                    setText((prev) => {
                        if (hasWon || prev.length >= MAX_LENGTH) {
                            return prev;
                            }

                    return prev + "B";
                });
                    }
                }
            >
                B
            </button>

            <button key="N-key" 
            className={`h-10 w-10 ${
            pressedKey === "N"
                ? nIsGreen() === "bg-green-400"
                        ? "bg-green-500"
                        : nIsGreen() === "bg-yellow-400"
                            ? "bg-yellow-500"
                            : "bg-gray-500"

                    : nIsGreen()
                }
                ${ // This is for hover effects
                    nIsGreen() === "bg-green-400"
                        ? "hover:bg-green-600"
                        : nIsGreen() === "bg-yellow-400"
                            ? "hover:bg-yellow-500"
                            : "hover:bg-gray-500"
                }`}
            onClick={
                () => {
                    setText((prev) => {
                        if (hasWon || prev.length >= MAX_LENGTH) {
                            return prev;
                            }

                    return prev + "N";
                });
                    }
                }
            >
                N
            </button>

            <button key="M-key" 
            className={`h-10 w-10 ${
            pressedKey === "M"
                ? mIsGreen() === "bg-green-400"
                        ? "bg-green-500"
                        : mIsGreen() === "bg-yellow-400"
                            ? "bg-yellow-500"
                            : "bg-gray-500"

                    : mIsGreen()
                }
                ${ // This is for hover effects
                    mIsGreen() === "bg-green-400"
                        ? "hover:bg-green-600" // need to change logic for permanent color display of boxes
                        : mIsGreen() === "bg-yellow-400"
                            ? "hover:bg-yellow-500"
                            : "hover:bg-gray-500"
                }`}
            onClick={
                () => {
                    setText((prev) => {
                        if (hasWon || prev.length >= MAX_LENGTH) {
                            return prev;
                            }

                    return prev + "M";
                });
                    }
                }
            >
                M
            </button>

            {/* Enter */}
            <button 
                onClick={handleEnter}
                className={`h-10 w-25 ${
                    pressedKey === "ENTER" 
                        ? "bg-blue-400"
                        : "bg-gray-300"
                } hover:bg-blue-400`}
                > 
                ENTER
            </button>

            {/* Window for guessed word*/}
            {isOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/50" 
                onClick={() => setIsOpen(false)}
            >
                <div className="rounded-lg bg-white p-8 text-black">
                    <p className="text-xl">CONGRATS, THE CURRENT WORD IS '{validGuess}'!</p>
                    <p className="text-sm text-gray-600">A new word will be chosen in 10 seconds.</p>
                        <button onClick={() => setIsOpen(false)} className="bold text-red-800 text-xl hover:underline">
                            Back to Play
                        </button>

                </div>
            </div>
            )}
        </div>
    </div>
        </main>
        <Leaderboard/>
        <PlayerPresence/>
        </>
    )
}
