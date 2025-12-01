import type { Locale } from "../paraglide/runtime";

//Add new languages here when adding to project.inlang/settings.json
export const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  es: "Español",
  fr: "Français",
};

export function getAvailableLangs(locale: Locale | string): string {
  return LANGUAGE_NAMES[locale] || locale;
}
