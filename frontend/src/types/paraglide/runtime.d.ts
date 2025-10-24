declare module '*/paraglide/runtime' {
  export type Locale = 'en' | 'es' | 'fr';

  export const baseLocale: 'en';
  export const locales: readonly ['en', 'es', 'fr'];
  export const cookieName: string;
  export const cookieMaxAge: number;
  export const cookieDomain: string;
  export const localStorageKey: string;

  export function getLocale(): Locale;
  export function setLocale(locale: Locale, options?: { reload?: boolean }): void | Promise<void>;
  export function isLocale(locale: any): locale is Locale;
  export function assertIsLocale(input: any): Locale;
}
