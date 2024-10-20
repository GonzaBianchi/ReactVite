import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../axioConfig'
import { Toaster, toast } from 'sonner'

// eslint-disable-next-line react/prop-types
const Login = ({ setIsAuthenticated,  setRole, setUsernameSession }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axiosInstance.post('/session/login', {
        username,
        password,
      });

      if (response.status === 200) {
        setIsAuthenticated(true); // Actualiza el estado de autenticación
        localStorage.setItem('isAuthenticated', 'true');

        const { role, username } = response.data;
        setRole(role);
        setUsernameSession(username);
        navigate('/'); // Navega al perfil si el login es exitoso
      }
    } catch (error) {
      console.error('Error en el inicio de sesión', error);
      toast.error(error.response.data.error);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <Toaster position="bottom-right" closeButton richColors />
      <h1 className="text-2xl font-bold mb-4">Iniciar Sesión</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">Usuario</label>
          <input 
            type="text" 
            id="username" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña</label>
          <input 
            type="password" 
            id="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded-md">Iniciar Sesión</button>
      </form>
    </div>
  );
};

export default Login;
