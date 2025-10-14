import { HealthCheck } from "./components/HealthCheck";
import Header from "./components/Header";
import "./styles/index.css";

function App() {
  // Mock user data - replace with actual auth state later
  const mockUser = {
    isAuthenticated: false, // Change to true to test authenticated state
    isManager: false, // Change to true to test manager features
    userName: "John Doe",
  };

  return (
    <div className="container">
      <Header
        isAuthenticated={mockUser.isAuthenticated}
        isManager={mockUser.isManager}
        userName={mockUser.userName}
      />

      <main
        style={{
          flex: 1,
          padding: "var(--hot-spacing-4x-large) var(--hot-spacing-medium)",
          maxWidth: "1280px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        <div
          style={{
            backgroundColor: "var(--hot-color-neutral-0)",
            padding: "var(--hot-spacing-3x-large)",
            borderRadius: "var(--hot-border-radius-large)",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          <h1
            style={{
              fontSize: "var(--hot-font-size-3x-large)",
              fontFamily: "var(--hot-font-sans-variant-condensed)",
              fontWeight: "var(--hot-font-weight-bold)",
              color: "var(--hot-color-gray-950)",
              textAlign: "center",
              marginBottom: "var(--hot-spacing-large)",
            }}
          >
            Welcome to HOT Portal
          </h1>

          <p
            style={{
              fontSize: "var(--hot-font-size-large)",
              fontFamily: "var(--hot-font-sans)",
              color: "var(--hot-color-gray-600)",
              textAlign: "center",
              marginBottom: "var(--hot-spacing-3x-large)",
              lineHeight: "var(--hot-line-height-normal)",
            }}
          >
            A unified entry point for the HOT Tech Suite ecosystem
          </p>

          <div
            style={{
              display: "flex",
              gap: "var(--hot-spacing-large)",
              justifyContent: "center",
              marginBottom: "var(--hot-spacing-3x-large)",
              flexWrap: "wrap",
            }}
          >
            <button className="btn-primary">Explore Projects</button>
            <button className="btn-secondary">Learn More</button>
          </div>

          <HealthCheck />
        </div>
      </main>

      <footer
        style={{
          backgroundColor: "var(--hot-color-gray-950)",
          color: "var(--hot-color-neutral-0)",
          padding: "var(--hot-spacing-2x-large) var(--hot-spacing-medium)",
          textAlign: "center",
          fontSize: "var(--hot-font-size-small)",
        }}
      >
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <p style={{ margin: 0 }}>
            Built with React 19, FastAPI, and PostgreSQL |{" "}
            <a
              href="/api/docs"
              style={{
                color: "var(--hot-color-primary-400)",
                textDecoration: "none",
              }}
              target="_blank"
              rel="noopener noreferrer"
            >
              API Docs
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
