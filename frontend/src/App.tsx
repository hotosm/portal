import { useEffect } from "react";
import Lenis from "lenis";
import Footer from "./components/Footer";
import Header from "./components/Header";
import { AppRoutes } from "./routes";

function App() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

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
