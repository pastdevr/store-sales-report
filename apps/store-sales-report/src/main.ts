import { createApp } from 'vue'
import { startMockApi } from '@store-sales-report/data/browser'
import App from './App.vue'
import './style.css'

startMockApi().then(() => createApp(App).mount('#app'))
