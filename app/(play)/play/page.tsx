"use client"

import { useState, useEffect } from "react"
import { Delete } from "lucide-react"

export default function GamePlay() {
    const MAX_LENGTH = 5;
    
    const row1 = ["QWERTYUIOP"];
    const row2 = ["ASDFGHJKL"];
    const row3 = ["ZXCVBNM"];

    const [guessedText, setGuessedText] = useState<string[]>([]);
    const [text, setText] = useState("");
    // check for 5 inputs, and submit when the text is 5, then build an array of 5 to 
    // display the inputs

    // // make a list for the text
    // const [ length, setLength ] = useState();

    
    
      //this will listen for keyboard inputs 
      


    return (
        <>
        <main className="flex flex-col items-center p-14">
            <div className="grid grid-cols-5 grid-rows-6 gap-2">
                {/* Row 1 */}
                {Array.from({ length: 5 }, (_, index) => (
                    <div 
                        key={index}
                        className="flex h-15 w-15 items-center justify-center border-2 border-grey-500 text-3xl font-bold"
                    >
                        {
                        text.length == MAX_LENGTH && guessedText[0] == text
                            ? guessedText[0]
                            : text[index]
                        }

                    </div>
                ))}

                {/* Row 2 */}
                {Array.from({ length: 5 }, (_, index) => (
                    <div 
                        key={index}
                        className="flex h-15 w-15 items-center justify-center border-2 border-grey-500 text-3xl font-bold"
                    >
                        {guessedText.length == 1 ? text[index] : null}
                    </div>
                ))}

                {/* Row 3 */}
                {Array.from({ length: 5 }, (_, index) => (
                    <div 
                        key={index}
                        className="flex h-15 w-15 items-center justify-center border-2 border-grey-500 text-3xl font-bold"
                    >
                        {guessedText.length == 2 ? text[index] : null}

                    </div>
                ))}

                {/* Row 4 */}
                {Array.from({ length: 5 }, (_, index) => (
                    <div 
                        key={index}
                        className="flex h-15 w-15 items-center justify-center border-2 border-grey-500 text-3xl font-bold"
                    >
                        {guessedText.length == 3 ? text[index] : null}

                    </div>
                ))}

                {/* Row 5 */}
                {Array.from({ length: 5 }, (_, index) => (
                    <div 
                        key={index}
                        className="flex h-15 w-15 items-center justify-center border-2 border-grey-500 text-3xl font-bold"
                    >
                        {guessedText.length == 4 ? text[index] : null}

                    </div>
                ))}

                {/* Row 6 */}
                {Array.from({ length: 5 }, (_, index) => (
                    <div 
                        key={index}
                        className="flex h-15 w-15 items-center justify-center border-2 border-grey-500 text-3xl font-bold"
                    >
                        {guessedText.length == 5 ? text[index] : null}

                    </div>
                ))}

            </div>

            {/* {This is the keyboard buttons} */}
            <div className="flex flex-col items-center gap-2 mt-8">
                {row1.map((lett, index) => (
                    <div key={index} className="flex gap-2">
                        {lett.split("").map((letter) => (
                            <button key={letter} 
                                className="bg-gray-300 h-10 w-10 hover:bg-gray-500"
                                onClick={
                                    () => {
                                            setText((prev) => {
                                                    if (prev.length >= MAX_LENGTH) {
                                                        return prev;
                                                    }

                                                    return prev + letter;
                                            });
                                    }
                                }
                            >
                                
                        {letter}
                    </button>
                ))}
                </div>
            ))}

            {row2.map((lett, index) => (
                    <div key={index} className="flex gap-2">
                        {lett.split("").map((letter) => (
                            <button key={letter} 
                                className="bg-gray-300 h-10 w-10 hover:bg-gray-500"
                                onClick={
                                    () => {
                                            setText((prev) => {
                                                    if (prev.length >= MAX_LENGTH) {
                                                        return prev;
                                                    }

                                                    return prev + letter;
                                            });
                                    }
                                }
                                >
                                
                        {letter}
                    </button>
                ))}
                {/* Delete */}
                <button 
                    className="bg-gray-300 h-10 w-12 pl-2 hover:bg-red-500"
                    onClick={() => setText((prev) => prev.slice(0, -1))}
                    > 

                    <Delete size={32} aria-hidden="true"> </Delete>
                </button>
            </div>
            ))}

            {row3.map((lett, index) => (
                    <div key={index} className="flex gap-2">
                        {lett.split("").map((letter) => (
                            <button key={letter} 
                                className="bg-gray-300 h-10 w-10 hover:bg-gray-500"
                                onClick={
                                    () => {
                                            setText((prev) => {
                                                    if (prev.length >= MAX_LENGTH) {
                                                        return prev;
                                                    }

                                                    return prev + letter;
                                            });
                                    }
                                }
                                >
                                
                        {letter}
                    </button>
                ))}

                    {/* Enter */}
                    <button 
                        onClick={
                            () => {
                                if (text.length == MAX_LENGTH) {
                                  setGuessedText((prev) => [...prev, text]);
                                     }
                                 }
                            }
                        className="bg-gray-300 h-10 w-25 hover:bg-blue-400"
                        > ENTER
                    </button>
                </div>
            ))}


        </div>
        </main>
        </>
    )
}
