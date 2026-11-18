"use client"

import KeyboardDetector from "@/features/KeyboardDetector";
import PlayerPresence from "@/components/PlayerSession";
import { useState, useEffect, useRef } from "react";
import { Delete } from "lucide-react";
import Leaderboard from "@/components/Leaderboard";
import { auth, db } from "@/app/lib/firebase";
import {
    doc,
    updateDoc,
    getDoc,
    query,
    increment,
    collection,
    serverTimestamp,
    orderBy,
    onSnapshot,
    runTransaction,
    where
} from "firebase/firestore";
import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { isValidWord, getRandomWord } from "@/features/validWords";

type GuessFeedItem = {
    id: string;
    username: string;
    word: string;
};

export default function GamePlay() {
    // round winner constants  
    const [roundWinner, setRoundWinner] = useState<{
    roundId: number;
    name: string;
    word: string;
} | null>(null);
    // additional timer constants 
    const [resetAtMs, setResetAtMs] = useState<number | null>(null);
    // this exists to change the length of the word if need be
    const [MAX_LENGTH, setMaxLength] = useState<number>(5);
    
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [secondsLeft, setSecondsLeft] = useState<number>(10); // visible countdown shown in the win popup

    // need to store guesses in the database, and display the last 5 recent on the
    // the screen, so the letter colors can still work and change
    const [guessedText, setGuessedText] = useState<string[]>([]);
    const [guessFeed, setGuessFeed] = useState<GuessFeedItem[]>([]);
    const usernameCache = useRef(new Map<string, Promise<string>>());
    const guessFeedContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const feedContainer = guessFeedContainerRef.current;
        if (feedContainer) {
            feedContainer.scrollTop = feedContainer.scrollHeight;
        }
    }, [guessFeed]);

    // get the last 5 guesses from guessedText by getting the max between 0 (starting), and the max length - 5
    const guessedTextLength = Math.max(0, guessedText.length-5);

    const [text, setText] = useState("");
    const [pressedKey, setPressedKey] = useState("");
    const [validGuess, setValidGuess] = useState("HOWDY"); // API call ???


    const [userId, setUserId] = useState<string | null>(null);

    const [curRoundId, setCurRoundId] = useState<number | null>(null);

    // three states - gray, green, or yellow
    // const word_state = ["gray", "gray", "gray", "gray", "gray"];

    // count how many letters are in the word and then set the failsafe to display for yellow

    // game/word in Firestore holds the word everyone is trying to guess (field: currentWord) 
    // generates random UID for new round (field: roundId) whenever saveWord() is called to store a new word in Firestore
    const [hasWon, setHasWon] = useState(false);

    const savingGuess = useRef(false);

    // {/* Yellow indicator */}
    // const letterChecker = (letter: string) => {
    //     let count = 0;

    //     for (let i = 0; i < 5; i++) {
    //         if (!validGuess[i].includes(letter)) {
    //             return 0;
    //         } else if (validGuess[i] === letter) {
    //             count += 0;
    //         } else {
    //             count ++;
    //         }
    //     }

    //     return count;
    // }

    
    {/* Grab each letter and return how many duplicates, and then save
        each of the values for each of the rows */}

    const letterDuplicateCheck = (letter: string, row: number, box: number) => {
        const guess = guessedText[row];
        let count = 0;
        for (const answerLetter of validGuess) {
            if (answerLetter === letter) {
                count++;
            }
        }

        for (let i = 0; i < guess.length; i++) {
            if (guess[i] === letter && (validGuess[i] === letter || i < box)) {
                count--;
            }
        }

        return count > 0;
    };


    // on load, use the stored word, or pick and store one if there is none yet
    useEffect(() => {
    if (!userId) return;

    const unsubscribe = onSnapshot(
        doc(db, "game", "word"),
        (snapshot) => {
            const saved = snapshot.data()?.currentWord;

            if (typeof saved === "string" && isValidWord(saved)) {
                setValidGuess(saved);
            } else {
                console.error("No valid word in Firestore");
            }
        },
        (error) => {
            console.error("Failed to load game/word", error);
        }
    );


    // want to check what round it is on in the database, 
    // and then if there is no curRoundId, then initialize it
    

        return () => unsubscribe();
    }, [userId]);

    

    // after a win, wait 10 seconds, then clear the board and pick a new word
    // updated to match with new round storing system: curRoundId -> finishedRoundId, saves new word and increments currentRoomID in one transaction, clears board and closes the win popup after the transaction completes, removes validGuess from dependency array (word update alone doesn't restart countdown )
    // there was reset errors so I had to add additional logic for timing 
    useEffect(() => {
        if (!hasWon || curRoundId === null || resetAtMs === null) return;

        const finishedRoundId = curRoundId;
        const remainingMs = () => Math.max(0, resetAtMs - Date.now());

        setSecondsLeft(Math.ceil(remainingMs() / 1000));

        const ticker = setInterval(() => {
            setSecondsLeft(Math.ceil(remainingMs() / 1000));
        }, 1000);

        const timer = setTimeout(async () => {
            const roomRef = doc(db, "rooms", "round-1");
            const wordRef = doc(db, "game", "word");
            const setHasWonRef = doc(db, "game", "has_won");
            
            try {
                
                await runTransaction(db, async(transaction) => {
                    const roomSnapshot = await transaction.get(roomRef);
                    const room = roomSnapshot.data();
                    if (
                        room?.currentRoomID !== finishedRoundId || 
                        room?.status !== "won" || 
                        room?.resetAtMs !== resetAtMs
                    ) {
                        return;
                    }

                    const wordSnapshot = await transaction.get(wordRef);
                    const currentWord = wordSnapshot.data()?.currentWord;
                    if (typeof currentWord !== "string") {
                        throw new Error("Word missing from db");
                    }
                    
                    transaction.set(wordRef, {currentWord: getRandomWord(currentWord), roundId: crypto.randomUUID(),}, {merge: true});
                    transaction.update(roomRef, {currentRoomID: finishedRoundId + 1, status:"on-going", winnerID:null, winnerName:null, winningWord: null, resetAtMs:null});
                });
                setGuessedText([]);
                setText("");
                setIsOpen(false);
                setHasWon(false);
                
                await updateDoc(
                    setHasWonRef, {
                        won: false
                    }
                );
            } catch (error) {
                console.error("error resetting round", error);
            }
        }, remainingMs());
        return () => {
            clearTimeout(timer); // cancel if the page is left before the 10 seconds are up
            clearInterval(ticker);
        };
    }, [hasWon, curRoundId, resetAtMs]);



    async function initializePlayer(user: User) {
        const playerRef = doc(db, "playerStats", user.uid);

        await runTransaction(db, async (transaction) => {
            const player = await transaction.get(playerRef);
            if (player.exists()) return;

            transaction.set(playerRef, {
                username: user.displayName || "Player",
                wins: 0,
                totalGuesses: 0,
                totalGames: 0,
                lastPlayedRoundId: null,
            });
        });
    }
    
    // user Initialization activaes when a user joins
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUserId(user?.uid ?? null)
            
            if (user) {
                void initializePlayer(user).catch((error) => {
                    console.error("error initializing player:", error);
                }); 
            }
        });
        return () => unsubscribe();
    }, []);


    // list all of the guesses from oldest to newest (last 5 guesses)
    useEffect(() => {
        if (!userId || curRoundId === null) return;

        let isActive = true;
        const queryOfGuesses = query(
            collection(db, "rooms", "round-1", "guesses"),
            where("roundId", "==", curRoundId),
            orderBy("submittedAt", "asc")
        );

        const unsubscribe = onSnapshot(
            queryOfGuesses, // use the query and display a 'snapshot' of the last guesses
            (snapshot) => {
                const guesses = snapshot.docs.flatMap((document) => {
                    const data = document.data();
                    if (typeof data.word !== "string") return [];

                    return [{
                        id: document.id,
                        word: data.word,
                        submittedBy: typeof data.submittedBy === "string"
                            ? data.submittedBy
                            : null,
                    }];
                });
                setGuessedText(guesses.map((guess) => guess.word));
                setGuessFeed(guesses.map(({ id, word }) => ({
                    id,
                    word,
                    username: "Loading...",
                })));

                void Promise.all(guesses.map(async (guess) => {
                    const submittedBy = guess.submittedBy;
                    if (!submittedBy) {
                        return { id: guess.id, username: "Player" };
                    }

                    let usernameRequest = usernameCache.current.get(submittedBy);
                    if (!usernameRequest) {
                        usernameRequest = getDoc(doc(db, "playerStats", submittedBy))
                            .then((playerSnapshot) => {
                                const username = playerSnapshot.data()?.username;
                                return typeof username === "string" && username.trim()
                                    ? username
                                    : "Player";
                            })
                            .catch((error: unknown) => {
                                usernameCache.current.delete(submittedBy);
                                throw error;
                            });
                        usernameCache.current.set(submittedBy, usernameRequest);
                    }

                    try {
                        return {
                            id: guess.id,
                            username: await usernameRequest,
                        };
                    } catch (error) {
                        console.error(`Failed to load username for ${submittedBy}:`, error);
                        return { id: guess.id, username: "Player" };
                    }
                })).then((resolvedUsernames) => {
                    if (!isActive) return;
                    setGuessFeed((currentFeed) => currentFeed.map((item) => {
                        const resolved = resolvedUsernames.find(({ id }) => id === item.id);
                        return resolved ? { ...item, username: resolved.username } : item;
                    }));
                });
            },
            (error) => { // if there is an error grabbing the guesses, throw an error
                console.error("Error with loading guesses:", error);
            }
        );

        return () => {
            isActive = false;
            unsubscribe();
        };
    }, [userId, curRoundId]);


    {/* set the round number id to the recent one for rooms/main */}
    useEffect(() => {
        if (!userId) return;

        const unsubscribe = onSnapshot(
            doc(db, "rooms", "round-1"),
            (snapshot) => {
                const room = snapshot.data();
                const roundId = room?.currentRoomID;
                const won = room?.status === "won";
                const deadline = room?.resetAtMs;

                setCurRoundId(typeof roundId === "number" ? roundId : null);
                setHasWon(won);
                setResetAtMs(won && typeof deadline === "number" ? deadline : null);
                setRoundWinner(
                    won && typeof roundId === "number"
                        ? {
                            roundId,
                            name:
                                typeof room?.winnerName === "string"
                                    ? room.winnerName
                                    : "player",
                            word: 
                                typeof room?.winningWord === "string"
                                    ? room.winningWord
                                    : "",
                        }
                        : null
                );

                setIsOpen(won);
                // just to see why the currentRoomID isn't working: 
                console.log("Room exists:", snapshot.exists());
                console.log("Room data:", snapshot.data());
                console.log("Round ID:", snapshot.data()?.currentRoomID);
                console.log("Round ID type:", typeof snapshot.data()?.currentRoomID);

            },
            (error) => {
                console.error("Error loading current round:", error);
            }
        );

        return unsubscribe;
    }, [userId]);


    // Save the guess and update player statistics.
    async function savePlayerGuess(word: string) {
        const user = auth.currentUser;
        const roundId = curRoundId;

        if (!user || roundId === null) return false;
        await initializePlayer(user);

        const roomRef = doc(db, "rooms", "round-1");
        const wordRef = doc(db, "game", "word");
        const playerRef = doc(db, "playerStats", user.uid);
        const guessRef = doc(collection(roomRef, "guesses"));
        const resultRef = doc(db, "rooms", "round-1", "roundResults", String(roundId));

        return runTransaction(db, async (transaction) => {
            const room = (await transaction.get(roomRef)).data();
            const player = (await transaction.get(playerRef)).data();
            const game = (await transaction.get(wordRef)).data();

            if (room?.currentRoomID !== roundId || room.status !== "on-going") {
                return false;
            }

            if (!player || typeof game?.currentWord !== "string") {
                throw new Error("Word/ player is missing");
            }

            const isCorrect = word ===game.currentWord;
            const winnerName = player.username || user.displayName || "Player";

            const firstGuessThisRound = player?.lastPlayedRoundId !== roundId;

            transaction.set(guessRef, {
                word,
                submittedBy: user.uid,
                roundId,
                submittedAt: serverTimestamp(),
            });

            transaction.set(playerRef, {
                totalGuesses: increment(1),
                wins: increment(isCorrect ? 1 : 0),
                ...(firstGuessThisRound
                    ? { totalGames: increment(1), lastPlayedRoundId: roundId }
                    : {}),
            }, { merge: true });

            if (isCorrect) {
                transaction.update(roomRef, {
                status: "won",
                winnerID: user.uid,
                winnerName,
                winningWord: word,
                resetAtMs: Date.now() + 10_000,
            });

            transaction.set(resultRef, {
                roundId,
                winnerID: user.uid,
                winnerName,
                winningWord: word,
                winningGuessID: guessRef.id,
                wonAt: serverTimestamp(),
            })
        }
            return true;
        });
    }

    // Handle Enter from the keyboard or on-screen button.
    const handleEnter = async () => {
        if (hasWon || savingGuess.current) return;

        if (!userId) {
            alert("You must be signed in.");
            return;
        }

        // if (currentRoundId === null) {
        //     alert("The current round has not loaded.");
        //     return;
        // }

        if (curRoundId === null || text.length !== MAX_LENGTH) return;

        if (text === guessedText[guessedText.length - 1]) {
            alert("No duplicates.");
            return;
        }

        if (!isValidWord(text)) {
            alert("Not in word list");
            return;
        }

        const word = text;
        savingGuess.current = true; 

        // reference for hasWon reference
        const setHasWonRef = doc(db, "game", "has_won");

        try { 
            const saved = await savePlayerGuess(word);
            if (!saved) {
                alert("No more guessing");
                return;
            }
            setText((current) => current === word ? "" : current);

        } catch (error) {
            console.error("couldn't save guess:", error);
            alert("Couldn't save guess. Please try again");
        } finally {
            savingGuess.current = false; 
        }
    };
        

        // gonna have to change the code from instead of guessedText last 5 guesses, 
        //       I need to adjust to check for every word. probably just keep the state of before and 
        // then update the letters over time. like keeping a state of 5 letters, and then
        // sending and updating it over time, saves space and code


        {/*  for loop to check how many letter are in the valid word  */}



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

    const greenLetterDisplay = (placement: number) => {
        // our placement is a check comparison with every letter 
        // in that column to the valid guess, 
        // and if it is ever true, then show 
        // it on the top for everyone to see
        let isGreen = false;

        for (let columnNumber=0; columnNumber < guessedText.length; columnNumber++) {
            if (
                guessedText[columnNumber][placement] === validGuess[placement]
            ) {
                isGreen = true;
            }
        }

        // should return true or false to use to determine 
        // if it is good to display the correct letter to help 
        // everyone out
        return isGreen;
    };


    // maybe have it where if there are any yellows not in those spots, return how many, and run one pull for each one
    // if validWord[0] == green, skip; if gray, skip; if yellow, do a frequency and show how many are valid

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
            {/* p-14 */}
        <main className="grid grid-cols-1 items-start lg:grid-cols-[minmax(0,1fr)_332px_minmax(0,1fr)] lg:gap-x-6">
            <div className="flex flex-col items-center lg:col-start-2">
            {/* Countdown shown on the page itself while waiting for the next word */}
            {hasWon && (
                <p className="mb-4 text-xl font-bold">
                    New word in {secondsLeft} {secondsLeft === 1 ? "second" : "seconds"}...
                </p>
            )}

            {/* show the valid letters once they are guessed */}
            <div className="flex grid grid-cols-5 grid-rows-1 gap-2 py-2">
                <div className={`flex h-15 w-15 items-center justify-center ${greenLetterDisplay(0) ? "border-2" : ""} text-3xl font-bold text-green-500`}>
                    {
                        greenLetterDisplay(0)
                            ? validGuess[0]
                            : ""
                    }
                </div>

            <div className={`flex h-15 w-15 items-center justify-center ${greenLetterDisplay(1) ? "border-2" : ""} text-3xl font-bold text-green-500`}>
                    {
                        greenLetterDisplay(1)
                            ? validGuess[1]
                            : ""
                    }
                </div>

            <div className={`flex h-15 w-15 items-center justify-center ${greenLetterDisplay(2) ? "border-2" : ""} text-3xl font-bold text-green-500`}>
                    {
                        greenLetterDisplay(2)
                            ? validGuess[2]
                            : ""
                    }
                </div>

            <div className={`flex h-15 w-15 items-center justify-center ${greenLetterDisplay(3) ? "border-2" : ""} text-3xl font-bold text-green-500`}>
                    {
                        greenLetterDisplay(3)
                            ? validGuess[3]
                            : ""
                    }
                </div>

            <div className={`flex h-15 w-15 items-center justify-center ${greenLetterDisplay(4) ? "border-2" : ""} text-3xl font-bold text-green-500`}>
                    {
                        greenLetterDisplay(4)
                            ? validGuess[4]
                            : ""
                    }
                </div>
        </div>

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
                                : !letterDuplicateCheck(guessedText[guessedTextLength][0], guessedTextLength, 0)
                                    ? "bg-gray-400"
                                    : "bg-yellow-400"
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
                                : !letterDuplicateCheck(guessedText[guessedTextLength][1], guessedTextLength, 1)
                                    ? "bg-gray-400"
                                    : "bg-yellow-400"
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
                                : !letterDuplicateCheck(guessedText[guessedTextLength][2], guessedTextLength, 2)
                                    ? "bg-gray-400"
                                    : "bg-yellow-400"
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
                                : !letterDuplicateCheck(guessedText[guessedTextLength][3], guessedTextLength, 3)
                                    ? "bg-gray-400"
                                    : "bg-yellow-400"
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
                                : !letterDuplicateCheck(guessedText[guessedTextLength][4], guessedTextLength, 4)
                                    ? "bg-gray-400"
                                    : "bg-yellow-400"
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
                                : !letterDuplicateCheck(guessedText[guessedTextLength+1][0], guessedTextLength+1, 0)
                                    ? "bg-gray-400"
                                    : "bg-yellow-400"
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
                                : !letterDuplicateCheck(guessedText[guessedTextLength+1][1], guessedTextLength+1, 1)
                                    ? "bg-gray-400"
                                    : "bg-yellow-400"
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
                                : !letterDuplicateCheck(guessedText[guessedTextLength+1][2], guessedTextLength+1, 2)
                                    ? "bg-gray-400"
                                    : "bg-yellow-400"
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
                                : !letterDuplicateCheck(guessedText[guessedTextLength+1][3], guessedTextLength+1, 3)
                                    ? "bg-gray-400"
                                    : "bg-yellow-400"
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
                                : !letterDuplicateCheck(guessedText[guessedTextLength+1][4], guessedTextLength+1, 4)
                                    ? "bg-gray-400"
                                    : "bg-yellow-400"
                            }`}
                    >
                    {/* 
                        Add some hidden feature that when clicked 
                            shows some accomplishment, 
                            or gives a hint 
                            or does something really mean 
                    */}

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
                                : !letterDuplicateCheck(guessedText[guessedTextLength+2][0], guessedTextLength+2, 0)
                                    ? "bg-gray-400"
                                    : "bg-yellow-400"
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
                                : !letterDuplicateCheck(guessedText[guessedTextLength+2][1], guessedTextLength+2, 1)
                                    ? "bg-gray-400"
                                    : "bg-yellow-400"
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
                                : !letterDuplicateCheck(guessedText[guessedTextLength+2][2], guessedTextLength+2, 2)
                                    ? "bg-gray-400"
                                    : "bg-yellow-400"
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
                                : !letterDuplicateCheck(guessedText[guessedTextLength+2][3], guessedTextLength+2, 3)
                                    ? "bg-gray-400"
                                    : "bg-yellow-400"
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
                                : !letterDuplicateCheck(guessedText[guessedTextLength+2][4], guessedTextLength+2, 4)
                                    ? "bg-gray-400"
                                    : "bg-yellow-400"
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
                                : !letterDuplicateCheck(guessedText[guessedTextLength+3][0], guessedTextLength+3, 0)
                                    ? "bg-gray-400"
                                    : "bg-yellow-400"
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
                                : !letterDuplicateCheck(guessedText[guessedTextLength+3][1], guessedTextLength+3, 1)
                                    ? "bg-gray-400"
                                    : "bg-yellow-400"
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
                                : !letterDuplicateCheck(guessedText[guessedTextLength+3][2], guessedTextLength+3, 2)
                                    ? "bg-gray-400"
                                    : "bg-yellow-400"
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
                                : !letterDuplicateCheck(guessedText[guessedTextLength+3][3], guessedTextLength+3, 3)
                                    ? "bg-gray-400"
                                    : "bg-yellow-400"
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
                                : !letterDuplicateCheck(guessedText[guessedTextLength+3][4], guessedTextLength+3, 4)
                                    ? "bg-gray-400"
                                    : "bg-yellow-400"
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
                                : !letterDuplicateCheck(guessedText[guessedTextLength+4][0], guessedTextLength+4, 0)
                                    ? "bg-gray-400"
                                    : "bg-yellow-400"
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
                                : !letterDuplicateCheck(guessedText[guessedTextLength+4][1], guessedTextLength+4, 1)
                                    ? "bg-gray-400"
                                    : "bg-yellow-400"
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
                                : !letterDuplicateCheck(guessedText[guessedTextLength+4][2], guessedTextLength+4, 2)
                                    ? "bg-gray-400"
                                    : "bg-yellow-400"
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
                                : !letterDuplicateCheck(guessedText[guessedTextLength+4][3], guessedTextLength+4, 3)
                                    ? "bg-gray-400"
                                    : "bg-yellow-400"
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
                                : !letterDuplicateCheck(guessedText[guessedTextLength+4][4], guessedTextLength+4, 4)
                                    ? "bg-gray-400"
                                    : "bg-yellow-400"
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
        <div className="flex flex-col items-center gap-2 mt-8 w-full max-w-full">
            <div key={100} className="flex w-full justify-center gap-1 sm:gap-2">
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
        <div key={102} className="flex w-full justify-center gap-1 sm:gap-2">
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

        <div key={103} className="flex w-full justify-center gap-1 sm:gap-2">
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
            {isOpen && hasWon && roundWinner && (

            <div className="fixed inset-0 flex items-center justify-center bg-black/50" 
                onClick={() => setIsOpen(false)}
            >
                <div className="rounded-lg bg-white p-8 text-black">
                    <p className="text-xl">{roundWinner.name} has won round {roundWinner.roundId}!</p>
                    <p> Word was {roundWinner.word} </p>
                    <p className="text-sm text-gray-600">A new word will be chosen in {secondsLeft} {secondsLeft === 1 ? "second" : "seconds"}.</p>
                        <button onClick={() => setIsOpen(false)} className="bold text-red-800 text-xl hover:underline">
                            Back to Play
                        </button>

                </div>
            </div>
            )}
        </div>
    </div>
            </div>
        {userId && curRoundId !== null && (
            <section
                aria-label="Guess feed"
                className="mt-6 w-full max-w-sm border border-gray-400 p-3 lg:col-start-3 lg:row-start-1 lg:mt-24"
            >
                <h2 className="mb-2 font-semibold">Guess feed</h2>
                <div
                    ref={guessFeedContainerRef}
                    className="max-h-80 overflow-y-auto pr-3"
                    aria-live="polite"
                >
                    {guessFeed.length === 0 ? (
                        <p className="text-sm text-gray-500">No guesses yet.</p>
                    ) : (
                        guessFeed.map(({ id, username, word }) => (
                            <div
                                key={id}
                                className="flex items-center justify-between gap-4 border-b border-gray-200 py-2 last:border-b-0"
                            >
                                <span className="truncate">{username}</span>
                                <span className="shrink-0 font-mono">{word}</span>
                            </div>
                        ))
                    )}
                </div>
            </section>
        )}
        </main>
        <Leaderboard/>
        <PlayerPresence/>
        </>
    )
}
