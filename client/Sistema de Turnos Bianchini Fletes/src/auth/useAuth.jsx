import { useState, useEffect } from 'react';
import axiosInstance from '../axioConfig';

// In useAuth.js
export const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [role, setRole] = useState('');
    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [authError, setAuthError] = useState(null);
  
    useEffect(() => {
        const verifyAuth = async () => {
          try {
            const hasAccessToken = document.cookie.includes('access_token');
            const hasRefreshToken = document.cookie.includes('refresh_token');
      
            if (!hasAccessToken && hasRefreshToken) {
              const refreshResponse = await axiosInstance.post('/session/refresh-token');
              
              if (refreshResponse.status === 200) {
                const roleResponse = await axiosInstance.get('/session/role');
                setIsAuthenticated(true);
                setRole(roleResponse.data.role);
                setUsername(roleResponse.data.username);
              }
            } else if (hasAccessToken) {
              const response = await axiosInstance.get('/session/role');
              setIsAuthenticated(true);
              setRole(response.data.role);
              setUsername(response.data.username);
            } else {
              setIsAuthenticated(false);
            }
          } catch (error) {
            setIsAuthenticated(false);
            setRole('');
            setUsername('');
            setAuthError(error.response?.data?.message || 'Authentication failed');
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
      authError, 
      setIsAuthenticated, 
      setRole, 
      setUsername 
    };
  };