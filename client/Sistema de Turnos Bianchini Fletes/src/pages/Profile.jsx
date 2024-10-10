// src/pages/Profile.jsx
import { useEffect, useState } from 'react';
import axiosInstance from '../axioConfig'; // Importa la instancia de Axios

const Profile = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axiosInstance.get('/user/profile');
        setUser(response.data); // Establece los datos del usuario en el estado
      } catch (error) {
        console.error('Error al obtener el perfil', error);
      }
    };

    fetchProfile();
  }, []);

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-6">Perfil de Usuario</h1>
      <p>Bienvenido a tu perfil, {user.username}. Disfruta de las funciones disponibles para usuarios.</p>
      <p><strong>Nombre de usuario:</strong> {user.username}</p>
      <p><strong>Nombre:</strong> {user.first_name}</p>
      <p><strong>Apellido:</strong> {user.last_name}</p>
      <p><strong>Teléfono:</strong> {user.phone}</p>
      <p><strong>Email:</strong> {user.email}</p>
    </div>
  );
};

export default Profile;
