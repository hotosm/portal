import type { TranslatableField } from './types'

// Fields login translates. Adding one means listing it here in constants.ts,
// adding it to TranslatableField in types.ts and rendering it with fieldLang(),
// so its lang and the fallback note come along.
const TRANSLATABLE_FIELDS: readonly TranslatableField[] = ['description', 'tagline', 'video_url']

export { TRANSLATABLE_FIELDS }
