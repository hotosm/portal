import { useState } from "react";
import Card from "../components/shared/Card";
import WaSwitch from "@awesome.me/webawesome/dist/react/switch/index.js";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "hotosm-auth": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          "hanko-url"?: string;
          "base-path"?: string;
          "osm-enabled"?: boolean;
          "osm-required"?: boolean;
          "osm-scopes"?: string;
          "show-profile"?: boolean;
          "redirect-after-login"?: string;
          debug?: boolean;
        },
        HTMLElement
      >;
    }
  }
}

function HankoTest() {
  const [osmEnabled, setOsmEnabled] = useState(false);
  const [osmRequired, setOsmRequired] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [debug, setDebug] = useState(false);

  return (
    <div className="container-xl py-lg">
      <div className="mb-lg">
        <h1>Hanko Authentication Test</h1>
        <p className="text-muted">
          Test the Hanko authentication component with different configurations.
        </p>
      </div>

      <div className="grid gap-lg" style={{ gridTemplateColumns: "1fr 1fr" }}>
        {/* Controls */}
        <Card>
          <h2 className="mb-md">Configuration</h2>

          <div className="flex flex-col gap-md">
            {/* OSM Enabled */}
            <div className="flex items-center gap-sm">
              <WaSwitch
                checked={osmEnabled}
                onWaChange={(e: any) => setOsmEnabled(e.target.checked)}
              />
              <div className="cursor-pointer" onClick={() => setOsmEnabled(!osmEnabled)}>
                <div className="font-semibold">OSM Enabled</div>
                <div className="text-sm text-muted">
                  Show OpenStreetMap login option
                </div>
              </div>
            </div>

            {/* OSM Required */}
            <div
              className="flex items-center gap-sm"
              style={{ opacity: osmEnabled ? 1 : 0.5 }}
            >
              <WaSwitch
                checked={osmRequired}
                onWaChange={(e: any) => setOsmRequired(e.target.checked)}
                disabled={!osmEnabled}
              />
              <div className={osmEnabled ? "cursor-pointer" : "cursor-not-allowed"} onClick={() => osmEnabled && setOsmRequired(!osmRequired)}>
                <div className="font-semibold">OSM Required</div>
                <div className="text-sm text-muted">
                  Force OSM authentication (requires OSM Enabled)
                </div>
              </div>
            </div>

            {/* Show Profile */}
            <div className="flex items-center gap-sm">
              <WaSwitch
                checked={showProfile}
                onWaChange={(e: any) => setShowProfile(e.target.checked)}
              />
              <div className="cursor-pointer" onClick={() => setShowProfile(!showProfile)}>
                <div className="font-semibold">Show Profile</div>
                <div className="text-sm text-muted">
                  Display user profile when logged in
                </div>
              </div>
            </div>

            {/* Debug Mode */}
            <div className="flex items-center gap-sm">
              <WaSwitch
                checked={debug}
                onWaChange={(e: any) => setDebug(e.target.checked)}
              />
              <div className="cursor-pointer" onClick={() => setDebug(!debug)}>
                <div className="font-semibold">Debug Mode</div>
                <div className="text-sm text-muted">
                  Show debug information in console
                </div>
              </div>
            </div>
          </div>

          {/* Current Config Display */}
          <div className="mt-md p-md bg-neutral-50 rounded">
            <div className="text-sm font-semibold mb-xs text-muted">
              Current Configuration:
            </div>
            <pre className="text-xs m-0">
              {JSON.stringify(
                {
                  "osm-enabled": osmEnabled,
                  "osm-required": osmRequired,
                  "show-profile": showProfile,
                  debug: debug,
                },
                null,
                2
              )}
            </pre>
          </div>
        </Card>

        {/* Component Preview */}
        <Card>
          <h2 className="mb-md">Component Preview</h2>

          <div className="p-lg bg-white rounded border border-red-500">
            <hotosm-auth
              osm-enabled={osmEnabled}
              osm-required={osmRequired}
              show-profile={showProfile}
              debug={debug}
            />
          </div>

          <div className="mt-md p-sm bg-blue-50 rounded text-sm">
            <strong>ℹ️ Note:</strong> Check the browser console for CORS errors
            or authentication events. The component connects to{" "}
            <code className="bg-white px-xs py-xxs rounded">
              {window.HANKO_URL || "https://dev.login.hotosm.org"}
            </code>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default HankoTest;
