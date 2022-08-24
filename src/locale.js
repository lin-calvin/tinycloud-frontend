import {configureLocalization} from '@lit/localize';

export const {getLocale, setLocale} = configureLocalization({
  sourceLocale:'en',
  targetLocales:['en','zh-Hans'],
  loadLocale: (locale) => import(`/static/locale/${locale}.js`),
});
