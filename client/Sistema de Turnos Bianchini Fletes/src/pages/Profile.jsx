import { useEffect, useState } from 'react';
import axiosInstance from '../axioConfig.js';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axiosInstance.get('/user/profile');
        console.log(response.data);
        setUser(response.data);
      } catch (error) {
        console.error('Error al obtener el perfil', error);
        setError('No se pudo cargar el perfil del usuario');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return <div>Cargando perfil...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!user) {
    return <div>No se encontró información del usuario</div>;
  }

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