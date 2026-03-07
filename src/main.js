// main.js
import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import router from './router'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'bootstrap-icons/font/bootstrap-icons.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
// Global project styles (fonts, base variables)
import '@/assets/base.css'
import '@/assets/main.css'

// Set favicon to project logo (SPORTSY__1_-removebg-preview.png)
import faviconUrl from '@/assets/SPORTSY__1_-removebg-preview.png'

const setFavicon = (href) => {
	const link = document.querySelector("link[rel~='icon']")
	if (link) link.href = href
	else {
		const l = document.createElement('link')
		l.rel = 'icon'
		l.href = href
		document.head.appendChild(l)
	}
}

setFavicon(faviconUrl)

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
