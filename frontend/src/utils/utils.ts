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

export function formatProjectStatus(status: string): string {
  return status
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * Gets the part of an email before the "@", used as a display name when the
 * user has no name set
 * @param email - The email address
 * @returns The local part of the email, or the trimmed input if it has no "@"
 */
export function getNameFromEmail(email: string | null | undefined): string {
  const trimmed = (email ?? "").trim();
  const atIndex = trimmed.indexOf("@");
  if (atIndex === -1) {
    return trimmed;
  }
  return trimmed.slice(0, atIndex).trim();
}
