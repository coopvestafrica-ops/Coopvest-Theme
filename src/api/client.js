import axios from 'axios'
import { useAuthStore } from '../store/authStore'

// Use the WordPress REST API endpoint as the base URL
const API_BASE_URL = window.coopvestData?.apiUrl || import.meta.env.VITE_API_URL || '/wp-json/coopvest/v1'

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  
  // Add request ID for tracking
  config.headers['X-Request-ID'] = Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
  
  return config
})

// Handle responses
client.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config

    // Handle 401 errors (Unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      // Try to refresh token
      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken
          })

          const { access_token } = response.data.data
          localStorage.setItem('token', access_token)

          originalRequest.headers.Authorization = `Bearer ${access_token}`
          return client(originalRequest)
        }
      } catch (refreshError) {
        // Redirect to login if refresh fails
        useAuthStore.getState().logout()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }
    
    // For other errors, just reject
    return Promise.reject(error.response?.data || error)
  }
)

export default client
