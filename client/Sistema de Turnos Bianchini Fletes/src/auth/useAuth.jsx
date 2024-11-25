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
                // Si falla, significa que no hay autenticación válida
                setIsAuthenticated(false);
                setRole('');
                setUsername('');
                
                // Si hay un error específico de autenticación
                if (error.response && error.response.status === 401) {
                    // Token no proporcionado o inválido
                    setAuthError('No autorizado');
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