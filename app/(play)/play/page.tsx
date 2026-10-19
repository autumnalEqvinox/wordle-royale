"use client"

import { useState } from "react"
import { Delete } from "lucide-react"

export default function GamePlay() {
    const row1 = ["QWERTYUIOP"];
    const row2 = ["ASDFGHJKL"];
    const row3 = ["ZXCVBNM"];

    const [text, setText] = useState("");
    // check for 5 inputs, and submit when the text is 5, then build an array of 5 to 
    // display the inputs


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
                        {text[0]}

                    </div>
                ))}

                {/* Row 2 */}
                {Array.from({ length: 5 }, (_, index) => (
                    <div 
                        key={index}
                        className="flex h-15 w-15 items-center justify-center border-2 border-grey-500 text-3xl font-bold"
                    >

                    </div>
                ))}

                {/* Row 3 */}
                {Array.from({ length: 5 }, (_, index) => (
                    <div 
                        key={index}
                        className="flex h-15 w-15 items-center justify-center border-2 border-grey-500 text-3xl font-bold"
                    >
                        {text}

                    </div>
                ))}

                {/* Row 4 */}
                {Array.from({ length: 5 }, (_, index) => (
                    <div 
                        key={index}
                        className="flex h-15 w-15 items-center justify-center border-2 border-grey-500 text-3xl font-bold"
                    >
                        {text}

                    </div>
                ))}

                {/* Row 5 */}
                {Array.from({ length: 5 }, (_, index) => (
                    <div 
                        key={index}
                        className="flex h-15 w-15 items-center justify-center border-2 border-grey-500 text-3xl font-bold"
                    >
                        {text}

                    </div>
                ))}

                {/* Row 6 */}
                {Array.from({ length: 5 }, (_, index) => (
                    <div 
                        key={index}
                        className="flex h-15 w-15 items-center justify-center border-2 border-grey-500 text-3xl font-bold"
                    >
                        {text}

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
                                onClick={() => setText(letter)}
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
                                onClick={() => setText(letter)}
                            >
                                
                        {letter}
                    </button>
                ))}
                </div>
            ))}

            {row3.map((lett, index) => (
                    <div key={index} className="flex gap-2">
                        {lett.split("").map((letter) => (
                            <button key={letter} 
                                className="bg-gray-300 h-10 w-10 hover:bg-gray-500"
                                onClick={() => setText(letter)}
                            >
                                
                        {letter}
                    </button>
                ))}
                    {/* Delete */}
                    <button 
                        className="bg-gray-300 h-10 w-12 hover:bg-red-500"
                        >  <Delete size={32} aria-hidden="true"></Delete>
                    </button>

                    {/* Enter */}
                    <button 
                        className="bg-blue-200 h-10 w-25 hover:bg-blue-400"
                        > ENTER
                    </button>
                </div>
            ))}


        </div>
        </main>
        </>
    )
}
