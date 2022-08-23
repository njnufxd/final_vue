import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'

Vue.config.productionTip = false

// 导入全局样式表
import './assets/css/global.scss'

// 导入axios
import axios from 'axios';
axios.defaults.headers['Cross-Method'] = 'CORS'
axios.defaults.withCredentials=true
axios.defaults.baseURL = "http://final.lppnb.top"
axios.interceptors.request.use(config => {
  config.headers.Authorization =  'cookie' 
  return config
})
Vue.prototype.$http = axios

// 导入qs类库
import qs from 'qs'
Vue.prototype.$qs = qs

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
