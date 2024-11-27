import { useState, useEffect } from 'react';
import axiosInstance from '../axioConfig.js';
import { toast } from 'sonner';

export const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [role, setRole] = useState('');
    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const verifyAuth = async () => {
            try {
                const response = await axiosInstance.get('/session/role');
                setIsAuthenticated(true);
                setRole(response.data.role);
                setUsername(response.data.username);
            } catch (error) {
                setIsAuthenticated(false);
                setRole('');
                setUsername('');
                if (error.response?.status === 403) {
                    toast.error('Sesión expirada. Por favor, inicie sesión nuevamente.');
                }
            } finally {
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
        setIsAuthenticated, 
        setRole, 
        setUsername 
    };
};

