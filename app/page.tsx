import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <Image
        src="/wordle_royale.webp"
        alt="Wordle Royale Logo"
        width={200}
        height={200}
      />
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-4xl text-black font-bold mb-4">Wordle Royale</h1>

        <Link href="/login" className="mt-4 text-red-500 hover:underline">
          <button className="bg-red-500 text-black font-bold px-7.5 py-3 rounded-lg w-fit">
            LOG IN
          </button>
        </Link>

        <Link href="/signup" className="mt-4 text-blue-500 hover:underline">
          <button className="bg-blue-500 text-black font-bold px-6 py-3 rounded-lg w-fit mt-4">
          SIGN UP
          </button>
        </Link>

      </div>
      
    </div>
  );
}
