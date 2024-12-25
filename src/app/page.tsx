import Canvas from "@/components/canvas";

export default function Home() {
  return (
    <div className="grid grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-screen p-8 pb-20 gap-8 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-gradient-to-b from-blue-100 to-purple-100">
      <header className="flex flex-col items-center gap-4">
        <h1 className="text-4xl font-bold text-purple-800">Crypto Kitty</h1>
        <p className="text-lg text-gray-600">Your virtual pet on the blockchain</p>
      </header>

      <main className="flex flex-col gap-8 items-center w-full max-w-4xl">
        <Canvas />
        
        <div className="flex gap-6 flex-wrap justify-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-purple-800">How to Play</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Take care of your virtual kitty</li>
              <li>Feed it when hungry</li>
              <li>Clean it when dirty</li>
              <li>Let it sleep when tired</li>
            </ul>
          </div>
        </div>
      </main>

      <footer className="flex gap-6 flex-wrap items-center justify-center text-sm text-gray-600">
        <p>© 2024 Crypto Kitty</p>
        <a 
          href="#" 
          className="hover:text-purple-800 transition-colors"
        >
          Terms of Service
        </a>
        <a 
          href="#" 
          className="hover:text-purple-800 transition-colors"
        >
          Privacy Policy
        </a>
      </footer>
    </div>
  );
}
