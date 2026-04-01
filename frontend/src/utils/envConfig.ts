/**
 * Environment configuration utility.
 * Detects the current environment based on the hostname and provides
 * the appropriate URLs for external services.
 */

type Environment = "local" | "test" | "production";

/**
 * Detect the current environment based on the hostname.
 * - local:      *.hotosm.test, localhost, 127.0.0.1
 * - test:       dev.* (e.g. dev.portal.hotosm.org) or testlogin.*
 * - production: everything else
 */
export function getEnvironment(): Environment {
  const hostname = window.location.hostname;

  if (hostname.endsWith(".hotosm.test") || hostname === "localhost" || hostname === "127.0.0.1") {
    return "local";
  }

  if (hostname.startsWith("dev.") || hostname.includes("testlogin.")) {
    return "test";
  }

  return "production";
}

/**
 * fAIr frontend URLs per environment.
 */
const FAIR_URLS: Record<Environment, string> = {
  local: "https://fair.hotosm.test",
  test: "https://fair.testlogin.hotosm.org",
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
  return `${getFairBaseUrl()}/datasets/${datasetId}`;
}

/**
 * uMap frontend URLs per environment.
 */
const UMAP_URLS: Record<Environment, string> = {
  local: "https://umap.hotosm.test",
  test: "https://umap-dev.hotosm.org",
  production: "https://umap.hotosm.org",
};

/**
 * Get the uMap frontend base URL for the current environment.
 */
export function getUmapBaseUrl(): string {
  return UMAP_URLS[getEnvironment()];
}

/**
 * Export Tool frontend URLs per environment.
 */
const EXPORT_TOOL_URLS: Record<Environment, string> = {
  local: "https://export-tool.hotosm.test",
  test: "https://export.testlogin.hotosm.org",
  production: "https://export.hotosm.org",
};

export function getExportToolBaseUrl(): string {
  return EXPORT_TOOL_URLS[getEnvironment()];
}

export function getExportToolJobUrl(jobUid: string): string {
  return `${getExportToolBaseUrl()}/v3/exports/${jobUid}`;
}

/**
 * ChatMap frontend URLs per environment.
 */
const CHATMAP_URLS: Record<Environment, string> = {
  local: "https://chatmap.hotosm.test",
  test: "https://chatmap.hotosm.org",
  production: "https://chatmap.hotosm.org",
};

export function getChatMapBaseUrl(): string {
  return CHATMAP_URLS[getEnvironment()];
}

/**
 * Drone Tasking Manager frontend URLs per environment.
 */
const DRONE_TM_URLS: Record<Environment, string> = {
  local: "https://dronetm.hotosm.test",
  test: "https://dronetm.testlogin.hotosm.org",
  production: "https://dronetm.org",
};

/**
 * Get the Drone TM frontend base URL for the current environment.
 */
export function getDroneTmBaseUrl(): string {
  return DRONE_TM_URLS[getEnvironment()];
}
