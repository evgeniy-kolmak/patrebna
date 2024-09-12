import i18n from 'i18next';
import translations from './locales';

void i18n.init({
  lng: 'ru',
  fallbackLng: 'by',
  resources: translations,
  defaultNS: 'translations',
});
