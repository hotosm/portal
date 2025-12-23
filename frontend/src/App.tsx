import Footer from "./components/Footer";
import Header from "./components/Header";
import { AppRoutes } from "./routes";

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="h-[68px] flex align-middle">
        <Header />
      </div>

      <main className="flex-1 flex flex-col justify-start">
        <AppRoutes />
      </main>

      <Footer />
    </div>
  );
}

export default App;
