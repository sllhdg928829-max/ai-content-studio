import axios from 'axios'

function getApiBase() {
  const saved = localStorage.getItem('api_base_url')
  if (saved) return saved
  return import.meta.env.VITE_API_URL || '/api'
}

const api = axios.create({
  baseURL: getApiBase(),
})

api.interceptors.request.use((config) => {
  config.baseURL = getApiBase()
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/#/login'
    }
    return Promise.reject(err)
  }
)

export function setApiBaseUrl(url) {
  localStorage.setItem('api_base_url', url)
}

export function getApiBaseUrl() {
  return getApiBase()
}

export default api
