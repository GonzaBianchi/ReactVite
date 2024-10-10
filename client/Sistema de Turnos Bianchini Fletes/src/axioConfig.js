// src/axiosConfig.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
});

// Interceptor de respuesta para manejar errores globalmente
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    // Manejar errores de autenticación o cualquier otro tipo de error
    if (error.response.status === 401) {
      // Por ejemplo, redirigir al login si la sesión ha expirado
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
