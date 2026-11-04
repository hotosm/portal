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

/**
 * Gets the name to show for a user across Portal
 * @param user - The user's first name, last name and email
 * @returns "first_name last_name" (trimmed, skipping empty parts), else the
 * part of the email before the "@", else ""
 */
export function getUsername(user: {
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
}): string {
  const fullName = [user.first_name, user.last_name]
    .map((part) => (part ?? "").trim())
    .filter(Boolean)
    .join(" ");
  return fullName || getNameFromEmail(user.email);
}
