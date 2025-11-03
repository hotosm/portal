import { useEffect } from "react";
import Lenis from "lenis";
import Footer from "./components/Footer";
import Header from "./components/Header";
import { AppRoutes } from "./routes";

function App() {
  useEffect(() => {
    // Initialize Lenis smooth scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
      smoothTouch: false,
    });

    // Request animation frame loop
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Cleanup
    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="container">
        <Header />
      </div>

      <main className="flex-1 flex flex-col justify-center">
        <AppRoutes />
        <div className="h-2xl"></div>
      </main>

      <Footer />
    </div>
  );
}

export default App;
