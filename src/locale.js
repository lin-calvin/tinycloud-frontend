import { configureLocalization } from "@lit/localize";

export const supportedLocales = ["en", "zh-CN"];
export const { getLocale, setLocale } = configureLocalization({
  sourceLocale: "en",
  targetLocales: supportedLocales,
  loadLocale: (locale) => import(`/static/locale/${locale}.js`),
});

export const decideLocale=(localeName)=>{
  if (suppprtedLocales.includes(localeName)){
    return localeName
  }
  if (localeName.startsWith('en')){
    return 'en'
  }
  if (localeName.startsWith('zh')){
    return 'zh-CN'
  }
  return undefined
}
