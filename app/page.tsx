export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between text-sm">
        <div className="text-center mb-8">
          <div className="mx-auto h-20 w-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl flex items-center justify-center mb-6">
            <span className="text-3xl font-bold text-white">W</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-center mb-4">
            Welcome to Wyzly
          </h1>
          <p className="text-center text-base sm:text-lg text-gray-600 mb-8">
            Discover amazing food boxes from local restaurants
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/feed"
            className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 transition-all shadow-lg"
          >
            Browse Food Boxes
          </a>
          <a
            href="/login"
            className="inline-flex items-center justify-center px-8 py-4 border-2 border-orange-500 text-base font-medium rounded-xl text-orange-500 bg-white hover:bg-orange-50 transition-all"
          >
            Sign In
          </a>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="p-6">
            <div className="text-4xl mb-4">🍱</div>
            <h3 className="font-semibold text-gray-900 mb-2">Quality Food</h3>
            <p className="text-gray-600 text-sm">Curated boxes from top local restaurants</p>
          </div>
          <div className="p-6">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="font-semibold text-gray-900 mb-2">Quick Ordering</h3>
            <p className="text-gray-600 text-sm">Order in seconds, pick up when ready</p>
          </div>
          <div className="p-6">
            <div className="text-4xl mb-4">💝</div>
            <h3 className="font-semibold text-gray-900 mb-2">Great Value</h3>
            <p className="text-gray-600 text-sm">Premium meals at affordable prices</p>
          </div>
        </div>
      </div>
    </main>
  );
}