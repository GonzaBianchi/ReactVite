// src/pages/Register.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axioConfig'; // Importa la instancia de Axios

const Register = () => {
  const navigate = useNavigate();
  const isAuthenticated = !!document.cookie.match(/access_token/);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/'); // Redirige al perfil si el usuario ya está autenticado
    }
  }, [isAuthenticated, navigate]);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axiosInstance.post('/session/register', {
        first_name: firstName,
        last_name: lastName,
        phone,
        email,
        username,
        password,
      });

      if (response.status === 201) {
        navigate('/login'); // Navega al login si el registro es exitoso
      }
    } catch (error) {
      console.error('Error en el registro', error);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">Registro</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">Nombre</label>
          <input 
            type="text" 
            id="firstName" 
            value={firstName} 
            onChange={(e) => setFirstName(e.target.value)} 
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Apellido</label>
          <input 
            type="text" 
            id="lastName" 
            value={lastName} 
            onChange={(e) => setLastName(e.target.value)} 
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Celular</label>
          <input 
            type="text" 
            id="phone" 
            value={phone} 
            onChange={(e) => setPhone(e.target.value)} 
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input 
            type="email" 
            id="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">Usuario</label>
          <input 
            type="text" 
            id="username" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            required
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
            required
          />
        </div>
        <button type="submit" className="w-full bg-green-500 text-white p-2 rounded-md">Registrarse</button>
      </form>
    </div>
  );
};

export default Register;