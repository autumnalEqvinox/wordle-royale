export default function GamePlay() {
    return (
        <>
        <main className="flex justify-center p-14">
            <div className="grid grid-cols-5 grid-rows-6 gap-2">
                {Array.from({ length: 30 }, (_, index) => (
                    <div 
                        key={index}
                        className="flex h-15 w-15 items-center justify-center border-2 border-grey-500 text-3xl font-bold"
                    />
                ))}
            </div>
            {/* <div>
                <button>q</button>
                <button>w</button>
                <button>e</button>
                <button>r</button>
                <button>t</button>
            </div>
        </main> */}
        </main>
        
        </>
    )
}
