import { useState, useEffect } from 'react';
import axiosInstance from '../axioConfig';

export const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [role, setRole] = useState('');
    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [authError, setAuthError] = useState(null);
  
    useEffect(() => {
        const verifyAuth = async () => {
            try {
                // Intentar obtener el rol desde el backend
                const response = await axiosInstance.get('/session/role');
                
                // Si la solicitud es exitosa, establecer autenticación
                setIsAuthenticated(true);
                setRole(response.data.role);
                setUsername(response.data.username);
            } catch (error) {
                // Si falla, intentar refrescar el token
                console.log('Error de autenticación:', error);
                try {
                    await axiosInstance.post('/session/refresh-token');
                    // Si el refresh token es válido, volver a intentar obtener el rol
                    const refreshResponse = await axiosInstance.get('/session/role');
                    setIsAuthenticated(true);
                    setRole(refreshResponse.data.role);
                    setUsername(refreshResponse.data.username);
                } catch (refreshError) {
                    // Si el refresh token también falla
                    setIsAuthenticated(false);
                    setRole('');
                    setUsername('');
                    setAuthError('Sesión expirada', refreshError);
                }
            } finally {
                // Finalizar la carga independientemente del resultado
                setIsLoading(false);
            }
        };
      
        verifyAuth();
    }, []);
  
    return { 
        isAuthenticated, 
        role, 
        username, 
        isLoading, 
        authError, 
        setIsAuthenticated, 
        setRole, 
        setUsername 
    };
};