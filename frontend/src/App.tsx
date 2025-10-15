import Header from "./components/Header";
import { AppRoutes } from "./routes";
import "./styles/index.css";

function App() {
  return (
    <div className="container">
      <Header />

      <main>
        <AppRoutes />
      </main>
    </div>
  );
}

export default App;
