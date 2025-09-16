import { createI18n } from 'vue-i18n'
import locales from './locales'

export default createI18n({
  legacy: false,
  locale: 'ru',
  messages: locales
})
