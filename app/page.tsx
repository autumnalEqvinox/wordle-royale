import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <div className="flex flex-col items-center justify-center">
              <Image
                className="flex flex-col items-center justify-center"
                src="/wordle_royale.webp"
                alt="Wordle Royale Logo"
                width={500}
                height={500}
              />
        <Link href="/login" className="mt-4 text-red-500 hover:underline">
          <button className="bg-green-500 text-black font-bold px-7.5 py-3 rounded-lg w-fit">
            LOG IN
          </button>
        </Link>

        <Link href="/signup" className="mt-4 text-blue-500 hover:underline">
          <button className="bg-yellow-500 text-black font-bold px-6 py-3 rounded-lg w-fit mt-4">
          SIGN UP
          </button>
        </Link>

      </div>
      
    </div>
  );
}
