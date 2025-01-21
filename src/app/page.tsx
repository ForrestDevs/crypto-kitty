// import Canvas from "@/components/canvas";
import GameWrapper from "@/components/GameWrapper";

export default function Home() {
  return (
    <div className="grid grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-screen sm:px-6 md:px-8 pb-20 gap-8 font-[family-name:var(--font-geist-sans)] bg-gradient-to-b from-[#FFE4C4] to-[#CD853F]">
      <header className="flex flex-col items-center gap-4 w-full max-w-4xl mx-auto pt-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-purple-800 text-center">
          Crypto Kitty
        </h1>
        <p className="text-base sm:text-lg text-gray-600 text-center">
          Your virtual pet on the blockchain
        </p>
      </header>

      <main className="flex flex-col gap-8 items-center w-full max-w-6xl mx-auto">
        <div className="flex gap-6 flex-wrap justify-center max-w-4xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg w-full sm:w-[280px] min-h-[200px] flex flex-col">
            <h2 className="text-xl font-semibold mb-4 text-purple-800">
              Twitter
            </h2>
            <div className="text-gray-700 space-y-2 flex-grow">
              <p>Follow us for updates:</p>
              <a 
                href="https://twitter.com/cryptokitty" 
                className="text-blue-500 hover:text-blue-700 transition-colors"
              >
                @cryptokitty
              </a>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg w-full sm:w-[280px] min-h-[200px] flex flex-col">
            <h2 className="text-xl font-semibold mb-4 text-purple-800">
              How to Play
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 flex-grow">
              <li>Take care of your virtual kitty</li>
              <li>Feed kitty when hungry</li>
              <li>Clean kitty when dirty</li>
              <li>Let kitty sleep when tired</li>
            </ul>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg w-full sm:w-[280px] min-h-[200px] flex flex-col">
            <h2 className="text-xl font-semibold mb-4 text-purple-800">
              DEX Info
            </h2>
            <div className="text-gray-700 space-y-2 flex-grow">
              <p>Trade $KITTY:</p>
              <a 
                href="#" 
                className="text-green-500 hover:text-green-700 transition-colors"
              >
                View on DEX
              </a>
            </div>
          </div>
        </div>
        <GameWrapper />
      </main>
    </div>
  );
}
