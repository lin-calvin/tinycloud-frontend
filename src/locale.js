import { configureLocalization } from "@lit/localize";

export const supportedLocales = ["en", "zh-CN"];
export const { getLocale, setLocale } = configureLocalization({
  sourceLocale: "en",
  targetLocales: supportedLocales,
  loadLocale: (locale) => import(`/static/locale/${locale}.js`),
});
