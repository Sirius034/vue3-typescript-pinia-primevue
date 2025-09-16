import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import MyTheme from './themes/my-theme'
import {
  Button,
  InputText,
  Select,
  Password,
  Textarea,
  Card,
  Message
} from 'primevue'
import i18n from './i18n'
import App from './App.vue'

import '@/assets/main.css'

const app = createApp(App)

app.use(i18n)

app.use(createPinia())
app.use(PrimeVue, {
  ripple: true,
  theme: {
    preset: MyTheme,
  }
});
app.component('PrButton', Button)
app.component('PrInputText', InputText)
app.component('PrSelect', Select)
app.component('PrPassword', Password)
app.component('PrTextarea', Textarea)
app.component('PrDataView', DataView )
app.component('PrCard', Card)
app.component('PrMessage', Message)

app.mount('#app')
