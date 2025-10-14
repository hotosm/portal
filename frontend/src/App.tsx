import { HealthCheck } from "./components/HealthCheck";
import Header from "./components/Header";
import "./styles/index.css";

function App() {
  return (
    <div className="container">
      <Header />

      <main>
        <HealthCheck />
      </main>
    </div>
  );
}

export default App;
