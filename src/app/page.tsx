// import Canvas from "@/components/canvas";
import GameWrapper from "@/components/GameWrapper";

export default function Home() {
  return (
    <div className="grid grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-screen font-[family-name:var(--font-geist-sans)] bg-black">
      <header className="absolute top-5 left-1/2 -translate-x-1/2 flex flex-col items-center justify-center gap-4 max-w-4xl mx-auto z-10 bg-zinc-200/50 backdrop-blur-sm p-6 rounded-2xl">
        <div className="flex items-center gap-8">
          <a href="https://twitter.com/cryptokitty" className="text-blue-500 hover:text-blue-600 transition-colors">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
            </svg>
          </a>
          <h1 className="text-3xl sm:text-4xl font-bold text-purple-800 text-center">
            Crypto Kitty
          </h1>
          <a href="#" className="text-green-500 hover:text-green-600 transition-colors">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21.92,11.6C21.92,5.9,17.2,1.18,11.5,1.18S1.08,5.9,1.08,11.6s4.72,10.42,10.42,10.42S21.92,17.3,21.92,11.6z M11.5,19.52 c-4.37,0-7.92-3.55-7.92-7.92s3.55-7.92,7.92-7.92s7.92,3.55,7.92,7.92S15.87,19.52,11.5,19.52z M15.06,8.54l-1.71-0.99L12,6.17 L10.65,7.55L8.94,8.54L8.94,11.5l0,2.96l1.71,0.99L12,16.83l1.35-1.38l1.71-0.99V11.5L15.06,8.54z M13.85,13.46l-1.85,1.07l-1.85-1.07 v-3.92l1.85-1.07l1.85,1.07V13.46z"/>
            </svg>
          </a>
        </div>
        <p className="text-base sm:text-lg text-black text-center">
          Your virtual pet on the blockchain
        </p>
      </header>

      <main className="flex flex-col gap-8 items-center w-full max-w-[1275px]">
        {/* <div className="flex gap-6 flex-wrap justify-center max-w-4xl mx-auto">
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
        </div> */}
        <GameWrapper />
      </main>
    </div>
  );
}
