export default function ComingSoonPage() {
  return (
    <div className="min-h-screen bg-[#020202] flex items-center justify-center p-6 text-white relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="z-10 text-center max-w-2xl mx-auto space-y-8">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
          Coming Soon
        </h1>
        <p className="text-lg md:text-xl text-gray-400">
          We are building something extraordinary. Stay tuned for an experience that will change everything.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <input 
            type="email" 
            placeholder="Enter your email" 
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
          />
          <button className="w-full sm:w-auto px-8 py-3 rounded-full bg-white text-black font-medium hover:bg-gray-200 transition-colors">
            Notify Me
          </button>
        </div>

        <div className="pt-12 flex justify-center gap-6 text-gray-500">
          <a href="/login" className="hover:text-white transition-colors text-sm font-medium">
            Go to Login
          </a>
        </div>
      </div>
    </div>
  );
}
