// src/service/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization'; // Para detectar o idioma do dispositivo

// Importar os arquivos de tradução
import ptTranslations from '../locales/pt.json';
import enTranslations from '../locales/en.json';

// Obter o idioma do dispositivo
const deviceLanguage = Localization.getLocales()[0]?.languageCode || 'pt'; // 'pt' como fallback

// Configuração do i18next
i18n
    .use(initReactI18next) // Passa a instância do i18n para o react-i18next
    .init({
        compatibilityJSON: 'v3',
        resources: {
            // Estrutura: languageCode: { namespace: translations }
            pt: {
                translation: ptTranslations.translation, // Acessa o objeto 'translation' dentro do JSON
            },
            en: {
                translation: enTranslations.translation,
            },
        },
        lng: deviceLanguage, // Define o idioma inicial com base no dispositivo ou fallback
        fallbackLng: 'pt', // Idioma a ser usado caso o idioma detectado não tenha tradução
        interpolation: {
            escapeValue: false, // React já faz escaping, evita dupla escapagem
        },
        react: {
            useSuspense: false, // Desativa o Suspense se não estiver usando
        },
    });

export default i18n;