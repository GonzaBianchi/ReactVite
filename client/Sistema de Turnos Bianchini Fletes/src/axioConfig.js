import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
})

// Variable para evitar llamadas recursivas
let isRefreshing = false;

// Interceptor de respuesta para manejar errores globalmente
axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // Verificar si es un error 401 y no es un reintento
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Prevenir múltiples intentos de refresh
      if (isRefreshing) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Intentar refrescar el token
        await axiosInstance.post('/session/refresh-token');
        
        // Reintentar la solicitud original
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Si el refresh falla, redirigir al login
        isRefreshing = false;
        window.location.href = '/';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
)

export default axiosInstance