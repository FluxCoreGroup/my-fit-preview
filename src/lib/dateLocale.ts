import { fr } from "date-fns/locale/fr";
import { enUS } from "date-fns/locale/en-US";
import { nl } from "date-fns/locale/nl";
import type { Locale } from "date-fns";

const locales: Record<string, Locale> = { fr, en: enUS, nl };

export const getDateLocale = (lang: string): Locale => locales[lang] || fr;
