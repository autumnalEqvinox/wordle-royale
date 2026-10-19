

export default function GamePlay() {
    const rows = [
        "QWERTYUIOP", 
        "ASDFGHJKL", 
        "ZXCVBNM"
    ];

    return (
        <>
        <main className="flex flex-col items-center p-14">
            <div className="grid grid-cols-5 grid-rows-6 gap-2">
                {Array.from({ length: 30 }, (_, index) => (
                    <div 
                        key={index}
                        className="flex h-15 w-15 items-center justify-center border-2 border-grey-500 text-3xl font-bold"
                    />
                ))}
            </div>

            {/* {This is the keyboard buttons} */}
            <div className="flex flex-col items-center gap-2 mt-8">
                {rows.map((row, index) => (
                    <div key={index} className="flex gap-2">
                        {row.split("").map((letter) => (
                            <button key={letter} className="bg-gray-300 h-10 w-10 ">
                        {letter}
                    </button>
                ))}
                </div>
            ))}
        </div>
        </main>
        </>
    )
}
