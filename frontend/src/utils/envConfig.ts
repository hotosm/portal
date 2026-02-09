/**
 * Environment configuration utility.
 * Detects the current environment based on the hostname and provides
 * the appropriate URLs for external services.
 */

type Environment = "local" | "test" | "production";

/**
 * Detect the current environment based on the hostname.
 */
export function getEnvironment(): Environment {
  const hostname = window.location.hostname;

  if (hostname.endsWith(".hotosm.test") || hostname === "localhost" || hostname === "127.0.0.1") {
    return "local";
  }

  if (hostname.includes("testlogin.") || hostname.includes("test.")) {
    return "test";
  }

  return "production";
}

/**
 * fAIr frontend URLs per environment.
 */
const FAIR_URLS: Record<Environment, string> = {
  local: "https://fair.hotosm.test",
  test: "https://testlogin.fair.hotosm.org",
  production: "https://fair.hotosm.org",
};

/**
 * Get the fAIr frontend base URL for the current environment.
 */
export function getFairBaseUrl(): string {
  return FAIR_URLS[getEnvironment()];
}

/**
 * Get the full URL for a fAIr model.
 */
export function getFairModelUrl(modelId: number): string {
  return `${getFairBaseUrl()}/ai-models/${modelId}`;
}

/**
 * Get the full URL for a fAIr dataset.
 */
export function getFairDatasetUrl(datasetId: number): string {
  return `${getFairBaseUrl()}/training-datasets/${datasetId}`;
}

/**
 * uMap frontend URLs per environment.
 */
const UMAP_URLS: Record<Environment, string> = {
  local: "https://umap.hotosm.test",
  test: "https://testlogin.umap.hotosm.org",
  production: "https://umap.hotosm.org",
};

/**
 * Get the uMap frontend base URL for the current environment.
 */
export function getUmapBaseUrl(): string {
  return UMAP_URLS[getEnvironment()];
}

/**
 * Drone Tasking Manager frontend URLs per environment.
 */
const DRONE_TM_URLS: Record<Environment, string> = {
  local: "https://dronetm.hotosm.test",
  test: "https://testlogin.dronetm.hotosm.org",
  production: "https://dronetm.org",
};

/**
 * Get the Drone TM frontend base URL for the current environment.
 */
export function getDroneTmBaseUrl(): string {
  return DRONE_TM_URLS[getEnvironment()];
}
