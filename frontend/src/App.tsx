import Footer from "./components/Footer";
import Header from "./components/Header";
import { AppRoutes } from "./routes";

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="h-[100px] flex align-middle">
        <Header />
      </div>

      <main className="flex-1 flex flex-col justify-center">
        <AppRoutes />
      </main>

      <Footer />
    </div>
  );
}

export default App;
