"use client"

import KeyboardDetector from "@/features/KeyboardDetector"
import { useState } from "react"
import { Delete } from "lucide-react"

export default function GamePlay() {
    const MAX_LENGTH = 5;
    
    const row1 = ["QWERTYUIOP"];
    const row2 = ["ASDFGHJKL"];
    const row3 = ["ZXCVBNM"];

    const [guessedText, setGuessedText] = useState<string[]>([]);
    const [text, setText] = useState("");
    const [pressedKey, setPressedKey] = useState("");
    const validGuess = "QUOTE";

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
            text={text}
            setText={setText}
            setSubmitted={setGuessedText}
            setPressedKey={setPressedKey}
        />
        <main className="flex flex-col items-center p-14">
            <div className="grid grid-cols-5 grid-rows-6 gap-2">
                {/* Row 1 */}

                <div 
                    key={0}
                    className={`flex h-15 w-15 items-center justify-center border-2 border-grey-500 text-3xl font-bold
                    ${
                        !guessedText[0]?.[0]
                            ? ""
                            : validGuess[0] === guessedText[0][0]
                                ? "bg-green-400"
                                : validGuess.includes(guessedText[0][0])
                                    ? "bg-yellow-400"
                                    : validGuess[0] != guessedText[0][0]
                                        ? "bg-gray-400"
                                        : ""
                    }`}
                >
                    
                    {guessedText[0] != null && guessedText[0] != "" // checks to see if there is a submission
                        ? guessedText[0][0] // display the submitted word for this row
                        : guessedText.length == 0 // if there is not a submission
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
                        !guessedText[0]?.[1]
                            ? ""
                            : validGuess[1] === guessedText[0][1]
                                ? "bg-green-400"
                                : validGuess.includes(guessedText[0][1])
                                    ? "bg-yellow-400"
                                    : validGuess[1] != guessedText[0][1]
                                        ? "bg-gray-400"
                                        : ""
                    }`}
                    >
                    {guessedText[0] != null && guessedText[0] != "" 
                        ? guessedText[0][1] 
                        : guessedText.length == 0
                            ? text[1] 
                            : ""
                            }

                    </div>

                    <div 
                    key={2}
                    className={`flex h-15 w-15 items-center justify-center border-2 border-grey-500 text-3xl font-bold
                    ${
                        !guessedText[0]?.[2]
                            ? ""
                            : validGuess[2] === guessedText[0][2]
                                ? "bg-green-400"
                                : validGuess.includes(guessedText[0][2])
                                    ? "bg-yellow-400"
                                    : validGuess[2] != guessedText[0][2]
                                        ? "bg-gray-400"
                                        : ""
                    }`}
                    >
                    {guessedText[0] != null && guessedText[0] != "" 
                        ? guessedText[0][2] 
                        : guessedText.length == 0
                            ? text[2]
                            : ""
                            }
                    </div>

                    <div 
                    key={3}
                    className={`flex h-15 w-15 items-center justify-center border-2 border-grey-500 text-3xl font-bold
                    ${
                        !guessedText[0]?.[3]
                            ? ""
                            : validGuess[3] === guessedText[0][3]
                                ? "bg-green-400"
                                : validGuess.includes(guessedText[0][3])
                                    ? "bg-yellow-400"
                                    : validGuess[3] != guessedText[0][3]
                                        ? "bg-gray-400"
                                        : ""
                    }`}
                    >
                    {guessedText[0] != null && guessedText[0] != "" 
                        ? guessedText[0][3] 
                        : guessedText.length == 0
                            ? text[3]
                            : ""
                            }
                    </div>

                    <div 
                    key={4}
                    className={`flex h-15 w-15 items-center justify-center border-2 border-grey-500 text-3xl font-bold
                    ${
                        !guessedText[0]?.[4]
                            ? ""
                            : validGuess[4] === guessedText[0][4]
                                ? "bg-green-400"
                                : validGuess.includes(guessedText[0][4])
                                    ? "bg-yellow-400"
                                    : validGuess[4] != guessedText[0][4]
                                        ? "bg-gray-400"
                                        : ""
                    }`}
                    >
                    {guessedText[0] != null && guessedText[0] != "" 
                        ? guessedText[0][4] 
                        : guessedText.length == 0
                            ? text[4]
                            : ""
                            }
                    </div>

                {/* Row 2 */}
           <div 
                    key={5}
                    className={`flex h-15 w-15 items-center justify-center border-2 border-grey-500 text-3xl font-bold
                    ${
                        !guessedText[1]?.[0]
                            ? ""
                            : validGuess[0] === guessedText[1][0]
                                ? "bg-green-400"
                                : validGuess.includes(guessedText[1][0])
                                    ? "bg-yellow-400"
                                    : validGuess[0] != guessedText[1][0]
                                        ? "bg-gray-400"
                                        : ""
                    }`}
                    >
                    {guessedText[1] != null && guessedText[1] != "" 
                        ? guessedText[1][0] 
                        : guessedText.length == 1
                            ? text[0]
                            : ""
                            }

                    </div>

                    <div 
                    key={6}
                    className={`flex h-15 w-15 items-center justify-center border-2 border-grey-500 text-3xl font-bold
                    ${
                        !guessedText[1]?.[1]
                            ? ""
                            : validGuess[1] === guessedText[1][1]
                                ? "bg-green-400"
                                : validGuess.includes(guessedText[1][1])
                                    ? "bg-yellow-400"
                                    : validGuess[1] != guessedText[1][1]
                                        ? "bg-gray-400"
                                        : ""
                    }`}
                    >

                    {guessedText[1] != null && guessedText[1] != "" 
                        ? guessedText[1][1] 
                        : guessedText.length == 1
                            ? text[1]
                            : ""
                            }

                    </div>

                    <div 
                    key={7}
                    className={`flex h-15 w-15 items-center justify-center border-2 border-grey-500 text-3xl font-bold
                    ${
                        !guessedText[1]?.[2]
                            ? ""
                            : validGuess[2] === guessedText[1][2]
                                ? "bg-green-400"
                                : validGuess.includes(guessedText[1][2])
                                    ? "bg-yellow-400"
                                    : validGuess[2] != guessedText[1][2]
                                        ? "bg-gray-400"
                                        : ""
                    }`}
                    >
                    {guessedText[1] != null && guessedText[1] != "" 
                        ? guessedText[1][2] 
                        : guessedText.length == 1
                            ? text[2]
                            : ""
                            }
                    </div>

                    <div 
                    key={8}
                    className={`flex h-15 w-15 items-center justify-center border-2 border-grey-500 text-3xl font-bold
                    ${
                        !guessedText[1]?.[3]
                            ? ""
                            : validGuess[3] === guessedText[1][3]
                                ? "bg-green-400"
                                : validGuess.includes(guessedText[1][3])
                                    ? "bg-yellow-400"
                                    : validGuess[3] != guessedText[1][3]
                                        ? "bg-gray-400"
                                        : ""
                    }`}
                    >
                    {guessedText[1] != null && guessedText[1] != "" 
                        ? guessedText[1][3] 
                        : guessedText.length == 1
                            ? text[3]
                            : ""
                            }
                    </div>

                    <div 
                    key={9}
                    className={`flex h-15 w-15 items-center justify-center border-2 border-grey-500 text-3xl font-bold
                    ${
                        !guessedText[1]?.[4]
                            ? ""
                            : validGuess[4] === guessedText[1][4]
                                ? "bg-green-400"
                                : validGuess.includes(guessedText[1][4])
                                    ? "bg-yellow-400"
                                    : validGuess[4] != guessedText[1][4]
                                        ? "bg-gray-400"
                                        : ""
                    }`}
                    >
                    {guessedText[1] != null && guessedText[1] != "" 
                        ? guessedText[1][4] 
                        : guessedText.length == 1
                            ? text[4]
                            : ""
                            }
                    </div>


                {/* Row 3 */}
                <div 
                    key={10}
                    className={`flex h-15 w-15 items-center justify-center border-2 border-grey-500 text-3xl font-bold
                    ${
                        !guessedText[2]?.[0]
                            ? ""
                            : validGuess[0] === guessedText[2][0]
                                ? "bg-green-400"
                                : validGuess.includes(guessedText[2][0])
                                    ? "bg-yellow-400"
                                    : validGuess[0] != guessedText[2][0]
                                        ? "bg-gray-400"
                                        : ""
                    }`}
                    >
                    {guessedText[2] != null && guessedText[2] != "" 
                        ? guessedText[2][0] 
                        : guessedText.length == 2
                            ? text[0]
                            : ""
                            }

                    </div>

                    <div 
                    key={11}
                    className={`flex h-15 w-15 items-center justify-center border-2 border-grey-500 text-3xl font-bold
                    ${
                        !guessedText[2]?.[1]
                            ? ""
                            : validGuess[1] === guessedText[2][1]
                                ? "bg-green-400"
                                : validGuess.includes(guessedText[2][1])
                                    ? "bg-yellow-400"
                                    : validGuess[1] != guessedText[2][1]
                                        ? "bg-gray-400"
                                        : ""
                    }`}
                    >
                    {guessedText[2] != null && guessedText[2] != "" 
                        ? guessedText[2][1] 
                        : guessedText.length == 2
                            ? text[1]
                            : ""
                            }

                    </div>

                    <div 
                    key={12}
                    className={`flex h-15 w-15 items-center justify-center border-2 border-grey-500 text-3xl font-bold
                    ${
                        !guessedText[2]?.[2]
                            ? ""
                            : validGuess[2] === guessedText[2][2]
                                ? "bg-green-400"
                                : validGuess.includes(guessedText[2][2])
                                    ? "bg-yellow-400"
                                    : validGuess[2] != guessedText[2][2]
                                        ? "bg-gray-400"
                                        : ""
                    }`}
                    >
                    {guessedText[2] != null && guessedText[2] != "" 
                        ? guessedText[2][2] 
                        : guessedText.length == 2
                            ? text[2]
                            : ""
                            }
                    </div>

                    <div 
                    key={13}
                    className={`flex h-15 w-15 items-center justify-center border-2 border-grey-500 text-3xl font-bold
                    ${
                        !guessedText[2]?.[3]
                            ? ""
                            : validGuess[3] === guessedText[2][3]
                                ? "bg-green-400"
                                : validGuess.includes(guessedText[2][3])
                                    ? "bg-yellow-400"
                                    : validGuess[3] != guessedText[2][3]
                                        ? "bg-gray-400"
                                        : ""
                    }`}
                    >
                    {guessedText[2] != null && guessedText[2] != "" 
                        ? guessedText[2][3] 
                        : guessedText.length == 2
                            ? text[3]
                            : ""
                            }

                    </div>

                    <div 
                    key={14}
                    className={`flex h-15 w-15 items-center justify-center border-2 border-grey-500 text-3xl font-bold
                    ${
                        !guessedText[2]?.[4]
                            ? ""
                            : validGuess[4] === guessedText[2][4]
                                ? "bg-green-400"
                                : validGuess.includes(guessedText[2][4])
                                    ? "bg-yellow-400"
                                    : validGuess[4] != guessedText[2][4]
                                        ? "bg-gray-400"
                                        : ""
                    }`}
                    >
                    {guessedText[2] != null && guessedText[2] != "" 
                        ? guessedText[2][4] 
                        : guessedText.length == 2
                            ? text[4]
                            : ""
                            }

                    </div>

                {/* Row 4 */}
                <div 
                    key={15}
                    className={`flex h-15 w-15 items-center justify-center border-2 border-grey-500 text-3xl font-bold
                    ${
                        !guessedText[3]?.[0]
                            ? ""
                            : validGuess[0] === guessedText[3][0]
                                ? "bg-green-400"
                                : validGuess.includes(guessedText[3][0])
                                    ? "bg-yellow-400"
                                    : validGuess[0] != guessedText[3][0]
                                        ? "bg-gray-400"
                                        : ""
                    }`}
                    >
                    {guessedText[3] != null && guessedText[3] != "" 
                        ? guessedText[3][0] 
                        : guessedText.length == 3
                            ? text[0]
                            : ""
                            }

                    </div>

                    <div 
                    key={16}
                    className={`flex h-15 w-15 items-center justify-center border-2 border-grey-500 text-3xl font-bold
                    ${
                        !guessedText[3]?.[1]
                            ? ""
                            : validGuess[1] === guessedText[3][1]
                                ? "bg-green-400"
                                : validGuess.includes(guessedText[3][1])
                                    ? "bg-yellow-400"
                                    : validGuess[1] != guessedText[3][1]
                                        ? "bg-gray-400"
                                        : ""
                    }`}
                    >
                    {guessedText[3] != null && guessedText[3] != "" 
                        ? guessedText[3][1] 
                        : guessedText.length == 3
                            ? text[1]
                            : ""
                            }

                    </div>

                    <div 
                    key={17}
                    className={`flex h-15 w-15 items-center justify-center border-2 border-grey-500 text-3xl font-bold
                    ${
                        !guessedText[3]?.[2]
                            ? ""
                            : validGuess[2] === guessedText[3][2]
                                ? "bg-green-400"
                                : validGuess.includes(guessedText[3][2])
                                    ? "bg-yellow-400"
                                    : validGuess[2] != guessedText[3][2]
                                        ? "bg-gray-400"
                                        : ""
                    }`}
                    >
                    {guessedText[3] != null && guessedText[3] != "" 
                        ? guessedText[3][2] 
                        : guessedText.length == 3
                            ? text[2]
                            : ""
                            }
                    </div>

                    <div 
                    key={18}
                    className={`flex h-15 w-15 items-center justify-center border-2 border-grey-500 text-3xl font-bold
                    ${
                        !guessedText[3]?.[3]
                            ? ""
                            : validGuess[3] === guessedText[3][3]
                                ? "bg-green-400"
                                : validGuess.includes(guessedText[3][3])
                                    ? "bg-yellow-400"
                                    : validGuess[3] != guessedText[3][3]
                                        ? "bg-gray-400"
                                        : ""
                    }`}
                    >
                    {guessedText[3] != null && guessedText[3] != "" 
                        ? guessedText[3][3] 
                        : guessedText.length == 3
                            ? text[3]
                            : ""
                            }
                    </div>

                    <div 
                    key={19}
                    className={`flex h-15 w-15 items-center justify-center border-2 border-grey-500 text-3xl font-bold
                    ${
                        !guessedText[3]?.[4]
                            ? ""
                            : validGuess[4] === guessedText[3][4]
                                ? "bg-green-400"
                                : validGuess.includes(guessedText[3][4])
                                    ? "bg-yellow-400"
                                    : validGuess[4] != guessedText[3][4]
                                        ? "bg-gray-400"
                                        : ""
                    }`}
                    >
                    {guessedText[3] != null && guessedText[3] != "" 
                        ? guessedText[3][4] 
                        : guessedText.length == 3
                            ? text[4]
                            : ""
                            }
                    </div>

                {/* Row 5 */}
                <div 
                    key={20}
                    className={`flex h-15 w-15 items-center justify-center border-2 border-grey-500 text-3xl font-bold
                    ${
                        !guessedText[4]?.[0]
                            ? ""
                            : validGuess[0] === guessedText[4][0]
                                ? "bg-green-400"
                                : validGuess.includes(guessedText[4][0])
                                    ? "bg-yellow-400"
                                    : validGuess[0] != guessedText[4][0]
                                        ? "bg-gray-400"
                                        : ""
                    }`}
                    >
                    {guessedText[4] != null && guessedText[4] != "" 
                        ? guessedText[4][0] 
                        : guessedText.length == 4
                            ? text[0]
                            : ""
                            }

                    </div>

                    <div 
                    key={21}
                    className={`flex h-15 w-15 items-center justify-center border-2 border-grey-500 text-3xl font-bold
                    ${
                        !guessedText[4]?.[1]
                            ? ""
                            : validGuess[1] === guessedText[4][1]
                                ? "bg-green-400"
                                : validGuess.includes(guessedText[4][1])
                                    ? "bg-yellow-400"
                                    : validGuess[1] != guessedText[4][1]
                                        ? "bg-gray-400"
                                        : ""
                    }`}
                    >
                    {guessedText[4] != null && guessedText[4] != "" 
                        ? guessedText[4][1] 
                        : guessedText.length == 4
                            ? text[1]
                            : ""
                            }

                    </div>

                    <div 
                    key={22}
                    className={`flex h-15 w-15 items-center justify-center border-2 border-grey-500 text-3xl font-bold
                    ${
                        !guessedText[4]?.[2]
                            ? ""
                            : validGuess[2] === guessedText[4][2]
                                ? "bg-green-400"
                                : validGuess.includes(guessedText[4][2])
                                    ? "bg-yellow-400"
                                    : validGuess[2] != guessedText[4][2]
                                        ? "bg-gray-400"
                                        : ""
                    }`}
                    >
                    {guessedText[4] != null && guessedText[4] != "" 
                        ? guessedText[4][2] 
                        : guessedText.length == 4
                            ? text[2]
                            : ""
                            }

                    </div>

                    <div 
                    key={23}
                    className={`flex h-15 w-15 items-center justify-center border-2 border-grey-500 text-3xl font-bold
                    ${
                        !guessedText[4]?.[3]
                            ? ""
                            : validGuess[3] === guessedText[4][3]
                                ? "bg-green-400"
                                : validGuess.includes(guessedText[4][3])
                                    ? "bg-yellow-400"
                                    : validGuess[3] != guessedText[4][3]
                                        ? "bg-gray-400"
                                        : ""
                    }`}
                    >
                    {guessedText[4] != null && guessedText[4] != "" 
                        ? guessedText[4][3] 
                        : guessedText.length == 4
                            ? text[3]
                            : ""
                            }

                    </div>

                    <div 
                    key={24}
                    className={`flex h-15 w-15 items-center justify-center border-2 border-grey-500 text-3xl font-bold
                    ${
                        !guessedText[4]?.[4]
                            ? ""
                            : validGuess[4] === guessedText[4][4]
                                ? "bg-green-400"
                                : validGuess.includes(guessedText[4][4])
                                    ? "bg-yellow-400"
                                    : validGuess[4] != guessedText[4][4]
                                        ? "bg-gray-400"
                                        : ""
                    }`}
                    >
                    {guessedText[4] != null && guessedText[4] != "" 
                        ? guessedText[4][4] 
                        : guessedText.length == 4
                            ? text[4]
                            : ""
                            }

                    </div>

                {/* Row 6 */}
                <div 
                    key={25}
                    className={`flex h-15 w-15 items-center justify-center border-2 border-grey-500 text-3xl font-bold
                    ${
                        !guessedText[5]?.[0]
                            ? ""
                            : validGuess[0] === guessedText[5][0]
                                ? "bg-green-400"
                                : validGuess.includes(guessedText[5][0])
                                    ? "bg-yellow-400"
                                    : validGuess[0] != guessedText[5][0]
                                        ? "bg-gray-400"
                                        : ""
                    }`}
                    >
                    {guessedText[5] != null && guessedText[5] != "" 
                        ? guessedText[5][0] 
                        : guessedText.length == 5
                            ? text[0]
                            : ""
                            }

                    </div>

                    <div 
                    key={26}
                    className={`flex h-15 w-15 items-center justify-center border-2 border-grey-500 text-3xl font-bold
                    ${
                        !guessedText[5]?.[1]
                            ? ""
                            : validGuess[1] === guessedText[5][1]
                                ? "bg-green-400"
                                : validGuess.includes(guessedText[5][1])
                                    ? "bg-yellow-400"
                                    : validGuess[1] != guessedText[5][1]
                                        ? "bg-gray-400"
                                        : ""
                    }`}
                    >
                    {guessedText[5] != null && guessedText[5] != "" 
                        ? guessedText[5][1] 
                        : guessedText.length == 5
                            ? text[1]
                            : ""
                            }


                    </div>

                    <div 
                    key={27}
                    className={`flex h-15 w-15 items-center justify-center border-2 border-grey-500 text-3xl font-bold
                    ${
                        !guessedText[5]?.[2]
                            ? ""
                            : validGuess[2] === guessedText[5][2]
                                ? "bg-green-400"
                                : validGuess.includes(guessedText[5][2])
                                    ? "bg-yellow-400"
                                    : validGuess[2] != guessedText[5][2]
                                        ? "bg-gray-400"
                                        : ""
                    }`}
                    >
                    {guessedText[5] != null && guessedText[5] != "" 
                        ? guessedText[5][2] 
                        : guessedText.length == 5
                            ? text[2]
                            : ""
                            }

                    </div>

                    <div 
                    key={28}
                    className={`flex h-15 w-15 items-center justify-center border-2 border-grey-500 text-3xl font-bold
                    ${
                        !guessedText[5]?.[3]
                            ? ""
                            : validGuess[3] === guessedText[5][3]
                                ? "bg-green-400"
                                : validGuess.includes(guessedText[5][3])
                                    ? "bg-yellow-400"
                                    : validGuess[3] != guessedText[5][3]
                                        ? "bg-gray-400"
                                        : ""
                    }`}
                    >
                    {guessedText[5] != null && guessedText[5] != "" 
                        ? guessedText[5][3] 
                        : guessedText.length == 5
                            ? text[3]
                            : ""
                            }

                    </div>

                    <div 
                    key={29}
                    className={`flex h-15 w-15 items-center justify-center border-2 border-grey-500 text-3xl font-bold
                    ${
                        !guessedText[5]?.[4]
                            ? ""
                            : validGuess[4] === guessedText[5][4]
                                ? "bg-green-400"
                                : validGuess.includes(guessedText[5][4])
                                    ? "bg-yellow-400"
                                    : validGuess[4] != guessedText[5][4]
                                        ? "bg-gray-400"
                                        : ""
                    }`}
                    >
                    {guessedText[5] != null && guessedText[5] != "" 
                        ? guessedText[5][4] 
                        : guessedText.length == 5
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
                    ? "bg-gray-500"

                    // default color -- bg-gray-300
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
                            if (prev.length >= MAX_LENGTH) {
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
                    ? "bg-gray-500"
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
                            if (prev.length >= MAX_LENGTH) {
                                return prev;
                                }

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
                    ? "bg-gray-500"
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
                            if (prev.length >= MAX_LENGTH) {
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
                    ? "bg-gray-500"
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
                            if (prev.length >= MAX_LENGTH) {
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
                    ? "bg-gray-500"
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
                            if (prev.length >= MAX_LENGTH) {
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
                    ? "bg-gray-500"
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
                            if (prev.length >= MAX_LENGTH) {
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
                    ? "bg-gray-500"
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
                            if (prev.length >= MAX_LENGTH) {
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
                    ? "bg-gray-500"
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
                            if (prev.length >= MAX_LENGTH) {
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
                    ? "bg-gray-500"
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
                            if (prev.length >= MAX_LENGTH) {
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
                    ? "bg-gray-500"
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
                            if (prev.length >= MAX_LENGTH) {
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
                ? "bg-gray-500"
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
                        if (prev.length >= MAX_LENGTH) {
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
                ? "bg-gray-500"
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
                        if (prev.length >= MAX_LENGTH) {
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
                ? "bg-gray-500"
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
                        if (prev.length >= MAX_LENGTH) {
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
                ? "bg-gray-500"
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
                        if (prev.length >= MAX_LENGTH) {
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
                ? "bg-gray-500"
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
                        if (prev.length >= MAX_LENGTH) {
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
                ? "bg-gray-500"
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
                        if (prev.length >= MAX_LENGTH) {
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
                ? "bg-gray-500"
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
                        if (prev.length >= MAX_LENGTH) {
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
                ? "bg-gray-500"
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
                        if (prev.length >= MAX_LENGTH) {
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
                ? "bg-gray-500"
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
                        if (prev.length >= MAX_LENGTH) {
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
                ? "bg-gray-500"
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
                        if (prev.length >= MAX_LENGTH) {
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
                ? "bg-gray-500"
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
                        if (prev.length >= MAX_LENGTH) {
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
                ? "bg-gray-500"
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
                        if (prev.length >= MAX_LENGTH) {
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
                ? "bg-gray-500"
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
                        if (prev.length >= MAX_LENGTH) {
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
                ? "bg-gray-500"
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
                        if (prev.length >= MAX_LENGTH) {
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
                ? "bg-gray-500"
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
                        if (prev.length >= MAX_LENGTH) {
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
                ? "bg-gray-500"
                : mIsGreen()
            } 
                ${ // This is for hover effects
                    mIsGreen() === "bg-green-400"
                        ? "hover:bg-green-600"
                        : mIsGreen() === "bg-yellow-400"
                            ? "hover:bg-yellow-500"
                            : "hover:bg-gray-500"
                }`}
            onClick={
                () => {
                    setText((prev) => {
                        if (prev.length >= MAX_LENGTH) {
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
                onClick={
                    () => {
                        if (text.length >= MAX_LENGTH) {
                            setGuessedText((prev) => [...prev, text]);
                            setText(() => "")
                            }
                            }
                    }
                className={`h-10 w-25 ${
                    pressedKey === "ENTER" 
                        ? "bg-blue-400"
                        : "bg-gray-300"
                } hover:bg-blue-400`}
                > ENTER
            </button>
        </div>
    </div>
        </main>
        </>
    )
}
