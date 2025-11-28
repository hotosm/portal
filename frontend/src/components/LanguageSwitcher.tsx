import { useLanguage } from "../contexts/LanguageContext";
import type { Locale } from "../paraglide/runtime";
import { getAvailableLangs } from "../utils/languages";
import Button from "./shared/Button";
import Dropdown from "./shared/Dropdown";
import DropdownItem from "./shared/DropdownItem";
function LanguageSwitcher() {
  const { currentLanguage, setLanguage, availableLanguages } = useLanguage();

  const handleLanguageSelect = (event: CustomEvent) => {
    const selectedLang = event.detail.item.value;
    setLanguage(selectedLang);
  };

  return (
    <Dropdown onSelect={handleLanguageSelect}>
      <Button slot="trigger" appearance="outlined">
        {getAvailableLangs(currentLanguage)}
      </Button>
      {availableLanguages.map((lang: Locale) => (
        <DropdownItem key={lang} value={lang}>
          {getAvailableLangs(lang)}
        </DropdownItem>
      ))}
    </Dropdown>
  );
}

export default LanguageSwitcher;
