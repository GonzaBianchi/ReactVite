import { useState, useEffect } from 'react';
import axiosInstance from '../axioConfig.js';

// eslint-disable-next-line react/prop-types
const MisTurnos = ({ username }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null); // Estado para manejar mensajes
  const [user, setUser] = useState(username || ''); // Si el username viene como prop, úsalo; si no, inicializa vacío

  // Función para obtener el username del servidor si no está disponible
  const fetchUsername = async () => {
    try {
      const response = await axiosInstance.get('/session/username');
      setUser(response.data.username); // Almacena el username obtenido
    } catch (error) {
      console.error('Error fetching username:', error);
      setError('No se pudo obtener el username');
    }
  };

  // Obtener el username si no viene como prop
  useEffect(() => {
    if (!username) {
      fetchUsername(); // Si no hay username como prop, se obtiene del backend
    }
  }, [username]);

  useEffect(() => {
    if (!user) return; // Espera a que se obtenga el username

    const fetchAppointments = async () => {
      try {
        const response = await axiosInstance.get(`/appointment/user/${user}`);
        console.log(response.data);

        // Si hay un mensaje, manejarlo como estado
        if (response.data.message) {
          setMessage(response.data.message); // Establece el mensaje en el estado
          setAppointments([]); // Vacía la lista de citas
        } else {
          setAppointments(response.data.appointments); // Establece las citas
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching appointments:', error);
        setError('Error fetching appointments');
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [user]);

  if (loading) {
    return <p className="text-center text-gray-500">Loading...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Turnos de {user}</h1>

      {message ? ( // Si hay un mensaje, mostrarlo
        <p className="text-center text-gray-500">{message}</p>
      ) : appointments.length === 0 ? (
        <p className="text-center text-gray-500">No tienes turnos reservados</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto bg-white shadow-md rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-gray-700">Fecha</th>
                <th className="px-4 py-2 text-left text-gray-700">Hora</th>
                <th className="px-4 py-2 text-left text-gray-700">Servicio</th>
                <th className="px-4 py-2 text-left text-gray-700">Descripción</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment.id} className="border-b border-gray-200">
                  <td className="px-4 py-2">{new Date(appointment.day).toLocaleDateString()}</td>
                  <td className="px-4 py-2">{appointment.schedule}</td>
                  <td className="px-4 py-2">{appointment.service_name}</td>
                  <td className="px-4 py-2">{appointment.description || 'No description available'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MisTurnos;
