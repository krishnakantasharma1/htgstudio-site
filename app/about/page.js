export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-md max-w-2xl text-center">
        <div className="flex items-center justify-center gap-3 mb-6">
          <img
            src="/logo.png"
            alt="Hi-Tech Gamerz Logo"
            className="h-14 w-14 rounded-full"
          />
          <span className="text-2xl font-bold text-gray-700">×</span>
          <img
            src="/logo2.png"
            alt="Scripto Tweaks Logo"
            className="h-14 w-14 rounded-full"
          />
        </div>

        <h1 className="text-3xl font-extrabold text-gray-800 mb-4">
          About Us
        </h1>

        <p className="text-gray-600 leading-relaxed">
          We’re the creators behind <span className="font-semibold text-gray-800">Hi-Tech Gamerz</span> and{" "}
          <span className="font-semibold text-gray-800">Scripto Tweaks</span> — two
          passionate minds dedicated to fixing lags, improving performance, and
          exploring every corner of Android optimization.
        </p>

        <p className="text-gray-600 leading-relaxed mt-4">
          Together, we’re building a course that cuts out all the noise and
          brings you every real method, tweak, and tool you can use to make your
          phone perform like never before — no myths, no pointless talk, just
          pure results.
        </p>

        <p className="text-gray-600 leading-relaxed mt-4">
          Our mission is simple: help you unlock the full potential of your
          device and truly understand how it works — because once you learn the
          “why”, you’ll never need another tutorial again.
        </p>

        <p className="text-gray-800 font-medium mt-6">
          Let’s take your phone beyond ordinary. 🚀
        </p>
      </div>
    </div>
  );
}