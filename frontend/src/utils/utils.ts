import { AppName } from "../portal-plans/types";

/**
 * Shortens text to a maximum length, adding an ellipsis if truncated
 * @param text - The text to shorten
 * @param maxLength - Maximum length (default: 120)
 * @returns Shortened text with ellipsis if needed
 */
export function shortenText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength - 3) + "...";
}

export function projectKey(app: AppName, project_id: string) {
  return `${app}:${project_id}`;
}
