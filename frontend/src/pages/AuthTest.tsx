import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import Card from "../components/shared/Card";
import Button from "../components/shared/Button";
import Icon from "../components/shared/Icon";

interface TestResult {
  success: boolean;
  status: number;
  data?: any;
  error?: string;
}

function AuthTest() {
  const { user, osmConnection } = useAuth();
  const [testResults, setTestResults] = useState<{
    [key: string]: TestResult | null;
  }>({
    me: null,
    osm: null,
  });

  const [loading, setLoading] = useState<{ [key: string]: boolean }>({
    me: false,
    osm: false,
  });

  const testEndpoint = async (endpoint: string) => {
    setLoading((prev) => ({ ...prev, [endpoint]: true }));

    try {
      const response = await fetch(`/api/test/${endpoint}`, {
        credentials: "include",
      });

      const data = await response.json();

      setTestResults((prev) => ({
        ...prev,
        [endpoint]: {
          success: response.ok,
          status: response.status,
          data: response.ok ? data : undefined,
          error: !response.ok ? data.detail : undefined,
        },
      }));
    } catch (error) {
      setTestResults((prev) => ({
        ...prev,
        [endpoint]: {
          success: false,
          status: 0,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      }));
    } finally {
      setLoading((prev) => ({ ...prev, [endpoint]: false }));
    }
  };

  return (
    <div className="container-xl py-lg">
      <div className="mb-lg">
        <h1>Auth Integration Test</h1>
        <p className="text-muted">
          Test the backend authentication endpoints with different auth states.
        </p>
      </div>

      {/* Current Auth State */}
      <div className="mb-lg">
        <h2 className="mb-md">Current Authentication State</h2>
        <div className="grid gap-md" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <Card
            style={{
              border: user
                ? "4px solid #10b981"
                : "4px solid #ef4444",
            }}
          >
            <div className="flex items-center gap-sm mb-xs">
              <Icon
                name={user ? "check-circle" : "circle-xmark"}
                style={{
                  color: user ? "#10b981" : "#ef4444",
                  fontSize: "1.5rem",
                }}
              />
              <span className="font-semibold" style={{ color: "#1f2937" }}>
                Hanko Authentication
              </span>
            </div>
            {user ? (
              <div className="text-sm" style={{ color: "#4b5563" }}>
                <div>
                  <strong>User ID:</strong> {user.id}
                </div>
                <div>
                  <strong>Email:</strong> {user.email || "N/A"}
                </div>
                <div>
                  <strong>Username:</strong> {user.username || "N/A"}
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted">Not logged in</div>
            )}
          </Card>

          <Card
            style={{
              border: osmConnection
                ? "4px solid #10b981"
                : "4px solid #ef4444",
            }}
          >
            <div className="flex items-center gap-sm mb-xs">
              <Icon
                name={osmConnection ? "check-circle" : "circle-xmark"}
                style={{
                  color: osmConnection ? "#10b981" : "#ef4444",
                  fontSize: "1.5rem",
                }}
              />
              <span className="font-semibold" style={{ color: "#1f2937" }}>
                OSM Connection
              </span>
            </div>
            {osmConnection ? (
              <div className="text-sm" style={{ color: "#4b5563" }}>
                <div>
                  <strong>OSM Username:</strong> {osmConnection.osm_username}
                </div>
                <div>
                  <strong>OSM User ID:</strong> {osmConnection.osm_user_id}
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted">Not connected</div>
            )}
          </Card>
        </div>
      </div>

      {/* Test Endpoints */}
      <div className="grid gap-lg" style={{ gridTemplateColumns: "1fr 1fr" }}>
        {/* Endpoint 1: /api/test/me */}
        <Card>
          <div className="mb-md">
            <h3 className="mb-xs">
              <code className="text-sm">/api/test/me</code>
            </h3>
            <p className="text-sm text-muted">Requires Hanko authentication</p>
          </div>

          <Button
            appearance="outlined"
            onClick={() => testEndpoint("me")}
            disabled={loading.me}
            className="w-full mb-md"
          >
            <Icon slot="start" name={loading.me ? "spinner" : "play"} />
            {loading.me ? "Testing..." : "Test Endpoint"}
          </Button>

          {testResults.me && (
            <div className="p-md bg-neutral-50 rounded mb-md">
              <div className="flex items-center gap-sm mb-xs">
                <Icon
                  name={testResults.me.success ? "check-circle" : "circle-xmark"}
                  style={{
                    color: testResults.me.success
                      ? "var(--wa-color-green-600)"
                      : "var(--wa-color-red-600)",
                  }}
                />
                <span className="font-semibold">
                  Status: {testResults.me.status}
                </span>
              </div>
              <pre className="text-xs m-0 overflow-auto">
                {JSON.stringify(
                  testResults.me.data || { error: testResults.me.error },
                  null,
                  2
                )}
              </pre>
            </div>
          )}

          <details className="mt-md">
            <summary className="cursor-pointer text-sm font-semibold mb-sm" style={{ color: "#1f2937" }}>
              📚 Technical Documentation
            </summary>

            <div className="mt-sm">
              <div className="mb-md p-sm bg-blue-50 rounded" style={{ color: "#1f2937" }}>
                <div className="text-xs font-semibold mb-xs">FastAPI Implementation:</div>
                <pre className="text-xs m-0 overflow-auto" style={{
                  backgroundColor: "#1e293b",
                  color: "#e2e8f0",
                  padding: "0.75rem",
                  borderRadius: "0.375rem"
                }}>
<span style={{ color: "#a78bfa" }}>from</span> hotosm_auth.integrations.fastapi <span style={{ color: "#a78bfa" }}>import</span> CurrentUser{'\n'}
{'\n'}
<span style={{ color: "#a78bfa" }}>@router</span>.<span style={{ color: "#fbbf24" }}>get</span>(<span style={{ color: "#34d399" }}>"/endpoint"</span>){'\n'}
<span style={{ color: "#a78bfa" }}>async def</span> <span style={{ color: "#60a5fa" }}>my_endpoint</span>({'\n'}
{'    '}<span style={{ color: "#e2e8f0" }}>user</span>: <span style={{ color: "#f472b6" }}>CurrentUser</span>{'\n'}
):{'\n'}
{'    '}<span style={{ color: "#a78bfa" }}>return</span> {`{`}<span style={{ color: "#34d399" }}>"user_id"</span>: user.id{`}`}
                </pre>
              </div>

              <div className="p-sm bg-gray-50 rounded" style={{ color: "#1f2937" }}>
                <div className="text-xs font-semibold mb-xs">How it works:</div>
                <ul className="text-xs mb-0 pl-md" style={{ color: "#4b5563" }}>
                  <li>Extracts JWT from <code>hanko</code> cookie or Authorization header</li>
                  <li>Validates JWT signature using Hanko's public key (JWKS)</li>
                  <li>Verifies token expiration and issuer</li>
                  <li>Returns <code>HankoUser</code> object with user data</li>
                  <li>Raises 401 if token is missing, expired, or invalid</li>
                </ul>
              </div>
            </div>
          </details>
        </Card>

        {/* Endpoint 2: /api/test/osm */}
        <Card>
          <div className="mb-md">
            <h3 className="mb-xs">
              <code className="text-sm">/api/test/osm</code>
            </h3>
            <p className="text-sm text-muted">
              Requires Hanko authentication + OSM connection
            </p>
          </div>

          <Button
            appearance="outlined"
            onClick={() => testEndpoint("osm")}
            disabled={loading.osm}
            className="w-full mb-md"
          >
            <Icon slot="start" name={loading.osm ? "spinner" : "play"} />
            {loading.osm ? "Testing..." : "Test Endpoint"}
          </Button>

          {testResults.osm && (
            <div className="p-md bg-neutral-50 rounded mb-md">
              <div className="flex items-center gap-sm mb-xs">
                <Icon
                  name={testResults.osm.success ? "check-circle" : "circle-xmark"}
                  style={{
                    color: testResults.osm.success
                      ? "var(--wa-color-green-600)"
                      : "var(--wa-color-red-600)",
                  }}
                />
                <span className="font-semibold">
                  Status: {testResults.osm.status}
                </span>
              </div>
              <pre className="text-xs m-0 overflow-auto">
                {JSON.stringify(
                  testResults.osm.data || { error: testResults.osm.error },
                  null,
                  2
                )}
              </pre>
            </div>
          )}

          <details className="mt-md">
            <summary className="cursor-pointer text-sm font-semibold mb-sm" style={{ color: "#1f2937" }}>
              📚 Technical Documentation
            </summary>

            <div className="mt-sm">
              <div className="mb-md p-sm bg-blue-50 rounded" style={{ color: "#1f2937" }}>
                <div className="text-xs font-semibold mb-xs">FastAPI Implementation:</div>
                <pre className="text-xs m-0 overflow-auto" style={{
                  backgroundColor: "#1e293b",
                  color: "#e2e8f0",
                  padding: "0.75rem",
                  borderRadius: "0.375rem"
                }}>
<span style={{ color: "#a78bfa" }}>from</span> hotosm_auth.integrations.fastapi <span style={{ color: "#a78bfa" }}>import</span> ({'\n'}
{'    '}CurrentUser,{'\n'}
{'    '}OSMConnectionRequired,{'\n'}
){'\n'}
{'\n'}
<span style={{ color: "#a78bfa" }}>@router</span>.<span style={{ color: "#fbbf24" }}>get</span>(<span style={{ color: "#34d399" }}>"/endpoint"</span>){'\n'}
<span style={{ color: "#a78bfa" }}>async def</span> <span style={{ color: "#60a5fa" }}>my_endpoint</span>({'\n'}
{'    '}<span style={{ color: "#e2e8f0" }}>user</span>: <span style={{ color: "#f472b6" }}>CurrentUser</span>,{'\n'}
{'    '}<span style={{ color: "#e2e8f0" }}>osm</span>: <span style={{ color: "#f472b6" }}>OSMConnectionRequired</span>{'\n'}
):{'\n'}
{'    '}<span style={{ color: "#a78bfa" }}>return</span> {`{`}{'\n'}
{'        '}<span style={{ color: "#34d399" }}>"osm_username"</span>: osm.osm_username{'\n'}
{'    '}{`}`}
                </pre>
              </div>

              <div className="p-sm bg-gray-50 rounded" style={{ color: "#1f2937" }}>
                <div className="text-xs font-semibold mb-xs">How it works:</div>
                <ul className="text-xs mb-0 pl-md" style={{ color: "#4b5563" }}>
                  <li><strong>Hanko validation:</strong> Same JWT validation as above</li>
                  <li><strong>OSM validation:</strong> Extracts encrypted data from <code>osm_connection</code> cookie</li>
                  <li>Decrypts cookie using Fernet (symmetric encryption with COOKIE_SECRET)</li>
                  <li>Verifies OAuth token hasn't expired</li>
                  <li>Returns <code>OSMConnection</code> object with OSM user data</li>
                  <li>Raises 401 if not authenticated, 403 if OSM not connected</li>
                </ul>
              </div>
            </div>
          </details>
        </Card>
      </div>
    </div>
  );
}

export default AuthTest;
