import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import ptTranslations from '../locales/pt.json';
import enTranslations from '../locales/en.json';

const deviceLanguage = Localization.getLocales()[0]?.languageCode || 'pt';

i18n
    .use(initReactI18next)
    .init({
        compatibilityJSON: 'v3',
        resources: {
            pt: {
                translation: ptTranslations.translation,
            },
            en: {
                translation: enTranslations.translation,
            },
        },
        lng: deviceLanguage,
        fallbackLng: 'pt',
        interpolation: {
            escapeValue: false,
        },
        react: {
            useSuspense: false,
        },
    });

export default i18n;