import Button from '../../components/shared/Button'
import Dropdown from '../../components/shared/Dropdown'
import DropdownItem from '../../components/shared/DropdownItem'
import { m } from '../../paraglide/messages'
import type { OrgLanguageSelectProps } from '../types'
import { nativeLanguageName } from '../utils'

/**
 * Picks the language of an org's profile content, among the ones the org has.
 */
function OrgLanguageSelect({
  availableLocales,
  baseLocale,
  contentLang,
  onSelect,
}: OrgLanguageSelectProps) {
  if (availableLocales.length <= 1) return null

  return (
    <section className="flex flex-col gap-sm mb-lg">
      <Dropdown onSelect={onSelect}>
        <Button slot="trigger" appearance="outlined" withCaret>
          <span lang={contentLang}>{nativeLanguageName(contentLang)}</span>
        </Button>
        {availableLocales.map((code) => (
          <DropdownItem
            key={code}
            value={code}
            type="checkbox"
            checked={code === contentLang}
          >
            <span lang={code}>{nativeLanguageName(code)}</span>
            {code === baseLocale &&
              ` ${m.org_profile_language_original()}`}
          </DropdownItem>
        ))}
      </Dropdown>
    </section>
  )
}

export default OrgLanguageSelect
