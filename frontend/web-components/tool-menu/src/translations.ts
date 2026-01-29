/**
 * Translations for the hotosm-tool-menu web component
 **/

export interface Translations {
  imagery: string;
  mapping: string;
  field: string;
  data: string;
}

export const translations: Record<string, Translations> = {
  en: {
    imagery: "Imagery",
    mapping: "Mapping",
    field: "Field",
    data: "Data",
  },
  es: {
    imagery: "Imágenes",
    mapping: "Mapeo",
    field: "Campo",
    data: "Datos",
  },
  fr: {
    imagery: "Imagerie",
    mapping: "Cartographie",
    field: "Terrain",
    data: "Données",
  },
  pt: {
    imagery: "Imagens",
    mapping: "Mapeamento",
    field: "Campo",
    data: "Dados",
  },
};
