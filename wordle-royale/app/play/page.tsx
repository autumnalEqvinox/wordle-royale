
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
        </main>
        {/* <main className="justify-center p-82">
            <div className="grid grid-rows-10 gap-3">
                
            </div>
        </main>
        <main className="justify-center p-86">
            <div className="grid grid-rows-9 gap-3">
                
            </div>
        </main>
        <main className="justify-center p-90">
            <div className="grid grid-rows-7 gap-3">
                
            </div>
        </main> */}
        </>
    );
}